"""Owner-only loopback routes for the explicitly synthetic ARC pilot."""

from typing import Literal
from uuid import UUID

from fastapi import APIRouter, HTTPException, Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.routing import APIRoute
from pydantic import BaseModel, ConfigDict, Field

from backend import pilot
from backend.vault_routes import local_request

class NoStoreRoute(APIRoute):
    def get_route_handler(self):
        handler = super().get_route_handler()

        async def no_store(request: Request):
            try:
                # Check the trusted local origin before parsing even a simple
                # cross-port POST. Cookies/ownership remain checked by handlers.
                local_request(request)
                response = await handler(request)
            except HTTPException as exc:
                return JSONResponse({"detail": exc.detail}, status_code=exc.status_code,
                                    headers={**(exc.headers or {}), "Cache-Control": "no-store"})
            except RequestValidationError:
                # Validation errors can reflect private input; give a value-free error.
                return JSONResponse({"detail": "Invalid pilot request. Check field types and input bounds."},
                                    status_code=422, headers={"Cache-Control": "no-store"})
            response.headers["Cache-Control"] = "no-store"
            return response
        return no_store


# Pilot JSON may omit Content-Type to avoid browser-bridge preflight failures.
# The route wrapper requires loopback + an exact allowed Origin BEFORE parsing;
# this never relaxes the existing public/profile API or owner-cookie boundary.
router = APIRouter(prefix="/api/pilot", route_class=NoStoreRoute, strict_content_type=False)
COOKIE = "arc_pilot_owner"


def _owner(request: Request, response: Response) -> str:
    local_request(request)
    response.headers["Cache-Control"] = "no-store"
    token = request.cookies.get(COOKIE)
    if not token:
        raise HTTPException(404, "Pilot not created.", headers={"Cache-Control": "no-store"})
    return token


def _error(exc: pilot.PilotError):
    raise HTTPException(exc.status_code, str(exc), headers={"Cache-Control": "no-store"}) from None


class Journal(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    revision: int = Field(ge=0)
    journal: str = Field(min_length=1, max_length=12000)
    release_facts: list[str] = Field(max_length=20)
    mode: Literal["sealed", "local", "represent"]


class Mandate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    revision: int = Field(ge=0)
    source_entry_ids: list[str] = Field(min_length=1, max_length=1)
    peer_ids: list[str] = Field(min_length=2, max_length=2)
    expires_in_hours: int = Field(ge=1, le=24)


class Run(BaseModel):
    model_config = ConfigDict(extra="forbid")
    request_id: UUID
    revision: int = Field(ge=0)


@router.get("")
async def get_pilot(request: Request, response: Response):
    token = _owner(request, response)
    try:
        return pilot.view(token)
    except pilot.PilotError as exc:
        _error(exc)


@router.post("/create")
async def create_pilot(request: Request, response: Response):
    local_request(request)
    response.headers["Cache-Control"] = "no-store"
    state, token = pilot.create(request.cookies.get(COOKIE))
    response.set_cookie(COOKIE, token, httponly=True, samesite="strict", path="/api/pilot",
                        max_age=365 * 24 * 60 * 60, secure=request.url.scheme == "https")
    return state


@router.post("/agents/{agent_id}/journal")
async def update_journal(agent_id: str, body: Journal, request: Request, response: Response):
    token = _owner(request, response)
    if any(not text or len(text) > 1000 for text in body.release_facts):
        raise HTTPException(422, "Use nonblank release facts of at most 1,000 characters.", headers={"Cache-Control": "no-store"})
    try:
        return pilot.update_journal(token, agent_id, body.revision, body.journal, body.release_facts, body.mode)
    except pilot.PilotError as exc:
        _error(exc)


@router.post("/agents/{agent_id}/mandate")
async def grant_mandate(agent_id: str, body: Mandate, request: Request, response: Response):
    token = _owner(request, response)
    try:
        return pilot.grant(token, agent_id, body.revision, body.source_entry_ids, body.peer_ids, body.expires_in_hours)
    except pilot.PilotError as exc:
        _error(exc)


@router.delete("/agents/{agent_id}/mandate")
@router.post("/agents/{agent_id}/pause")
async def pause_mandate(agent_id: str, request: Request, response: Response):
    token = _owner(request, response)
    try:
        return pilot.pause(token, agent_id)
    except pilot.PilotError as exc:
        _error(exc)


@router.post("/run")
async def run_pilot(body: Run, request: Request, response: Response):
    token = _owner(request, response)
    try:
        return await pilot.run(token, str(body.request_id), body.revision)
    except pilot.PilotError as exc:
        _error(exc)
