"""Evaluation-only adapters: model candidates, semantic review and portrait."""

from pydantic import Field

from .models import Model, WorkerResult
from .critic import CriticDecision
from .projection import PortraitDraft
from .prompts import ROLES
from .eval_model import save_json


class ExtractedClaim(Model):
    statement: str = Field(min_length=1, max_length=1000)
    span_ids: list[str] = Field(min_length=1)
    limitation: str


class ExtractedClaims(Model):
    claims: list[ExtractedClaim] = Field(min_length=3, max_length=3)
    selection_reason: str


def validate_extracted_coverage(extracted, required_groups):
    """One claim must cite each supplied project group, with no duplicate group."""
    assigned = []
    for claim in extracted.claims:
        matches = [
            i
            for i, g in enumerate(required_groups)
            if set(claim.span_ids) & set(g["span_ids"])
        ]
        if len(matches) != 1:
            raise ValueError("Claim must cite exactly one required project group")
        assigned.append(matches[0])
    if sorted(assigned) != list(range(len(required_groups))):
        raise ValueError("Required project coverage is incomplete or duplicated")


def validate_worker_scope(result, packet):
    ids = {s.id for s in packet.spans}
    for finding in result.findings:
        if (
            finding.hypothesis_id != packet.hypothesis.id
            or not set(finding.span_ids) <= ids
        ):
            raise ValueError("Worker cites evidence it was not supplied")
    for lead in result.leads:
        if lead.hypothesis_id != packet.hypothesis.id or lead.span_id not in ids:
            raise ValueError("Lead outside supplied task evidence")
    for child in result.children:
        if (
            child.hypothesis_id != packet.hypothesis.id
            or not set(child.span_ids) <= ids
        ):
            raise ValueError("Child task cites unsupplied evidence")


class CachedModelWorker:
    def __init__(self, model, board):
        self.model, self.board = model, board
        self.packets = []

    async def run(self, task, packet, remaining_budget):
        self.packets.append(packet.model_dump())
        save_json(self.model.ledger.directory / "worker-packets.json", self.packets)
        before = self.model.ledger.total_cost
        try:
            result, cost = await self.model.generate(
                f"worker:{task.wave}:{task.id}",
                ROLES[task.role]
                + "\nThis is a CACHE-ONLY evaluation. Return at most two concise findings. "
                "SELF_AUTHORED spans can support only an attributed self-report, never independent truth. "
                "Use relation=context for mere descriptions that do not support the exact hypothesis. "
                "No external tools are available. Children are optional; request one only for a distinct "
                "question answerable from supplied cached spans. Never request another copy of this task. "
                "Copy the exact hypothesis ID and span IDs. Omit cost_usd (server accounts for it).",
                packet.model_dump(),
                WorkerResult,
            )
            result.cost_usd = cost
            self.board.record_usage(task.id, task.version, cost)
            validate_worker_scope(result, packet)
            return result
        except Exception as exc:
            unknown = any(c["status"] == "pending" for c in self.model.ledger.calls)
            cost = None if unknown else self.model.ledger.total_cost - before
            return WorkerResult(
                status="blocked",
                cost_usd=cost,
                unresolved=[
                    f"{type(exc).__name__}: evaluation rejected; no paid retry"
                ],
            )


class CachedModelCritic:
    def __init__(self, model):
        self.model = model
        self.decisions = []

    async def __call__(self, report, reader):
        snapshot = report.after
        cited = list(dict.fromkeys(s for f in snapshot.findings for s in f.span_ids))
        passages = [reader.read_span(s) for s in cited]
        # Offer local, relevant alternatives without source-network access. This is retrieval,
        # not an assessment; the model decides whether a follow-up is useful.
        from itertools import zip_longest

        matches = [reader.search(h.statement, limit=8) for h in snapshot.hypotheses]
        alternatives = list(
            {
                span.id: span
                for row in zip_longest(*matches)
                for span in row
                if span is not None and span.id not in cited
            }.values()
        )
        payload = {
            "wave": report.wave,
            "identity_context": reader.identity_context(),
            "hypotheses": [h.model_dump() for h in snapshot.hypotheses],
            "findings": [f.model_dump() for f in snapshot.findings],
            "tasks": [t.model_dump() for t in snapshot.tasks],
            "leads": [lead.model_dump() for lead in snapshot.leads],
            "passages": [s.model_dump() for s in passages],
            "alternative_passages": [],
        }
        import json

        for span in alternatives:
            trial = {
                **payload,
                "alternative_passages": payload["alternative_passages"]
                + [span.model_dump()],
            }
            if len(json.dumps(trial, ensure_ascii=False).encode()) <= 24000:
                payload = trial
            if len(payload["alternative_passages"]) >= 4:
                break
        if len(json.dumps(payload, ensure_ascii=False).encode()) > 28000:
            raise ValueError("Critic packet exceeds evaluation bound")
        decision, cost = await self.model.generate(
            f"critic:{report.wave}",
            "You are the ARC semantic evidence critic. Check each candidate against its exact cited "
            "passages, dates, attribution, qualifications and counterevidence. A reference existing "
            "does NOT imply entailment. Reject overstatement or findings unrelated to the hypothesis. "
            "Accept accurate attributed self-reports but explain they are not independent verification. "
            "README descriptions do not prove working implementation, author contribution, deployment, "
            "adoption or benchmarks. Source kinds/origin groups are fixed; never promote self-authored "
            "material. Missing proof is not contradiction. Review all unreviewed findings, and retract "
            "any earlier accepted finding that is now unsupported. Return a concise reason for each. "
            "You may propose at most two next-wave tasks ONLY if a supplied alternative passage can "
            "resolve a specific unresolved question. Use the parent task ID for the SAME hypothesis; "
            "respect depth<=2, waves<=3 and total<=8. If cache is exhausted return no proposals. "
            "Use only supplied IDs. Entities optional: only Artifact nodes with a URL literally in "
            "a cited accepted finding's passage; no inferred ownership edges. Leave relationships empty "
            "unless explicitly supported. Keep total output concise; omit cost_usd.",
            payload,
            CriticDecision,
        )
        decision.cost_usd = cost
        valid_spans = {
            s["id"] for s in payload["passages"] + payload["alternative_passages"]
        }
        findings = {f.id for f in snapshot.findings}
        for review in decision.reviews:
            if review.finding_id not in findings:
                raise ValueError("Critic references unknown finding")
        for proposal in decision.proposals:
            if not set(proposal.span_ids) <= valid_spans:
                raise ValueError("Critic references unsupplied evidence")
        self.decisions.append({"wave": report.wave, "decision": decision.model_dump()})
        save_json(self.model.ledger.directory / "critic-decisions.json", self.decisions)
        return decision


class CachedPortrait:
    def __init__(self, model):
        self.model = model

    async def synthesize(self, packet):
        draft, cost = await self.model.generate(
            "portrait",
            "Write a concise professional portrait in exactly five sections: core_obsessions, "
            "builder_velocity, how_they_think, inferred_relationships, claim_corroboration. "
            "Use ONLY the reviewed findings and their supplied passages. Each section must cite its "
            "span_ids and corresponding evidence_ids and state limitations. Interpretations are "
            "tentative, not established facts. If velocity or relationships cannot be measured, say "
            "so explicitly instead of manufacturing them. Never infer personality or employment "
            "verification from project copy. Do not quote emails/contact details. Be perceptive but "
            "specific: name projects, describe recurring technical interests, separate stated intent "
            "from proven capability. Each analysis <=650 characters; limitations <=300 characters. "
            "Use only essential citations to stay within output cap. Omit cost_usd.",
            packet.model_dump(),
            PortraitDraft,
        )
        draft.cost_usd = cost
        return draft
