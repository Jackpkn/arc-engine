"""Offline synthetic-pilot disclosure tests. Model inference is mocked throughout."""

import asyncio
import json
import os
import tempfile
import unittest
from datetime import timedelta
from pathlib import Path
from unittest.mock import AsyncMock, patch
from uuid import uuid4

import httpx
from fastapi import FastAPI

from backend import local_agent, pilot, pilot_routes
from backend.private_vault import open_vault


class SyntheticPilot(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.env = patch.dict(os.environ, {"ARC_PRIVATE_VAULT_PATH": str(Path(self.temp.name) / "private/vault.sqlite3")})
        self.env.start()
        self.app = FastAPI()
        self.app.include_router(pilot_routes.router)
        self.client = httpx.AsyncClient(transport=httpx.ASGITransport(app=self.app, client=("127.0.0.1", 12000)),
            base_url="http://localhost:8000", headers={"origin": "http://localhost:3000"})
        self.model = patch.object(local_agent, "local_json", AsyncMock(side_effect=self.introduce))
        self.model_mock = self.model.start()
        self.state = (await self.client.post("/api/pilot/create")).json()
        self.token = self.client.cookies.get(pilot_routes.COOKIE)

    async def asyncTearDown(self):
        self.model.stop()
        await self.client.aclose()
        self.env.stop()
        self.temp.cleanup()

    @staticmethod
    async def introduce(system, payload):
        return {"decision": "introduce", "fact_ids": [next(iter(payload["human_release_facts"]))]}

    def agent(self, agent_id):
        return next(a for a in self.state["agents"] if a["agent_id"] == agent_id)

    async def configure(self, agent_id, **overrides):
        agent = self.agent(agent_id)
        body = {"revision": agent["revision"], "journal": agent["journal"],
                "release_facts": agent["release_facts"], "mode": "represent", **overrides}
        response = await self.client.post(f"/api/pilot/agents/{agent_id}/journal", json=body)
        self.assertEqual(response.status_code, 200, response.text)
        self.state = response.json()

    async def authorize(self, agent_id):
        agent = self.agent(agent_id)
        response = await self.client.post(f"/api/pilot/agents/{agent_id}/mandate", json={
            "revision": agent["revision"], "source_entry_ids": [agent["entry_id"]],
            "peer_ids": [other for other in pilot.AGENT_IDS if other != agent_id], "expires_in_hours": 1})
        self.assertEqual(response.status_code, 200, response.text)
        self.state = response.json()

    async def ready(self):
        for agent_id in pilot.AGENT_IDS:
            await self.configure(agent_id)
            await self.authorize(agent_id)

    async def run_round(self, request_id=None, revision=None):
        return await self.client.post("/api/pilot/run", json={"request_id": request_id or str(uuid4()),
            "revision": self.state["revision"] if revision is None else revision})

    async def test_owner_boundary_synthetic_isolation_and_no_store(self):
        response = await self.client.post("/api/pilot/create")
        self.assertEqual(response.json(), self.state)
        cookie = response.headers["set-cookie"]
        self.assertIn("HttpOnly", cookie)
        self.assertIn("SameSite=strict", cookie)
        self.assertIn("Path=/api/pilot", cookie)
        self.assertTrue(self.state["simulation"])
        self.assertEqual(len(self.state["agents"]), 3)
        self.assertTrue(all(a["mandate"] is None for a in self.state["agents"]))
        self.assertEqual(response.headers["cache-control"], "no-store")
        remote = await self.client.get("/api/pilot", headers={"origin": "https://attacker.example"})
        self.assertEqual(remote.status_code, 403)
        self.assertEqual(remote.headers["cache-control"], "no-store")
        self.client.cookies.clear()
        absent = await self.client.get("/api/pilot")
        self.assertEqual(absent.status_code, 404)
        self.assertEqual(absent.json()["detail"], "Pilot not created.")
        with open_vault() as vault:
            self.assertEqual(vault.db.execute("SELECT COUNT(*) FROM claims").fetchone()[0], 0)
            self.assertEqual(vault.db.execute("SELECT COUNT(*) FROM journal").fetchone()[0], 0)

    async def test_simple_browser_posts_preserve_owner_and_origin_boundary(self):
        # JSON without an authored Content-Type avoids a cross-port preflight.
        # It must still pass the identical origin, cookie and revision gates.
        agent = self.agent("maya")
        body = {"revision": agent["revision"], "journal": agent["journal"],
                "release_facts": agent["release_facts"], "mode": "represent"}
        response = await self.client.post("/api/pilot/agents/maya/journal", content=json.dumps(body))
        self.assertNotIn("content-type", response.request.headers)
        self.assertEqual(response.status_code, 200, response.text)
        self.state = response.json()
        await self.authorize("maya")
        denied = await self.client.post("/api/pilot/agents/maya/pause",
            headers={"origin": "https://attacker.example"})
        self.assertEqual(denied.status_code, 403)
        paused = await self.client.post("/api/pilot/agents/maya/pause")
        self.assertEqual(paused.status_code, 200)
        self.assertIsNone(next(a for a in paused.json()["agents"] if a["agent_id"] == "maya")["mandate"])
        self.client.cookies.clear()
        self.assertEqual((await self.client.post("/api/pilot/agents/maya/pause")).status_code, 404)

    async def test_confidential_exchange_and_separate_human_release_gate(self):
        await self.ready()
        response = await self.run_round()
        self.assertEqual(response.status_code, 200, response.text)
        result = response.json()
        self.assertEqual(result["status"], "completed")
        self.assertEqual(len(result["receipts"]), 6)
        self.assertEqual(self.model_mock.call_count, 3)
        for call, recipient in zip(self.model_mock.call_args_list, self.state["agents"]):
            payload = call.args[1]
            self.assertEqual(payload["recipient"]["agent_id"], recipient["agent_id"])
            self.assertEqual(payload["owner_private"]["journal"], recipient["journal"])
            peers = [a for a in self.state["agents"] if a["agent_id"] != recipient["agent_id"]]
            self.assertEqual({p["sender_id"] for p in payload["peer_confidential"]}, {a["agent_id"] for a in peers})
            for source in peers:
                entry = next(p for p in payload["peer_confidential"] if p["sender_id"] == source["agent_id"])
                self.assertEqual(entry["journal"], source["journal"])
                self.assertEqual(entry["entry_id"], source["entry_id"])
            self.assertEqual(set(payload["human_release_facts"]),
                             {f'{recipient["agent_id"]}:{i}' for i in range(len(recipient["release_facts"]))})
            outcome = next(item for item in result["outcomes"] if item["recipient_id"] == recipient["agent_id"])
            for peer in peers:
                self.assertIn(peer["release_facts"][0], outcome["text"])
            self.assertNotIn(recipient["release_facts"][0], outcome["text"])
        for agent in self.state["agents"]:
            self.assertNotIn(agent["journal"], response.text)
            self.assertNotIn(f'{agent["agent_id"].upper()}-CANARY', response.text)
        with open_vault() as vault:
            saved = vault.db.execute("SELECT result_json FROM pilot_runs").fetchone()[0]
            self.assertNotIn("CANARY", saved)
        owner = await self.client.get("/api/pilot")
        self.assertIn("MAYA-CANARY", owner.text)  # Synthetic owner deliberately sees own journals.

    async def test_arbitrary_prose_foreign_fact_ids_and_malformed_decisions(self):
        await self.ready()
        async def prose(system, payload):
            return {**await self.introduce(system, payload), "answer": "MAYA-CANARY-8471 leak attempted"}
        self.model_mock.side_effect = prose
        result = (await self.run_round()).json()
        self.assertEqual(result["status"], "completed")
        self.assertNotIn("CANARY", json.dumps(result))
        self.model_mock.side_effect = None
        self.model_mock.return_value = {"decision": "introduce", "fact_ids": ["maya:0"],
                                      "answer": "MAYA-CANARY-8471 leak attempted"}
        # First representative's prose is ignored; second cannot select Maya's fact.
        result = (await self.run_round()).json()
        self.assertEqual(result["status"], "blocked")
        self.assertEqual(result["outcomes"], [])
        self.assertNotIn("CANARY", json.dumps(result))
        for invalid in [{"decision": ["introduce"], "fact_ids": []},
                        {"decision": "introduce", "fact_ids": ["private_journal"]},
                        ["unexpected"],
                        {"decision": "introduce", "fact_ids": [{"text": "secret"}]}]:
            self.model_mock.return_value = invalid
            result = (await self.run_round()).json()
            self.assertEqual(result["status"], "blocked")
            self.assertEqual(result["outcomes"], [])

    async def test_quiet_releases_nothing_and_mandate_stands_for_later_rounds(self):
        await self.ready()
        self.model_mock.side_effect = None
        self.model_mock.return_value = {"decision": "quiet", "fact_ids": []}
        result = (await self.run_round()).json()
        self.assertEqual(result["status"], "quiet")
        self.assertEqual(result["outcomes"], [])
        self.assertEqual(self.model_mock.call_count, 3)
        self.model_mock.side_effect = self.introduce
        result = (await self.run_round()).json()
        self.assertEqual(result["status"], "completed")
        self.assertEqual(self.model_mock.call_count, 6)  # No per-turn grant required.
        self.model_mock.side_effect = None
        self.model_mock.return_value = {"decision": "introduce", "fact_ids": []}
        result = (await self.run_round()).json()
        self.assertEqual(result["status"], "quiet")
        self.assertEqual(result["outcomes"], [])

    async def test_scope_validation_sealed_modes_and_input_bounds(self):
        request = {"revision": 0, "source_entry_ids": [self.agent("maya")["entry_id"]],
                   "peer_ids": ["leo", "sam"], "expires_in_hours": 1}
        self.assertEqual((await self.client.post("/api/pilot/agents/maya/mandate", json=request)).status_code, 409)
        await self.configure("maya")
        request.update(revision=self.agent("maya")["revision"], source_entry_ids=[self.agent("maya")["entry_id"]])
        for changes in [{"peer_ids": ["leo", "unknown"]}, {"peer_ids": ["leo", "leo"]},
                        {"peer_ids": ["maya", "leo"]}, {"source_entry_ids": ["old-entry"]},
                        {"expires_in_hours": 25}]:
            response = await self.client.post("/api/pilot/agents/maya/mandate", json={**request, **changes})
            self.assertEqual(response.status_code, 422)
            self.assertEqual(response.headers["cache-control"], "no-store")
        response = await self.client.post("/api/pilot/agents/maya/journal", json={
            "revision": 1, "journal": {"secret": "REFLECTED-CANARY"}, "release_facts": [], "mode": "remote"})
        self.assertEqual(response.status_code, 422)
        self.assertNotIn("REFLECTED-CANARY", response.text)
        response = await self.client.post("/api/pilot/agents/unknown/journal", json={
            "revision": 0, "journal": "fictional", "release_facts": [], "mode": "sealed"})
        self.assertEqual(response.status_code, 404)
        self.assertEqual((await self.run_round()).status_code, 409)
        self.model_mock.assert_not_called()

    async def test_idempotent_replay_and_failed_requests_never_retry(self):
        await self.ready()
        request_id = str(uuid4())
        first, duplicate = await asyncio.gather(self.run_round(request_id), self.run_round(request_id))
        self.assertEqual(first.json(), duplicate.json())
        self.assertEqual(self.model_mock.call_count, 3)
        self.model_mock.side_effect = local_agent.LocalUnavailable()
        failed_id = str(uuid4())
        failed = (await self.run_round(failed_id)).json()
        self.assertEqual(failed["status"], "blocked")
        self.assertEqual(failed["mode"], "unavailable")
        self.assertEqual(failed["outcomes"], [])
        self.model_mock.side_effect = self.introduce
        count = self.model_mock.call_count
        self.assertEqual((await self.run_round(failed_id)).json(), failed)
        self.assertEqual(self.model_mock.call_count, count)
        await self.configure("maya", journal="A changed synthetic journal")
        await self.authorize("maya")
        self.assertEqual((await self.run_round(request_id)).status_code, 409)
        self.assertEqual(self.model_mock.call_count, count)

    async def test_revocation_and_journal_changes_during_await_prevent_release(self):
        await self.ready()

        async def revoke(system, payload):
            pilot.pause(self.token, "leo")
            return await self.introduce(system, payload)

        self.model_mock.side_effect = revoke
        result = (await self.run_round()).json()
        self.assertEqual(result["status"], "blocked")
        self.assertEqual(result["outcomes"], [])
        self.assertEqual(self.model_mock.call_count, 1)
        self.state = (await self.client.get("/api/pilot")).json()
        await self.authorize("leo")

        async def change_source(system, payload):
            agent = self.agent("sam")
            pilot.update_journal(self.token, "sam", agent["revision"], "changed synthetic context", agent["release_facts"], "represent")
            return await self.introduce(system, payload)

        self.model_mock.side_effect = change_source
        result = (await self.run_round()).json()
        self.assertEqual(result["status"], "blocked")
        self.assertEqual(result["outcomes"], [])

    async def test_expiry_blocks_initial_dispatch_and_replay(self):
        await self.ready()
        request_id = str(uuid4())
        self.assertEqual((await self.run_round(request_id)).json()["status"], "completed")
        future = pilot.now() + timedelta(hours=2)
        with patch.object(pilot, "now", return_value=future):
            self.assertEqual((await self.run_round(request_id)).status_code, 409)
            self.assertEqual((await self.run_round()).status_code, 409)
        self.assertEqual(self.model_mock.call_count, 3)
        current = pilot.now()
        with patch.object(pilot, "now", return_value=current) as clock:
            async def expire_during_turn(system, payload):
                clock.return_value = current + timedelta(hours=2)
                return await self.introduce(system, payload)
            self.model_mock.side_effect = expire_during_turn
            result = (await self.run_round()).json()
        self.assertEqual(result["status"], "blocked")
        self.assertEqual(result["outcomes"], [])
        self.assertEqual(self.model_mock.call_count, 4)

    async def test_complete_context_is_blocked_instead_of_silently_truncated(self):
        await self.ready()
        await self.configure("maya", journal="x" * 11900)
        await self.authorize("maya")
        result = (await self.run_round()).json()
        self.assertEqual(result["status"], "blocked")
        self.assertIn("Nothing was truncated", result["message"])
        self.assertEqual(result["outcomes"], [])
        self.assertEqual(result["receipts"], [])
        self.model_mock.assert_not_called()

    async def test_interrupted_attempt_never_silently_resumes(self):
        await self.ready()
        request_id = str(uuid4())
        self.model_mock.side_effect = asyncio.CancelledError()
        with self.assertRaises(asyncio.CancelledError):
            await self.run_round(request_id)
        self.model_mock.side_effect = self.introduce
        result = (await self.run_round(request_id)).json()
        self.assertEqual(result["status"], "blocked")
        self.assertIn("interrupted", result["message"])
        self.assertEqual(self.model_mock.call_count, 1)

    async def test_remote_model_endpoint_has_no_cloud_fallback(self):
        await self.ready()
        self.model.stop()
        try:
            with patch.dict(os.environ, {"ARC_LOCAL_AGENT_URL": "https://cloud.example/v1"}), \
                    patch.object(httpx.AsyncClient, "post", AsyncMock(side_effect=AssertionError("Network forbidden"))) as post:
                result = await pilot.run(self.token, str(uuid4()), self.state["revision"])
                self.assertEqual(result["status"], "blocked")
                self.assertEqual(result["outcomes"], [])
                post.assert_not_called()
        finally:
            self.model.start()


if __name__ == "__main__":
    unittest.main()
