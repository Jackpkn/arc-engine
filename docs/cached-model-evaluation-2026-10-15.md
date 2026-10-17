# Cache-only model evaluation — October 15, 2026

**Result: partial; do not activate the recursive path as the live default yet.**

One authorized evaluation used session `543e4074-d81b-4ec5-993d-d23c36794c83`.
Six Haiku 5.5 generation requests reported **43,736 input tokens and 5,317 output
tokens**, costing **$0.0070321** at published standard rates. This is calculated
from response usage receipts, not an independently retrieved billing invoice.
Six free token-counting calls preceded generation. No paid call was retried.

Source-provider calls, Neo4j writes, peer writes and private-journal reads: **zero**.
Cached history was opened read-only. New artifacts are in
`/private/tmp/arc-cached-model-eval`.

## Implementation and spending boundaries

`backend/evaluate_research.py` imports six current cached sources and excludes the
superseded output notice. Operator identity decisions remain separate from proof.
It saves both baseline graphs from local events: the original 19-node dossier
without portrait sections and the repaired 29-node dossier with five sections.

`research/eval_adapters.py` provides extraction, ResearchWorker, semantic critic
and portrait adapters. The existing recursive scheduler owns task admission.
This evaluation uses single-response Messages API requests, not SDK multi-call
agent sessions. The live SDK integration and normal investigation are unchanged.

`research/eval_model.py` allows only HTTPS POST to Anthropic Messages/token-count
endpoints with the fixed authorized model. External tools, MCP servers, caching,
redirects and retries are disabled. The runner additionally blocks non-Anthropic
socket connections, subprocesses, Neo4j drivers and unrelated/writable production
SQLite access. Only the model credential is read from local configuration.

- At most 13 generations: one extraction, eight workers, three critics, one portrait.
- Request bytes <=48,000 and preflight counted input <=48,000.
- Reserve 50,000 input tokens plus hard `max_tokens=4096` per request.
- Maximum total reservation at documented prices: **$0.091624**.
- One concurrent worker for this trial; approved three-wave/depth-two/eight-task
  upper bounds remain enforced.
- Pending usage is persisted before generation. Unknown usage prevents more calls.
- Existing output directories cannot be silently reused or automatically resumed.

Token counting is an estimate. The text-byte bound and extra input reserve protect
against small count differences; the calculation relies on documented text-token
billing and current prices. This is an application reservation, not a prepaid
provider account cap. Actual response usage stayed well within it.

## Actual extracted hypotheses and support

The model was asked for one consequential claim from each selected project:
Stela, Flightdeck and Open Agent Network. Source passages were selected locally;
the model generated the claims rather than reusing deterministic fixture claims.

| Actual hypothesis | Final status | Explanation |
| --- | --- | --- |
| Stela multi-file diff/one-click atomic application | SELF_REPORTED_ONLY | Reviewed only as an attributed LinkedIn statement |
| Stela multi-model routing reduced latency 40% | UNCHECKED | Worker returned fenced JSON, rejected before review |
| Flightdeck git comparison and local-only/no-telemetry behavior | SELF_REPORTED_ONLY | Author's statements, not code/runtime verification |

**Extraction failure:** two Stela claims and no OAN claim. The model acknowledged
this in its selection explanation. The schema validates three claims/citations
but does not enforce project coverage. No second extraction was purchased.

No hypothesis reached ARTIFACT_SUPPORTED or THIRD_PARTY_SUPPORTED.

The critic accepted four findings, rejected zero, and proposed no Wave 2/3 tasks.
One accepted finding is CodePilot context and does not support Stela independently.
Repeated self-authored snippets were not promoted to third-party corroboration.

The scheduler stopped after **one wave and three tasks**, with `SOURCES_EXHAUSTED`.
This describes its decision, not proof that all useful cached sources were read.
No child delegation happened in this live trial. The earlier deterministic replay
is still the tested demonstration of recursive expansion.

The fenced worker result was subsequently parsed offline by removing only its
outer JSON fence. It passes WorkerResult validation. The recovered proposal is
saved separately, unreviewed; the case and support labels were not changed.

## Actual retrieval quality

Worker packets were 11,718, 11,784 and 11,723 bytes. Each had two passages and
208 excluded passage IDs. Roughly two-thirds was metadata, not evidence passage
records. The Flightdeck worker received its post and an OAN post, but missed the
relevant cached README. The critic received alternatives including a large search
snippet, a full post record and a short README CLI section; these were poorly
targeted to the git-comparison and telemetry questions.

The raw-140,981-byte to ~12KB comparison proves a size reduction, **not** a measured
reduction in hallucinations or irrelevant context. Packet composition needs work.

## Graph and five-part portrait

The uncommitted preview has **6 nodes and 4 edges**: the subject, two accepted
claim nodes and three evidence nodes. The unchecked latency hypothesis remains
visible in coverage. No collaborator or ownership edges were invented.

The model generated all five portrait sections, but the whole portrait failed
citation validation: `builder_velocity` has no span citations. Four other sections
have valid supplied passage IDs and matching source IDs. None was committed.

| Section | Candidate content | Validation |
| --- | --- | --- |
| Core obsessions | AI coding workflows, reviewable diffs, measuring what survives into git | Cited; self-report limitations stated |
| Builder velocity | Says velocity cannot be measured without commit/release evidence | Missing required span citations |
| How they think | Tentative preference for checking/reviewability, framed as interpretation of project copy | Cited |
| Inferred relationships | No invented collaborators; AmoYou affiliation remains self-reported | Cited |
| Claim corroboration | Functionality and impact stay unverified self-reports | Cited |

The original dossier was already cautious about self-reports. This trial does not
establish better semantic accuracy. The repaired 29-node dossier covers more:
OAN, contradictory Flightdeck test counts, conflicting AIConcierge scope statements
and a wider career timeline. The narrower trial missed those. No independent
ground truth was collected, and no accuracy percentage is justified.

## Verification and artifacts

- **60 backend tests passed**, including nine new evaluation-boundary checks.
- Ruff and `git diff --check` passed.
- No frontend code changed; frontend lint/build were not rerun for this trial.
- Model quality: partial, with original failures preserved. No paid retry.
- Normal live pipeline and production Neo4j remain unchanged.

Files under `/private/tmp/arc-cached-model-eval`:

- `summary.json`, `usage.json`: outcome, request token counts and computed costs.
- `extracted-hypotheses.json`, `critic-decisions.json`: actual model decisions.
- `graph-preview.json`, `case-snapshot.json`, `event-trace.jsonl`: accepted case.
- `worker-packets.json`, `token-size-report.json`: real retrieved contexts.
- `request-*.json`, `response-*.json`: original requests/responses.
- `portrait-candidate-rejected.json`: full rejected portrait, explicitly labeled.
- `recovered-worker-proposal-unreviewed.json`: offline parsing diagnosis only.
- `quality-audit.json`: detailed coverage/format/citation failures.
- `baseline-dossiers.json`: original and repaired comparison snapshots.

`evaluation.json` is an inspection bundle; it is not labeled offline and is not
currently accepted by the offline-only frontend replay viewer.

## Next changes, before another paid evaluation

1. Enforce per-project extraction coverage in the contract.
2. Store excluded-ID manifests locally and send compact references/counts; retrieve
   linked artifact passages before unrelated keyword matches.
3. Use structured output or tightly bounded whole-fence normalization. Never buy
   an automatic JSON repair call.
4. Represent insufficient-evidence portrait sections explicitly, and distinguish
   section-level failures without fabricating citations.
5. Check retrieval coverage before treating cached sources as exhausted.

Crusoe wiring awaits the exact account endpoint/model details. No Crusoe request
or speculative provider configuration was added. The authorized paid trial is
consumed; another trial requires a new user request.

Official sources checked October 15, 2026:
[Haiku pricing/model](https://platform.claude.com/docs/en/models/haiku-5-5/overview),
[token counting](https://platform.claude.com/docs/en/build-with-claude/token-counting),
[Messages API](https://platform.claude.com/docs/en/api/messages/create),
[SDK budget overshoot](https://github.com/anthropics/claude-agent-sdk-python/blob/main/examples/max_budget_usd.py).
