# Recursive research: offline milestone

The new research path keeps sources and exact passages in a SQLite case file. Workers return candidate findings and proposed child tasks; a reviewer controls support assessments. The application admits tasks and enforces three waves, depth two, two concurrent workers, eight total tasks and three prioritized claims. A worker cannot write the public graph.

## Run and inspect

From the repository root:

```bash
.venv/bin/python -m unittest discover -s backend/tests -q
.venv/bin/python -m backend.replay_research \
  --session-id 543e4074-d81b-4ec5-993d-d23c36794c83 \
  --offline --output-dir /private/tmp/arc-recursive-replay
```

Use a fresh output directory on subsequent runs. An existing case is never silently replaced.

Open `/research/replay` on the frontend and select the generated `replay.json`. The file is read in the browser, without uploading it or starting research. Conversation text stays unboxed; the task ledger and recovery decisions are collapsible. The same progress/coverage components are available to the workspace event reducer. A graph preview is explicitly uncommitted.

Artifacts:

- `case.sqlite3`: immutable source snapshots, exact JSON-pointer/text-offset passages, hypotheses, findings, tasks and event ledger.
- `graph-preview.json`: public projection plus coverage and missing portrait sections. No Neo4j write.
- `event-trace.jsonl`: sequenced state transitions, child ancestry, reviewer decisions, recovery outcomes and stop reason.
- `token-size-report.json`: included/excluded/missing passage IDs and serialized packet sizes.
- `summary.json`: acceptance assertions, source/graph counts and unresolved claims.
- `replay.json`: browser-viewable bundle of the above public preview data.

The replay imports six current cached source records and excludes the superseded LinkedIn file notice. Originals and timestamps remain in the isolated case. The fixture reviews three claims: Stela latency, Flightdeck authorship/functionality, and Open Agent Network escrow. README descriptions and LinkedIn statements remain self-authored; they are not independent contribution, deployment, adoption or benchmark evidence.

The worker and critic adapters for this replay use explicitly reviewed expectations. They do not simulate a successful model evaluation. Injected inaccessible-source and empty-cache outcomes are labeled simulated. Successful fallback means an existing passage was recovered, not that a remote outage was observed or bypassed.

## Boundaries

| Component | Responsibility |
| --- | --- |
| `research/blackboard.py` | Transactional admission, findings, leads, state changes and events |
| `research/evidence.py` | Immutable snapshots, exact excerpts, bounded evidence packets |
| `research/tools.py` | Server-bound case/task capabilities and official SDK custom tools |
| `research/workers.py` | `ResearchWorker` interface, offline replay adapter, explicitly gated Claude adapter |
| `research/scheduler.py` | Wave/ancestry/task/concurrency limits, remaining allowance and stop outcomes |
| `research/critic.py` | Replaceable `review_progress` interface and canonical support transitions |
| `research/recovery.py` | Classified fallback decisions, cached recovery and known-operation reconciliation |
| `research/projection.py` | Reviewed graph projection and bounded portrait adapter contract |
| `replay_research.py` | Read-only cache import, disabled model/network boundaries, preview artifacts |

The official SDK custom tools operate in process. The application schedules admitted children with fresh task capabilities. Native `Agent` delegation is denied until child attribution and accounting are validated separately. No fake provider MCP server is introduced.

Apify operation intent is persisted before starting an actor, and its returned run ID is saved before waiting. A timeout cannot trigger a second identical start. Reconciliation can read a known run and its dataset only with explicit authorization; offline mode rejects even those reads. This uses the documented [RunClientAsync status API](https://docs.apify.com/api/client/python/reference/class/RunClientAsync) and retains the existing actor parameters.

Graph projection distinguishes unverified claims, reviewed support, refutation and interpretations. Repeated self-authored origins cannot become third-party corroboration. Additional people require distinct source anchors and reviewed relationships; a lead alone does not create a collaborator edge. PeerClaim nodes and private journal storage are outside the case and survive a public graph replacement.

## What has not been activated

- The existing live investigation API still uses its legacy orchestration. The new entrypoint is `run_recursive_investigation`; activation of paid workers is separate from this offline milestone.
- A `CrusoeOpenAIWorker` can implement the Python worker contract when the actual model/endpoint is supplied. `ClaudeSDKClient` is not pointed at an OpenAI endpoint.
- The default reviewer fails closed. A semantic model reviewer and portrait synthesizer require a separately authorized, measured evaluation. With no synthesizer, all five portrait sections remain explicitly missing.
- Packet sizes are UTF-8 serialized bytes, a conservative proxy for context size, **not measured provider tokens**. The demo's packet allowance is 12,000 bytes. System prompts, tool schemas and future model overhead must be included when paid execution is evaluated.
- Live source fault recovery, native nested SDK behavior, model-quality metrics and private-agent negotiation are not established by this replay.
- Spending-cap redesign, Graphiti migration and multi-tenant RBAC remain deferred.

## Verification

The backend tests exercise cross-case/stale access, immutable excerpts, duplicate admission, bounded recursion, cancellation/restart, unknown costs, recovery, source-cache misses and graph support. Frontend checks use `npm run lint` and `npm run build`.

`frontend/scripts/check-replay.mjs <replay.json>` runs against an isolated Chrome debugging port at `127.0.0.1:9223` and the frontend at `127.0.0.1:3000`. It blocks non-frontend HTTP requests, delivers every event twice, checks task/claim counts and mobile overflow, and captures screenshots under `/private/tmp`. It does not start an investigation.
