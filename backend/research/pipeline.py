"""Connect the existing investigation lifecycle to the recursive engine."""

import asyncio
import json
import math
import os
from pathlib import Path

import httpx

from backend.replay_research import replay, import_case
from backend.storage import database_path
from backend.graph_models import PortraitSection
from .blackboard import Blackboard
from .evidence import EvidenceReader
from .models import RunPolicy, TaskProposal
from .scheduler import ResearchGoal, run_research
from .projection import (
    SECTIONS,
    project_case,
    PortraitEvidencePacket,
    synthesize_portrait,
)
from .eval_model import (
    EvaluationModel,
    EvaluationLedger,
    ModelOnlyTransport,
    MODEL,
    MAX_CALLS,
    RESERVATION_USD,
)
from .eval_adapters import (
    CachedModelWorker,
    CachedModelCritic,
    CachedPortrait,
    ExtractedClaims,
)
from .parsing import parse_model_json

CACHED_PROFILE = "543e4074-d81b-4ec5-993d-d23c36794c83"


def research_directory(session_id):
    return (
        Path(os.getenv("ARC_RESEARCH_DIR", str(database_path().parent / "research")))
        / session_id
    )


def saved_portrait(board, run_id):
    """Reuse saved model interpretations; remap only hash-identical source spans."""
    directory = Path(
        os.getenv("ARC_CACHED_MODEL_EVAL_DIR", "/private/tmp/arc-cached-model-eval")
    )
    if not (directory / "response-05.json").exists():
        return []
    request = json.loads((directory / "request-05.json").read_text())
    supplied = json.loads(request["messages"][0]["content"])
    old_spans = {s["id"]: s for s in supplied["spans"]}
    response = json.loads((directory / "response-05.json").read_text())
    from .projection import PortraitDraft

    candidate = parse_model_json(
        "".join(b["text"] for b in response["content"] if b["type"] == "text"),
        PortraitDraft,
    )
    reader = EvidenceReader(board, run_id)
    sections = []
    for section in candidate.sections:
        try:
            remapped = []
            for sid in section.span_ids:
                original = old_spans[sid]
                source = board._get(run_id, "source", original["evidence_id"])
                if source["hash"] != original["snapshot_hash"]:
                    raise ValueError("Snapshot mismatch")
                remapped.append(
                    reader.add_span(
                        original["evidence_id"],
                        original["pointer"],
                        original["text"],
                        original["start"],
                        original["end"],
                    ).id
                )
            if not remapped:
                section.support_status = "INSUFFICIENT_EVIDENCE"
                section.title = section.section.replace("_", " ").title()
                section.analysis = "The reviewed evidence does not establish this part of the portrait."
                section.limitations = "The saved model response supplied no exact passage citation for this section."
            section.span_ids = remapped
            if remapped:
                section.evidence_ids = list(
                    dict.fromkeys(reader.read_span(s).evidence_id for s in remapped)
                )
            sections.append(section)
        except (KeyError, ValueError):
            sections.append(
                PortraitSection(
                    section=section.section,
                    title=section.section.replace("_", " ").title(),
                    analysis="The saved interpretation could not be matched to the current evidence.",
                    limitations="Source snapshot or passage mismatch; interpretation withheld.",
                    evidence_ids=section.evidence_ids,
                    support_status="INSUFFICIENT_EVIDENCE",
                )
            )
    return sections


async def run_workspace_research(run):
    pad = run.scratchpad
    directory = research_directory(pad.session_id)
    run.research_case_path = str(directory / "case.sqlite3")
    run.research_run_id = (
        "replay-" + run.cached_source_session_id
        if run.cached_source_session_id
        else pad.session_id
    )
    run.persist()
    phase = "recursive_research"
    ledger = None
    usage_reported = False
    try:
        if run.cached_source_session_id:
            pad.emit(
                {
                    "type": "research.mode",
                    "text": "Cached profile replay · no new model or source calls. Research decisions use reviewed fixtures; the portrait reuses saved model interpretations.",
                    "mode": "cached_replay",
                }
            )
            pad.emit(
                {
                    "type": "agent.text",
                    "text": "I’m reviewing the saved Stela, Flightdeck and Open Agent Network evidence. I’ll keep each claim linked to its exact source and show where independent proof is missing.",
                    "subagent": "orchestrator",
                }
            )
            await replay(
                database_path(),
                run.cached_source_session_id,
                directory,
                event_sink=pad.emit,
                process_guard=False,
            )
            with Blackboard(directory / "case.sqlite3") as board:
                draft = project_case(board.snapshot(run.research_run_id))
                if draft.graph:
                    draft.graph.portrait = saved_portrait(board, run.research_run_id)
                    pad.emit(
                        {
                            "type": "research.coverage",
                            "coverage": draft.coverage,
                            "missing_portrait_sections": [
                                s
                                for s in SECTIONS
                                if s
                                not in {
                                    p.section
                                    for p in draft.graph.portrait
                                    if p.support_status != "INSUFFICIENT_EVIDENCE"
                                }
                            ],
                        }
                    )
                    pad.emit(
                        {
                            "type": "graph.research_preview",
                            "graph": draft.graph.model_dump(),
                            "committed": False,
                        }
                    )
            pad.emit(
                {
                    "type": "agent.text",
                    "text": "The saved sources describe all three projects, but do not independently establish the latency benchmark, implementation behavior, or deployed escrow. Open Dossier and select a claim to inspect its exact passages. This review has not changed the public Neo4j profile.",
                    "subagent": "orchestrator",
                }
            )
            pad.emit({"type": "investigation.complete"})
            return

        # A normal user-started investigation harvests through the existing SDK,
        # then enters the recursive scheduler. The old giant architect pass is not called.
        from backend.orchestrator import harvest, model_for

        if model_for("research") != MODEL:
            raise ValueError(
                "Configure a reviewed research adapter for the selected model"
            )
        reserve = MAX_CALLS * RESERVATION_USD
        if not run.budget or run.budget <= reserve:
            raise ValueError("Budget cannot cover harvesting and reserved research")
        key = os.environ.get("ANTHROPIC_API_KEY")
        if not key:
            raise ValueError("ANTHROPIC_API_KEY is required for the research adapter")
        phase = "collecting"
        result = await harvest(run.target, pad, run.budget - reserve)
        if (
            result.total_cost_usd is None
            or not math.isfinite(result.total_cost_usd)
            or result.total_cost_usd < 0
            or run.budget - result.total_cost_usd < reserve
        ):
            raise ValueError("Known remaining budget cannot cover research reservation")
        phase = "recursive_research"
        directory.mkdir(parents=True, exist_ok=False)
        ledger = EvaluationLedger(directory)
        with Blackboard(directory / "case.sqlite3", event_sink=pad.emit) as board:
            board.create_run(pad.session_id, run.target)
            superseded = {r.get("supersedes_evidence_id") for r in pad.raw_evidence}
            records = [
                r for r in pad.raw_evidence if r["evidence_id"] not in superseded
            ]
            reader = import_case(board, pad.session_id, records, identity_url="")
            identity_context = {
                "operator_decisions": pad.human_decisions,
                "meaning": "Operator choices scope the target identity; they do not independently verify any professional claim.",
                "excluded_discovery_sources": [
                    r["evidence_id"]
                    for r in records
                    if r["source"] == "mcp__osint__search_identity_exa"
                ],
            }
            if len(json.dumps(identity_context).encode()) > 6000:
                raise ValueError(
                    "Identity context exceeds the review bound; explicit resolution required"
                )
            with board.transaction():
                board._put(
                    pad.session_id, "identity_context", "operator", identity_context
                )
            # Include a bounded, source-diverse initial selection. Exact omissions
            # are retained in the case; extraction cannot cite outside this set.
            candidates = reader.search(
                "built developed implemented benchmark repository project", limit=24
            )
            chosen = []
            used_sources = set()
            ordered = []
            for span in candidates:
                if span.evidence_id not in used_sources:
                    ordered.append(span)
                    used_sources.add(span.evidence_id)
            ordered.extend(s for s in candidates if s not in ordered)
            for span in ordered:
                if (
                    len(json.dumps([s.model_dump() for s in chosen + [span]]).encode())
                    <= 12000
                ):
                    chosen.append(span)
            if not chosen:
                raise ValueError("No captured claim passages available")
            transport = ModelOnlyTransport(
                httpx.AsyncHTTPTransport(retries=0, trust_env=False)
            )
            async with httpx.AsyncClient(
                transport=transport,
                trust_env=False,
                follow_redirects=False,
                headers={
                    "x-api-key": key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                timeout=600,
            ) as client:
                model = EvaluationModel(client, ledger)
                extracted, _ = await model.generate(
                    "extract_claims",
                    "Extract three distinct consequential technical claims from the supplied sources. Cover different named projects where present. Preserve attribution. Cite only supplied span IDs; state missing verification.",
                    {
                        "subject": run.target,
                        "identity_context": identity_context,
                        "passages": [s.model_dump() for s in chosen],
                    },
                    ExtractedClaims,
                )
                allowed = {s.id for s in chosen}
                if any(not set(c.span_ids) <= allowed for c in extracted.claims):
                    raise ValueError("Extraction cited unsupplied evidence")
                tasks = []
                for priority, claim in enumerate(extracted.claims):
                    h = board.add_hypothesis(
                        pad.session_id, run.target, claim.statement, priority
                    )
                    tasks.append(
                        TaskProposal(
                            hypothesis_id=h.id,
                            goal=claim.statement,
                            role="identity",
                            span_ids=claim.span_ids,
                        )
                    )
                snapshot = await run_research(
                    ResearchGoal(
                        run_id=pad.session_id,
                        target=run.target,
                        initial_tasks=tasks,
                        remaining_budget=reserve - ledger.total_cost,
                    ),
                    board,
                    CachedModelWorker(model, board),
                    RunPolicy(
                        max_input_tokens=12000,
                        max_concurrent_workers=1,
                        execution_mode="authorized_model",
                    ),
                    critic=CachedModelCritic(model),
                )
                if (
                    snapshot.stop_reason in ("UNKNOWN_COST", "NEEDS_HUMAN")
                    or ledger.halted
                    or any(c["status"] == "pending" for c in ledger.calls)
                ):
                    run.chat_blocked = True
                    raise ValueError("Research requires review; no graph commit")
                draft = project_case(snapshot)
                accepted = [f for f in snapshot.findings if f.reviewed]
                ids = list(dict.fromkeys(s for f in accepted for s in f.span_ids))
                packet = PortraitEvidencePacket(
                    findings=accepted, spans=[reader.read_span(s) for s in ids]
                )
                if accepted and len(packet.model_dump_json().encode()) <= 12000:
                    portrait = await synthesize_portrait(packet, CachedPortrait(model))
                    if draft.graph:
                        draft.graph.portrait = portrait.sections
                    draft.missing_portrait_sections = portrait.missing_sections
                pad.emit(
                    {
                        "type": "research.coverage",
                        "coverage": draft.coverage,
                        "missing_portrait_sections": draft.missing_portrait_sections,
                    }
                )
                if draft.graph:
                    pad.emit(
                        {
                            "type": "graph.research_preview",
                            "graph": draft.graph.model_dump(),
                            "committed": False,
                        }
                    )
                pad.emit(
                    {
                        "type": "agent.usage",
                        "phase": "recursive_research",
                        "cost_usd": ledger.total_cost,
                    }
                )
                usage_reported = True
                if draft.graph:
                    from backend.graph_store import commit_graph

                    referenced = {
                        s
                        for item in [*draft.graph.nodes, *draft.graph.portrait]
                        for s in item.span_ids
                    }
                    await commit_graph(
                        pad,
                        draft.graph,
                        MODEL,
                        evidence_manifest=[
                            reader.read_span(s).model_dump() for s in sorted(referenced)
                        ],
                    )
                    pad.emit(
                        {
                            "type": "graph.final_commit",
                            "graph": draft.graph.model_dump(),
                        }
                    )
                pad.emit({"type": "investigation.complete"})
    except asyncio.CancelledError:
        pad.emit({"type": "investigation.cancelled"})
        raise
    except Exception as exc:
        pad.emit(
            {
                "type": "investigation.failed",
                "phase": phase,
                "error": type(exc).__name__,
            }
        )
    finally:
        if ledger is not None and ledger.calls and not usage_reported:
            unknown = any(call["status"] == "pending" for call in ledger.calls)
            run.chat_blocked = run.chat_blocked or unknown or ledger.halted
            pad.emit(
                {
                    "type": "agent.usage",
                    "phase": "recursive_research",
                    "cost_usd": None if unknown else ledger.total_cost,
                    "known_cost_usd": ledger.total_cost,
                    "usage_unknown": unknown,
                }
            )
        pad.cancel_pending_input()
