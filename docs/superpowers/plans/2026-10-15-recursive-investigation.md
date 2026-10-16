# Recursive Evidence Investigation Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task after review. No implementation is authorized by this planning document alone. Do not launch paid model/provider calls for verification.

**Goal:** Replace ARC's one-pass evidence dump with a persistent, bounded research loop that discovers leads, delegates focused tasks, checks support, recovers safely, and explains why it stopped.

**Architecture:** SQLite owns investigation state, source passages, hypotheses, tasks and events. Claude Agent SDK agents reason over scoped evidence and can propose/delegate child work through controlled tools; application code owns admission, task identity, limits, support transitions and commits. Neo4j receives a validated public projection; private journals and peer statements remain outside research.

**Tech stack:** Existing uv/Python/FastAPI/Claude Agent SDK/FastMCP/SQLite/Neo4j/Next.js. No Graphiti, new message broker, or multi-tenant RBAC migration.

**Spec:** User-provided October 15 recursive blackboard, progress critic, bounded waves and recovery proposal. This document makes its implementation boundaries explicit. It covers recursive investigation (Loop A); multi-turn private-agent negotiation (Loop B) is a separate follow-on subsystem.

## Review findings and important corrections

- `backend/orchestrator.py:155` runs `harvest()` once, then `execute_graph_architect_pass()`, then completes. Tool-driven exploration inside harvest is possible, but there is no persistent claim-directed replan loop.
- The single `osint_harvester` definition has provider tools but no `Agent` tool. Installed Python SDK is 0.2.166. Current official SDK docs support nested delegation and depth/concurrency environment controls on supported versions. No SDK run was launched to inspect this.
- `scratchpad.py:55` returns every retained professional-field evidence view. Its 500,000-byte ceiling is a memory guard, not a token selection policy. `_capture` can skip evidence entirely at that ceiling.
- `graph_architect.py:31` serializes the entire retained evidence set. Its citation validation checks ID membership, not whether a passage entails a claim.
- `source_cache.py` protects identical requests with pending/ready/uncertain states. Recovery must preserve this protection. A timeout does not establish that a remote charged run failed.
- `graph_models.py` allows exactly one Person and a fixed edge vocabulary. Network expansion requires a backward-compatible central-person field and additional relationship types; adding only agents would not deliver the proposed graph.
- Current persistent restart behavior marks uncertain paid operations interrupted. Do not silently replay them to demonstrate autonomy.
- Code can deterministically check passage locations, source hashes and eligibility rules. Semantic entailment, authorship attribution and source independence can still be wrong. A critic is another model, not a truth oracle.
- Do not treat invented 0.40/0.92 scores as calibrated probabilities. Do not force a claim to become supported to terminate. Exhaustion and contradiction are valid outcomes.

Read-only cache audit: the existing investigation has seven historical evidence records, of which the recovered LinkedIn record supersedes the old file notice, leaving six current records. They include an Exa response, LinkedIn profile/posts, the initially queried GitHub profile, and two repository README responses. These do not themselves establish independent employment verification or inspected commit history. Original files are preserved.

## Global constraints

- Maximum three waves. Root investigation depth 0; admitted descendant tasks at depths 1 and 2 only. Wave count and ancestry depth are separate counters.
- Proposed initial application bounds for review: two active workers and eight admitted research tasks total per investigation, including the seed task. These are product bounds, not provider rate limits. A task/branch limit is necessary because depth alone does not bound fan-out.
- The demo goal prioritizes three technical claims. Admission of related people is limited to resolving those claims or evidenced collaboration links; never recursively investigate every name mentioned.
- Preserve the current authorized remaining investigation budget and source-call protections. Every new SDK query consumes from that remaining allowance; never give every wave a fresh full budget. Unknown usage blocks more paid work. No expansion of the deferred spending-cap project.
- In offline replay, disable network and model execution at the adapter boundary. Cache misses are terminal `MISSING_CACHED_SOURCE` outcomes, never upstream fallthrough. Use a temporary database and graph preview; do not modify the user's existing Neo4j dossier.
- External-source records are untrusted data. Human identity decisions stay separate from source proof. Private vault modules and PeerClaim data are not available to research tools.
- Preserve original timestamps and snapshots. Older/reused evidence is not presented as a fresh observation.
- Native nested-agent execution is a supported SDK capability, but runtime behavior and accounting in ARC must be validated separately when a paid model trial is authorized.

## Hackathon provider decision

The official event page asks participants to build on Crusoe Managed Inference with open models. This plan preserves the user's current Claude SDK choice pending clarification. If selected, add a Crusoe-backed public-evidence worker behind the same worker result contract; its model and account limits require verified documentation and explicit configuration. Do not assume ClaudeSDKClient can simply be pointed at an arbitrary OpenAI-compatible endpoint. No model/provider switch or Crusoe calls occur in the cache-only milestone.

## Data contracts

All IDs and run/task capabilities come from the server, not from untrusted tool output.

- `EvidenceSpan`: source/evidence ID, immutable snapshot hash, JSON pointer or text offsets, exact text/value, URL, observed_at, source kind, author/publisher attribution and origin group. Exact excerpts are validated against the saved snapshot.
- `Hypothesis`: ID, subject entity, atomic statement, priority, lifecycle (`OPEN | INVESTIGATING | RESOLVED | EXHAUSTED | BLOCKED`), supporting/refuting span IDs, support assessment and limitations. Break compound claims into separate hypotheses.
- `SupportAssessment`: `UNCHECKED | SELF_REPORTED_ONLY | ARTIFACT_SUPPORTED | THIRD_PARTY_SUPPORTED | CONFLICTING | CONTRADICTED`, with an explicit rationale and reviewer/version. Mixed support/refutation remains available; no destructive overwrite. Optional model confidence is labeled uncalibrated and is not the stop condition.
- `Lead`: canonical source URL/entity key, discovered-by task, supporting span, related hypothesis, depth, relevance, disposition and rejection reason. Being mentioned does not prove collaboration or identity.
- `ResearchTask`: server-issued ID, parent task, goal/hypothesis, role, depth, wave, allowed operations, packet reference, status, lease/attempt, SDK agent/session reference and resulting lead IDs. Unique task fingerprints prevent repeated equivalent work.
- `RecoveryRecord`: original operation ID, failure class, known provider run ID, current outcome, proposed fallback, authorization/cache status and executed result. No secrets or raw exception strings in SSE.
- `BoardEvent`: monotonically increasing sequence, run/task/hypothesis IDs, type and compact payload. State change and event are committed in the same SQLite transaction.
- `WorkerResult`: candidate findings with span references, discovered leads, unresolved questions and completion/failure status. A worker does not set canonical support status or directly write Neo4j.
- `CriticDecision`: cited deficiencies, targeted task proposals, rejected conclusions, progress delta and stop reason. Code validates proposals against scope, deduplication, depth, task limits and remaining authorization.

## Task 1 — Durable blackboard and evidence access

**Create:** `backend/research/models.py`, `backend/research/blackboard.py`, `backend/research/evidence.py` and package init. **Modify:** `backend/storage.py`, `backend/scratchpad.py`, `backend/investigations.py`, `backend/tool_outputs.py`. **Tests:** `backend/tests/test_research_blackboard.py`.

Interfaces:
- `Blackboard.snapshot(run_id: str) -> BoardSnapshot`
- `Blackboard.admit_task(run_id: str, proposal: TaskProposal, policy: RunPolicy) -> ResearchTask | Rejection`
- `Blackboard.record_result(task_id: str, result: WorkerResult, expected_version: int) -> BoardDelta`
- `EvidenceReader.read_span(span_id: str) -> EvidenceSpan`
- `EvidenceReader.build_packet(task: ResearchTask, max_input_tokens: int) -> EvidencePacket`

- [ ] Write failing checks for atomic event/state commits, duplicate concurrent task admission, stale updates, cross-run reads, invalid excerpt locations, and snapshot mutation.
- [ ] Import existing evidence references into an isolated case file without inventing findings. Split LinkedIn records by semantic fields, posts by post, README text by sections; preserve parent context and qualifiers. Do not split arbitrary characters and lose subject/date context.
- [ ] Preserve large source bodies outside in-memory prompt accumulation. Scratchpad remains the UI/event facade and exposes source handles; the board owns durable research state. Keep explicit disk/request safeguards; do not reinterpret the current 500 KB memory limit as a source deletion rule.
- [ ] Retrieve by hypothesis/entity and local text search first. Every packet reports included, excluded and missing sections. Token limits come from the configured task/model budget; measure and reject oversized packets. No new embedding-provider dependency is needed.
- [ ] Run `.venv/bin/python -m unittest backend.tests.test_research_blackboard -v`; expected all pass with network/model calls prohibited.

Deliverable: independently inspectable sources, excerpts and queued work that survive restart without starting a provider call.

## Task 2 — Focused SDK workers and controlled delegation

**Create:** `backend/research/tools.py`, `backend/research/workers.py`, `backend/research/prompts.py`. **Modify:** `backend/orchestrator.py`, `backend/agent.py`. **Tests:** `backend/tests/test_research_workers.py`.

Interfaces:
- `ResearchWorker.run(task: ResearchTask, packet: EvidencePacket, remaining_budget: float) -> WorkerResult`
- `create_research_tools(board: Blackboard, capability: TaskCapability)` exposes scoped `read_evidence`, `list_open_hypotheses`, `submit_findings`, `propose_lead`, `request_child_task` via the official SDK custom-tool mechanism.
- A replay worker implements the same contract without invoking Claude. It is a test adapter, not a fake MCP provider.

- [ ] Define roles for identity/career extraction, artifact verification and targeted corroboration. Tools are role-specific; only workers approved to delegate receive `Agent`.
- [ ] Enforce a blackboard admission before each native Agent launch. Correlate trusted SDK hook IDs with admitted task IDs; reject unmatched or out-of-scope launches. Unknown dynamic general-purpose agents do not bypass tool restrictions.
- [ ] Reconcile wave semantics with nesting: tasks admitted by critic feedback advance the wave; a child explicitly delegated by an executing worker consumes the same wave's shared task allowance and increments depth. All descendants finish or checkpoint before that wave's critic gate.
- [ ] Set supported SDK depth/concurrency controls through Python `ClaudeAgentOptions.env` and enforce the same policy in application admission. Detect unsupported runtime behavior before allowing paid execution.
- [ ] Store findings in SQLite through validated tools. Return compact result references to the parent, not entire scraped payloads. Never rely on an MCP server's invented `send_message` capability; workers communicate through durable board events.
- [ ] Test tool permissions, rejected depth-3 children, duplicate proposals, incorrect SDK-to-task attribution, oversized packets and incomplete worker results offline.

Deliverable: workers discover and request genuinely new child tasks, with a traceable reason and tightly scoped context.

## Task 3 — Recursive scheduler and progress critic

**Create:** `backend/research/scheduler.py`, `backend/research/critic.py`. **Modify:** `backend/orchestrator.py`, `backend/investigations.py`, `backend/main.py`. **Tests:** `backend/tests/test_research_scheduler.py`.

Interfaces:
- `run_research(goal: ResearchGoal, board: Blackboard, worker: ResearchWorker, policy: RunPolicy) -> ResearchOutcome`
- `check_progress(before: BoardSnapshot, after: BoardSnapshot, policy: RunPolicy) -> ProgressReport`
- `review_progress(report: ProgressReport, reader: EvidenceReader) -> CriticDecision` uses a scoped model check only in explicitly authorized model execution mode.

- [ ] Seed wave 1 with identity/context extraction. Existing operator identity decisions can be reused with their original attribution. New ambiguous people remain blocked while unrelated tasks continue.
- [ ] After a wave, code checks task completion, evidence coverage, duplicate origins, unknown costs and hard limits. The focused critic examines relevant claim passages and proposes specific missing checks, rather than seeing every raw source.
- [ ] Admit wave 2/3 tasks only if they address an unresolved goal and differ materially from exhausted work. The critic may downgrade prior interpretations; another agent's agreement does not count as a new source.
- [ ] Stop with `GOAL_SATISFIED`, `NO_NEW_EVIDENCE`, `SOURCES_EXHAUSTED`, `WAVE_LIMIT`, `TASK_LIMIT`, `BUDGET_LIMIT`, `UNKNOWN_COST`, `NEEDS_HUMAN` or `CANCELLED`. Unresolved claims remain visible.
- [ ] Use remaining aggregate cost at every SDK boundary. Persist usage on error results too; do not drop a failed worker's consumption.
- [ ] Persist pending tasks and provider operation IDs. On restart reconcile local completed work and known provider runs before resuming. Ambiguous charged outcomes remain blocked; do not blanket-retry queued tasks.
- [ ] Test a discovered lead changing the next wave, a critic causing targeted rework, cycles A→B→A, exhausted sources, cancellation and restart at each checkpoint.

Deliverable: completion is driven by the evolving case, not a fixed list of scraper calls.

## Task 4 — Classified recovery without duplicate charges

**Create:** `backend/research/recovery.py`. **Modify:** `backend/source_cache.py`, `backend/mcp_servers/cached_proxy.py`, `backend/mcp_servers/osint_mcp.py`, `backend/orchestrator.py`. **Tests:** `backend/tests/test_research_recovery.py`.

Interface: `choose_recovery(failure: ToolFailure, task: ResearchTask, board: BoardSnapshot, execution_mode: str) -> RecoveryAction`.

- [ ] Capture sanitized structured failures at the tool boundary: persisted-output notice, empty response, timeout/unknown outcome, authentication failure, rate limiting, inaccessible URL and provider failure. Existing hooks discard too much failure detail for a safe classifier.
- [ ] Persist Apify run IDs as soon as available. Recover/reconcile that run through documented status/dataset reads; never start a second actor solely because a wait timed out.
- [ ] Recover local SDK output files before considering alternate sources. This is transport recovery, not failed scraping.
- [ ] Prefer existing cached alternate sources. Live source pivots must be admitted distinct tasks within existing authorization and documented provider behavior. Rate-limit responses respect provider retry guidance and avoid blind paid retries.
- [ ] Treat a blocked URL as inaccessible. Use permitted public alternatives for the same fact, not an access-control bypass. No Wayback adapter is assumed to exist. Exa search results are not automatically cached or equivalent to the inaccessible page; preserve actual provenance/date.
- [ ] Emit persisted `tool.recovery` events with planned/executed/failed state. Never show a recovery as successful until the replacement result is captured.
- [ ] Test safe cache fallback, unknown charged outcomes, duplicate worker requests, exhausted fallbacks and partial collection. Exact-request cache protections remain active.

Deliverable: one failed source can produce a visible, bounded strategy change without restarting successful work.

## Task 5 — Graph projection and grounded portrait

**Create:** `backend/research/projection.py`. **Modify:** `backend/graph_architect.py`, `backend/graph_models.py`, `backend/graph_store.py`, `backend/portrait.py`, `backend/prompts.py`. **Tests:** `backend/tests/test_research_projection.py`.

Interfaces:
- `project_case(snapshot: BoardSnapshot) -> PublicGraphDraft` deterministically maps accepted entities, claims, evidence and assessed relationships.
- `synthesize_portrait(findings: PortraitEvidencePacket) -> PortraitDraft` produces explicitly labeled interpretations, with exact finding/span citations.

- [ ] Replace the `architect_evidence()` dump in the new research path with reviewed findings and selective source access. Keep legacy cache rebuild tools explicitly versioned; do not mutate old run history during migration.
- [ ] Add `root_person_id` with a compatible one-person legacy default. Allow scoped additional Person/Organization nodes. Extend only required relationship types (e.g. `WORKED_AT`, `CONTRIBUTED_TO`, `COLLABORATED_ON`) with evidence state on edges; naming another person does not authorize a supported relationship edge.
- [ ] Distinguish a repository's existence, individual contribution, ownership, employment and adoption as different claims. Preserve source-origin groups so repeated self-authored material cannot become independent corroboration.
- [ ] Keep semantic assessment in the findings/portrait layer; deterministic projection does not make inferred judgments objectively verified. Citation presence and passage entailment are evaluated separately.
- [ ] Preview graph growth through staged events. Commit a valid partial/final snapshot atomically and preserve PeerClaim nodes. If synthesis is unavailable, show accepted findings and explicit missing portrait sections rather than fabricate completion.
- [ ] Test unsupported source IDs, valid-but-irrelevant citations, multi-person identity collisions, legacy single-person graphs, mixed conflicting evidence and peer/private separation.

Deliverable: a smaller, auditable model input and graph whose support labels survive synthesis.

## Task 6 — Visible recursive progress and cached acceptance demo

**Create:** `frontend/components/research-progress.tsx`. **Modify:** `frontend/lib/investigation.ts`, `frontend/components/tool-stream.tsx`, `frontend/components/review-panel.tsx`. **Create:** `backend/replay_research.py`, `backend/tests/test_research_replay.py`.

- [ ] Render `research.wave`, `task.queued`, `task.started`, `lead.discovered`, `hypothesis.updated`, `critic.reviewed`, `tool.recovery`, `research.stopped` events with ancestry, reason and actual outcome. Show concise decision summaries, not hidden chain-of-thought.
- [ ] Keep conversation text unboxed and the sidebar layout intact. Progress detail is collapsible. Duplicate/replayed SSE events do not create duplicate tasks.
- [ ] Provide explicit coverage: which three claims were prioritized, evidence checked, blocked branches and why the run stopped. Do not show a synthetic “confidence reached” celebration.
- [ ] Offline replay command: `.venv/bin/python -m backend.replay_research --session-id 543e4074-d81b-4ec5-993d-d23c36794c83 --offline --output-dir /private/tmp/arc-recursive-replay`.
- [ ] Import read-only cached records into a temporary case, excluding superseded file notices. Use manually reviewed expected findings for the deterministic worker/critic test adapters. No fake source data or claims of live model reasoning.
- [ ] Inject labeled test failures at the adapter boundary to exercise cached fallback. Show real cached content, explicitly labeled simulated outage, and missing-cache outcomes. Do not claim the previously fetched cache proves an actual remote outage was recovered.
- [ ] Verify no provider/model network calls, no production Neo4j write, no private-vault read and no test PeerClaim writes. Emit graph preview, event trace, token-size report and acceptance results.
- [ ] Run focused backend tests, frontend lint/build and browser replay. Only after review propose a separately authorized model-only run against the same cached evidence. Source-provider calls stay disabled during that model evaluation.

Deliverable: reproducible proof of the control loop plus an honest separation between orchestration tests and model-quality evaluation.

## Review focus / acceptance evidence

1. Same-name identity collision: a colleague mention produces a lead, not an identity merge or automatic full-person scrape. Owned by tasks 2, 3 and 5.
2. Self-authored text repeated across websites: one source origin, no third-party status upgrade. Owned by tasks 1, 3 and 5.
3. Provider accepted the job but response was lost: preserve operation ID/outcome uncertainty, no duplicate charge. Owned by task 4.
4. Worker result arrives after cancellation or another worker update: reject stale writes, preserve accepted evidence and costs. Owned by tasks 1 and 3.
5. Syntactically valid citations do not support the claim: reject or mark unresolved; keep quoted passages inspectable. Owned by tasks 3, 5 and cached human-reviewed cases in task 6.

Offline checks establish storage/routing/recovery behavior, not autonomous intelligence. Model evaluation must separately measure supported-claim precision, important-fact coverage, citation relevance, contradiction detection, identity errors, repeated-source calls, per-task tokens and actual cost. This plan does not invent passing accuracy percentages before a reviewed evaluation set exists.

## Separate follow-on: local-agent negotiation

Do not silently replace the current privacy firewall with raw-journal chat between agents. A later bounded negotiation state machine can exchange clarifying questions and an intro proposal using owner-approved context, with a three-turn limit and explicit owner acceptance before commitments. Remote identity, transport, consent/revocation and proposal delivery need their own design. This is not part of the first recursive research implementation.

## Sources checked October 15, 2026

- Event: https://events.cerebralvalley.ai/e/crusoe-recursive-agents-hackathon
- Native SDK delegation and bounds: https://code.claude.com/docs/en/agent-sdk/subagents
- Context selection: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- Research-system tradeoffs: https://www.anthropic.com/engineering/multi-agent-research-system

Status: approved and executed for the offline milestone on October 15, 2026. No paid model/provider calls or Neo4j mutations. See [execution results](../../recursive-offline-results.md) and [run guide](../../recursive-offline.md).

## Execution record

The task lists above preserve the approved design. Runtime verification items requiring paid execution remain deferred; they are not represented as completed live checks.

| Task | Boundary result |
| --- | --- |
| 1 — durable board and evidence | 17 backend tests passed |
| 2 — workers and delegation | 20 backend tests passed |
| 3 — scheduler and critic | 27 backend tests passed |
| 4 — recovery | 32 backend tests passed |
| 5 — projection | 37 backend tests passed |
| 6 — replay and UI | 39 backend tests, lint/build/browser passed before final review |
| Final regression pass | 51 backend tests; lint/build/parser/browser checks passed |

Approved provider decision: keep the Python interfaces for a future Crusoe adapter. No OpenAI endpoint is assigned to ClaudeSDKClient. The offline milestone uses application-scheduled child tasks; native SDK Agent launches remain denied pending attribution validation. V2 has an explicit entrypoint and offline file viewer; live API activation remains separate. These are implementation boundaries, not claims of a successful model-quality evaluation.

