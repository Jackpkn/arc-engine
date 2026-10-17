# ARC Engine

FastAPI → Claude Agent SDK + OSINT MCP harvesting → SQLite evidence case →
bounded recursive workers and critic → reviewed graph + cited portrait → Neo4j.

## Inspect the recursive workflow in the normal workspace

Open [ARC](http://localhost:3000) with the API running on port 8000. Click
**Review saved Pawan kumar evidence · no credits** in Conversation. This starts
the cached review through the same investigation creation, SSE and history routes
as normal research; no file upload or separate replay screen is needed.

- Conversation shows three waves, eight tasks, review/recovery decisions and the
  stop reason. The cached run deliberately uses reviewed deterministic fixtures;
  simulated outages are labeled. It is not a fresh model investigation.
- Dossier includes Stela, Flightdeck and Open Agent Network. Click a claim in
  **What the evidence supports**, a claim card, or **Inspect exact passages** in
  a portrait section. The drawer shows source text, the support badge, original
  collection date, source URL, JSON pointer, character offsets when present,
  snapshot hash and unresolved gaps. JSON text fields display readably while the
  full captured record remains expandable.
- Graph node clicks and the **Inspect node** selector open the same drawer.
  Cached graphs are explicitly uncommitted previews. Reloading or reopening
  history reuses the saved events and case without restarting research.
- Four portrait sections reuse the previously paid model response, remapping
  citations only to hash-identical sources. Builder Velocity is visibly
  insufficient because the saved response omitted its passage citations.
  These are model interpretations, not independently established judgments.

The cached action uses session `543e4074-d81b-4ec5-993d-d23c36794c83`, reads its
saved source snapshots, and writes a new local review case/history. It makes no
model, scraper, GitHub or Neo4j calls and does not access the private journal.
Follow-up model chat is disabled for this mode. Saved portrait inputs default to
`/private/tmp/arc-cached-model-eval` (`ARC_CACHED_MODEL_EVAL_DIR` override); if those
artifacts are unavailable, portrait sections are reported missing. Existing
completed review events retain their displayed portrait across API restarts.

Normal **Investigate** now calls `research/pipeline.py`: existing SDK harvesting
followed by the recursive scheduler, focused model workers/critic, cited portrait,
and a reviewed graph commit. Source acquisition remains the existing harvest
stage; recursive workers inspect the captured case, without making additional
source calls. This new paid path has not been exercised end to end. Browser
verification uses only the cached path; starting normal research still spends
provider/model credits and requires the user's authorization.

Retrieval uses case-scoped SQLite FTS5 (`bm25`, strict terms then keyword OR
fallback), prioritizes explicitly cited passages and linked repository sections,
and stores large exclusion manifests locally instead of in the model prompt.
This is lexical retrieval, not semantic embeddings. Local JSON normalization
accepts whole Markdown fences and trailing commas outside strings; schema,
scope, citation and review checks remain mandatory. Missing evidence is never
invented to repair an output. [SQLite FTS5 documentation](https://www.sqlite.org/fts5.html)
was consulted October 15, 2026.

Verification (October 16): 69 backend tests, ESLint, production build, browser
clicks through the actual FastAPI/SSE workspace, saved-session reload and mobile
overflow checks. The
browser receipt is `/private/tmp/arc-workspace-browser.json`; case artifacts are
under `.arc/research/<review-session-id>/`. The browser check can be repeated
without starting another review:

```sh
node frontend/scripts/check-workspace-research.mjs <completed-review-session-id>
```

It requires the local app/API and an isolated Chrome debugging session on port
9223. Its request guard rejects fresh investigations and external requests.

Operator identity choices are retained as context through extraction, workers
and critic; identity-search snippets stay in the source snapshot but are excluded
from claim packets. They are not independent corroboration. Failed/cancelled
research persists reported costs too; unknown receipts block follow-ups and the
UI explicitly labels the displayed known partial cost as incomplete.

## Product studio — October 15, 2026

Open `/studio` for the sharp, colorful product mockup: interpretation-led
fictional profiles, short onboarding steps, a blank journal and time-based
judgment confidence. Humans contribute evidence; the agent authors the judgment.
There are no permission, approval or owner-written judgment flows in this studio.
Its drafts stay in tab memory and disappear on reload; it makes no
research, model, connector or journal API calls. The working local-agent
simulation remains at `/pilot`.

- [Founder requirements, objectives and next judgment-layer work](docs/arc-product-requirements.md)

## Three-agent local pilot — October 15, 2026

Open `/pilot` from the sidebar to try a fictional three-person collaboration.
The pilot has separate gates for confidential context exchange under a standing
mandate and human-visible release. It uses the existing loopback model adapter,
requires no paid research or Neo4j, and blocks rather than simulating success when
the local model is unavailable. One browser controls all three fictional people;
this is not a deployment for real confidential peer journals.

- [Concrete development plan and local setup](docs/three-agent-pilot-plan.md)
- [Current capabilities and appearance in plain English](docs/pilot-in-plain-english.md)

The private vault currently uses file permissions and separate storage, **not
encryption at rest**. Keep the API on loopback. Existing public-profile approval
remains separate from the pilot's circle-specific mandate.


## Core profile workflow — October 15, 2026

Open the existing [Pawan public dossier](http://localhost:3000/u/543e4074-d81b-4ec5-993d-d23c36794c83)
with the frontend and API running. The workspace Dossier also links here.
Opening it does not start an investigation.

1. **Public portrait:** Neo4j serves the committed graph and five sourced ARC
   Inferred Judgments: core obsessions, builder velocity, thinking, inferred
   relationships and claim corroboration. These are interpretations with explicit
   limitations, not verified personality or credibility ratings.
2. **Peer / Friend Judgments:** the separate view accepts name, public profile URL,
   relationship and statement. These are self-attributed public statements, not
   authenticated endorsements. `PeerClaim` nodes link to the stable
   `ARCInvestigation`, separate from `ARCNode` / `AIJudgment`. Scoped graph rebuilds
   preserve peers. Peer text never enters the OSINT architect or its evidence.
3. **Claim This Profile:** use the claim section in the dossier. This is local
   activation, not proof of identity. A random HttpOnly, SameSite=Strict owner
   cookie grants access from the local browser; only its hash is stored. Add raw
   notes, goals or context in the Private Local Journal. The dedicated
   `.arc/private/vault.sqlite3` is isolated from public Neo4j and research history,
   with directory/file permissions 0700/0600. It is **not encrypted at rest**.
   Retain the owner cookie; account recovery and globally verified claiming are
   not implemented. Do not expose private routes behind a loopback proxy.
4. **Representation:** draft from the journal locally or write shareable context
   manually. Review and explicitly approve each statement for visitors. Journal
   edits revoke readiness until approval is renewed. The private draft sees notes;
   the public responder sees only approved statements and the public dossier. It
   selects allowed fact IDs; the server renders known text instead of arbitrary
   model output. Raw notes never enter visitor prompts/responses, public Neo4j,
   research logs or SSE. The Agent view accepts questions/collaboration pitches,
   saving completed requests in the private inbox. It cannot make commitments.

Optional settings in `.env` (no cloud fallback):

```dotenv
ARC_LOCAL_AGENT_URL=http://localhost:8080/v1
ARC_LOCAL_MODEL=ConwayResearch/Underdog-Saluki-27B-1.0
# Application request timeout, not a provider quota:
ARC_LOCAL_TIMEOUT_SECONDS=90
# Optional dedicated private location, separate from ARC_DATABASE_PATH:
# ARC_PRIVATE_VAULT_PATH=/absolute/private/directory/vault.sqlite3
```

The [Saluki model card](https://huggingface.co/ConwayResearch/Underdog-Saluki-27B-1.0)
was checked October 15: the published artifact is GGUF for llama.cpp, not MLX
weights. With an existing local model file and llama-server installation:

```sh
llama-server -m /path/to/Underdog-Saluki-27B-1.0-IQ2-mix.gguf \
  --jinja -ngl 99 -fa on -c 32768 --host 127.0.0.1 --port 8080
```

For [MLX-LM](https://github.com/ml-explore/mlx-lm), supply compatible MLX weights
and set `ARC_LOCAL_MODEL` to the model your server serves. ARC uses the same
OpenAI-compatible chat endpoint; it does not download or convert weights.
Temperature 0 and `enable_thinking=false` follow the Saluki card's fast direct
mode. The 1,024-token output bound is an application response bound. When local
inference is unavailable/malformed, private drafting asks for manual context;
visitors see a labeled static approved brief. No Anthropic fallback occurs.

**Verified:** authorized cache-only repair and portrait generation committed 29
nodes and five sections; Neo4j/API readback passed. Recovered LinkedIn evidence
contains 11 experience entries. Zero source-provider calls; the two requested
Claude passes reported $0.04819015 combined. Backups/receipts are under ignored
`.arc/verification/`. Eleven offline backend checks, ESLint, production build and
intercepted desktop/mobile workflows passed. The real profile remains unclaimed;
no fabricated peer statements were published. Peer persistence is implemented but
was not exercised by writing fake live comments. Live Saluki inference remains
unverified: no server was listening on port 8080. Spending-cap expansion,
Graphiti and multi-tenant RBAC remain deferred.

Modules: `public_profiles.py` / `profile_routes.py` own public and peer storage;
`private_vault.py` / `vault_routes.py` own local secrets and consent;
`local_agent.py` / `agent_routes.py` own the constrained bridge. The private vault
is local to the **machine running the API**, not automatically every visitor's
device. Remote pairing/decentralized transport remains future work; this is the
single-device claim/journal/representation path.

## Run

The existing Python 3.13 uv environment and resolved dependencies are preserved.
Install them with `uv sync --locked`. Firecrawl's MCP process also requires Node.js
and `npx`.

Configure your local `.env` (already ignored by git):

```dotenv
ANTHROPIC_API_KEY=...
EXA_API_KEY=...
APIFY_API_TOKEN=...
# Approved per-run event-charge allowance (separate platform/storage charges excluded):
APIFY_MAX_TOTAL_CHARGE_USD=0.03
NEO4J_URI=neo4j+s://...
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=...

# Optional integrations; mounted when their keys are configured:
FIRECRAWL_API_KEY=...
GITHUB_TOKEN=...

# User-selected default model (optional override):
CLAUDE_MODEL=claude-haiku-5-5
# Optional per-role overrides: CLAUDE_ORCHESTRATOR_MODEL,
# CLAUDE_HARVESTER_MODEL, CLAUDE_ARCHITECT_MODEL.
# Approved Claude threshold for harvesting, graph architect and follow-ups:
CLAUDE_MAX_BUDGET_USD=1.50

# Optional runtime settings:
NEO4J_DATABASE=neo4j
OSINT_MCP_URL=http://127.0.0.1:8001/mcp
# Optional: defaults to this repository's .arc/arc.sqlite3
# ARC_DATABASE_PATH=/absolute/path/to/arc.sqlite3
```

`NEO4J_USERNAME` is the preferred setting; `NEO4J_USER` remains a supported alias.
The SDK also supports its existing Claude authentication. Use a GitHub token
restricted to public-source access. The SDK budget threshold covers harvesting
the architect pass and follow-up replies; it excludes Exa, Apify and Firecrawl charges and is not a
hard prepaid cap. Haiku 5.5 is the user-selected default; per-role overrides take
precedence over `CLAUDE_MODEL`. The API rejects new investigations without an
explicit spending threshold. Model/budget configuration is not permission for a coding
agent to run Claude: explicit user approval is required for that run, including
tests. See [AGENTS.md](AGENTS.md). Account limits and Exa/Firecrawl spending allowances
remain undecided.

On October 14, 2026, the user authorized a Claude threshold below $2 and delegated
the Apify cap choice. The local configuration now uses $1.50 for Claude per
investigation and $0.03 for Apify event charges per actor run. The posts actor lists
[$2 per 1,000 posts](https://apify.com/supreme_coder/linkedin-post/pricing), or $0.02
for ARC's maximum ten posts before startup charges; $0.03 leaves startup headroom.
The configured no-email profile mode lists
[$4 per 1,000 profiles](https://apify.com/harvestapi/linkedin-profile-scraper), or
$0.004 for the single requested profile. These are application allowances, not
price guarantees or an aggregate $2 ceiling: repeated actor runs, Exa, Firecrawl,
separate platform charges and SDK budget overshoot are not jointly capped.

Start the unified custom MCP server:

```sh
uv run --locked --env-file .env python -m backend.mcp_servers.osint_mcp
```

Start the API in another terminal:

```sh
uv run --locked --env-file .env uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

Create an investigation with `POST /api/investigations` and JSON
`{"target":"person name or public profile URL"}`. The response includes a
`stream_url`; open it with an SSE client. The original sample's combined endpoint
also works:

```sh
curl -N --get 'http://127.0.0.1:8000/api/investigate/stream/my-first-run' \
  --data-urlencode 'target=person name or public profile URL'
```

Starting either route runs real providers and automatically commits the validated
graph to the configured Neo4j database. Reusing a session ID resumes its event
history instead of launching another investigation. SSE supports `Last-Event-ID`.
Disconnecting the viewer leaves the run active; shutting down the API cancels its
local tasks. Apify uses the actor's configured execution timeout; cancelling a
local request does not guarantee that its remote actor stops or avoids charges.

## Files

- `backend/mcp_servers/osint_mcp.py`: the four custom tools in one FastMCP server.
- `backend/agent.py`: registry of real MCP integrations.
- `backend/orchestrator.py`: stateful `ClaudeSDKClient`, native harvester, hooks, human input and budget handoff.
- `backend/conversation.py`: evidence-only follow-up sessions and incremental cost accounting.
- `backend/prompts.py`: stable prompts shared across runs for SDK-managed caching.
- `backend/scratchpad.py`: actual tool responses, provenance and draft-node events.
- `backend/tool_outputs.py`: MCP normalization, scoped SDK-file recovery and professional profile views.
- `backend/graph_architect.py`: SDK structured output and evidence-reference validation.
- `backend/graph_models.py`: graph schema, identity and interpretation constraints.
- `backend/graph_store.py`: grouped `UNWIND` writes in one Neo4j transaction.
- `backend/main.py`: API routes, run ownership and browser SSE.
- `backend/investigations.py`, `backend/storage.py`: runtime state, SQLite history and interruption recovery.
- `backend/source_cache.py`, `backend/mcp_servers/cached_proxy.py`: persistent source reuse and upstream MCP proxy.
- `backend/import_history.py`: explicit offline import of a completed legacy snapshot.
- `frontend/components/`: workspace, tool stream, force graph and human-review panel.
- `frontend/lib/`: typed event reducer and API/SSE lifecycle.

## Working memory and frontend

`InvestigationScratchpad(session_id)` provides an `sse_queue` of structured
events. Pass the existing API's event callback as the second argument to use its
SSE replay buffer instead; callback mode does not also fill the standalone queue.
`emit(event)` stays synchronous for compatibility with the API and graph architect.

SDK hooks now await `record_tool_start`, `record_tool_result` and
`record_tool_failure`. Events retain `tool.started`, `tool.finished` and
`tool.failed`, with `tool_use_id` for correlation. Start events include arguments
and subagent identity. Successful evidence produces `graph.draft_node` with an
evidence ID; failed, empty, duplicate or over-limit responses do not create nodes.
Every scratchpad event includes a session ID and timestamp. The existing 500 KB
evidence limit is configurable with `max_evidence_bytes`; this is an application
memory limit, not a provider limit or a bound on SSE history.

The SDK can save large successful MCP results to its session `tool-results`
directory and replace them with a file notice. The PostToolUse hook recovers only
files belonging to its own SDK session, bounded by the remaining evidence budget.
It retains the original in the scratchpad and supplies a professional-field view
through `updatedToolOutput`; the architect uses the same view. Profile images,
related-person suggestions, contacts and locale/tracking metadata are omitted
from that view; descriptions, career entries, education, projects and source links
are not truncated. A notice that cannot be recovered emits `evidence.skipped`
and never becomes a draft node. No larger global token limit or paid re-scrape
is used. See [SDK output persistence](https://code.claude.com/docs/en/mcp#mcp-output-limits-and-warnings)
and [PostToolUse output replacement](https://code.claude.com/docs/en/hooks#posttooluse-decision-control).

Prompts explicitly prohibit deriving GitHub handles from LinkedIn slugs. A source
link permits inspection; it does not independently prove cross-platform identity.
In the user-started run, the disputed handle was present in the original Exa
snippet; it was not invented by the agent. The conflict with links to Jackpkn
was correctly escalated for human clarification.

On October 14, a user-started investigation completed and committed a graph, but
its 60,977-byte LinkedIn result had been replaced by a transport notice that ARC
mistakenly captured as evidence. The saved original was recovered offline (11
experience entries, 3 education entries, 7 projects). Regression checks through
the real SDK callback confirmed full capture and a 30,489-character model view;
unreadable notices, oversized files and cross-session/arbitrary paths are rejected.
The original and recovery receipt are in `.arc/verification/apify-pawan-profile-*-20261014.json`
and `.arc/verification/apify-pawan-profile-recovery-receipt.json`. The existing
graph/assessment was not regenerated or edited; it still reflects the incomplete
input from that run. No new provider calls, Claude sessions or Neo4j writes were
made during this repair. The rewritten result has not yet been exercised in a new
live Claude session.

`request_human_input(tool_id, question, candidates)` emits `human.interrupt`
with a unique `request_id`. `resolve_human_input(request_id, answer)` resolves
only that question, rejecting stale or duplicate answers. Cancelling the waiter
removes the pending request. The orchestrator uses native `AskUserQuestion` with
`can_use_tool`, not a tool that fabricates approval or defaults to the first
candidate. Subagents report ambiguity to the orchestrator because the SDK does
not expose `AskUserQuestion` inside Agent-spawned subagents.

The UI submits `POST /api/investigate/{session_id}/human-reply` with
`{"request_id":"…","selected":["candidate label"],"text":""}`. A text answer
instead uses an empty `selected` array. Invalid, duplicate and stale answers are
rejected. Human decisions are passed to the graph architect as identity context,
separately from source evidence. They do not independently verify profile claims.
`POST /api/investigate/{session_id}/cancel` stops the local pipeline.
`GET /api/investigate/{session_id}/evidence/{evidence_id}` reads captured output
without fetching it again. There is no cross-session evidence lookup.

Start the frontend:

```sh
cd frontend
npm run dev
```

Open `http://localhost:3000`. A collapsible sidebar contains New investigation,
saved investigation history, Conversation, Dossier, Graph and Peer claims. Conversation
is the default, with a wide centred reading column, unboxed agent messages and a
bottom composer. The header shows the target and live status; source activity,
reported cost and cache usage live in the details drawer. Its scroll
position and expanded tool cards survive view changes; event collection continues
while another view is open. Tool starts/results share a collapsible card with
provider, status, duration, arguments and captured-output access. Activity spinners
stop for human questions and terminal states; source activity reflects actual run events.
Agent messages stay unboxed and render Markdown headings, lists, source links,
tables and code blocks through `components/agent-response.tsx`. Responses include
copy controls; scrolling up pauses following, with a Jump to latest control to
resume. Completed messages are memoized while new text streams. The renderer uses
[react-markdown](https://github.com/remarkjs/react-markdown) and
[remark-gfm](https://github.com/remarkjs/remark-gfm), checked against their official
documentation on October 14, 2026. Raw HTML is skipped, external links are limited
to HTTP(S), and response images do not trigger remote requests.
Identity questions appear inline in Conversation; other views show a return-to-answer
banner while a question is pending. The graph has category filters,
zoom/fit controls, draft rings and a source inspector; the dossier pairs claims with
their recorded supporting or contradicting graph edges and evidence-state badges.
AI confidence and the score are model estimates, not verified credibility ratings.
The score can be absent when evidence is insufficient. A proposed graph is never
marked committed before the database transaction succeeds. Peer endorsements,
profile claiming and local-agent connections are not implemented; the Peer claims
view states that explicitly.

The sidebar UI was checked on October 15, 2026 using offline replay of the saved
investigation: history selection, new draft, conversation composer, details drawer,
graph/dossier navigation, follow-up submission and replay past earlier completion,
mobile navigation and viewport fitting. Browser backend requests were intercepted;
no new Claude/provider calls or Neo4j writes were made. A duplicate React-key
rendering issue was corrected and the browser check passed without console errors.

After an investigation completes, the composer sends follow-ups to
`POST /api/investigate/{session_id}/messages` with `message` and an idempotent
`request_id`. A separate `ClaudeSDKClient` conversation receives captured evidence,
the committed graph and operator decisions, then resumes its own SDK session on
later replies. It has no tools or MCP servers and does not launch new scraping or
change the graph. Follow-ups use the configured orchestrator model and the remaining
Claude investigation budget. Resumed SDK costs are cumulative, so ARC records only
each reply's increment; missing final cost blocks further replies. This follows
the [SDK session lifecycle](https://code.claude.com/docs/en/agent-sdk/sessions) and
[cost tracking guidance](https://code.claude.com/docs/en/agent-sdk/cost-tracking),
checked October 14, 2026. Offline API checks covered resume, duplicate requests,
budget exhaustion, missing usage and SSE replay. Live Claude follow-up behavior
has not been exercised.

`GET /api/investigations` lists retained runs from SQLite. History survives
ordinary server restarts. SSE accepts an `after` event offset
(or `Last-Event-ID`) and emits `stream.end` after the complete current replay;
the browser keeps reading past old investigation/reply completion events.

The browser creates a run by POST with an idempotency ID, then subscribes to the
read-only SSE URL. EventSource reconnects with `Last-Event-ID`; a tab refresh
replays its session without creating another investigation. Opening the page
does not start a new provider operation; submitting a new investigation or follow-up does.
Use `NEXT_PUBLIC_API_URL` in `frontend/.env.local` to change the API origin (default
`http://localhost:8000`). Backend CORS permits localhost/127.0.0.1 port 3000 by
default; `ARC_FRONTEND_ORIGINS` overrides that comma-separated list.
Use `npm ci` to restore the locked dependencies,
`npm run lint` for ESLint and `npm run build` for the production build.

Scaffolded with the official `create-next-app` on October 14, 2026: Next.js
16.4.0, React 19.3.0 and Tailwind CSS 4. See the
[installation guide](https://nextjs.org/docs/app/getting-started/installation)
and [CLI reference](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Tool registry

| Server | Tools / transport |
| --- | --- |
| ARC custom server | `search_identity_exa`, `scrape_linkedin_profile`, `scrape_linkedin_posts`, `inspect_github_developer_profile`; Streamable HTTP on port 8001 |
| Firecrawl | `firecrawl_scrape`; SDK-managed `npx -y firecrawl-mcp` stdio process |
| GitHub official | Allowlisted repository, commit, issue and PR reads; hosted read-only HTTP endpoint |
| Neo4j official | `get-schema`, `read-cypher`; `python -m neo4j_mcp_server` stdio using the configured Aura database credentials |

The SDK mounts OSINT, Firecrawl and GitHub through local FastMCP caching proxies.
Their original upstream transports and tools remain as listed above; Neo4j stays
direct and uncached. The proxy follows FastMCP's documented
[proxy provider](https://gofastmcp.com/servers/providers/proxy) and
[tool middleware](https://gofastmcp.com/servers/middleware) interfaces, checked
against the installed FastMCP 4.1 API on October 15, 2026.

## Permanent history and source reuse

SQLite stores investigation events, captured evidence, human decisions, Claude
budget/usage metadata, follow-up SDK session IDs and idempotent request IDs in
ignored `.arc/arc.sqlite3`. Set `ARC_DATABASE_PATH` to change the location. Keep
this database on local disk. The API enforces one worker with a process lock;
multiple local caching proxies share SQLite WAL transactions. Events and newly
captured evidence commit before notification to SSE clients. Completed runs load
on demand. Startup marks unfinished runs interrupted, retains their evidence and
blocks further chat spending when usage is uncertain. It never restarts paid
research or restores obsolete human-input waits. SDK follow-up resumption also
depends on the SDK's own local session files remaining available.

Successful source results are reused by exact tool and normalized input. LinkedIn
profile URL variants and GitHub handle case normalize; different queries, post
counts, file revisions, upstream configurations or credential fingerprints remain
separate. Credentials themselves are not written to cache keys. Empty successful
results can be reused; explicit errors, partial GitHub failures and SDK oversized
output notices are not treated as successful source snapshots.

No automatic expiry interval is assumed. The new-investigation composer provides
**Fetch fresh sources** (`refresh_sources: true` on the creation API); otherwise
saved results are reused. Explicit refresh fetches a matching request once per
investigation, then reuses it within that run. Each tool result carries its original
collection time; reused tools show **Reused** with the date in their details.
Scratchpad provenance distinguishes collection time from retrieval time. Reuse
does not establish that a source is still current and does not eliminate Claude
analysis charges or charges for different uncached requests.

A durable claim precedes upstream execution. Concurrent identical requests cannot
start duplicate provider calls. Failed/unknown outcomes block automatic repeats;
explicit fresh research can retry a failed request after operator review. A claim
left pending by an abrupt proxy crash stays blocked until the provider job has
been inspected and the pending claim reconciled locally; it does not expire and
automatically trigger another paid job. There is no automatic cache purge or
distributed multi-user cache in this local prototype.

On October 15, 2026, the completed Pawan investigation was imported: 387 events,
six historical evidence records and six reusable source responses. The cache
includes the recovered LinkedIn profile; the original historical graph/assessment
was not rewritten. The old snapshot did not retain human-answer payloads; the
migration does not fabricate those. New human decisions are stored durably.
Actual API restart replay matched the pre-migration SSE byte for byte. Offline
checks covered crash recovery, human answers, evidence accounting, costs/request
IDs, cache concurrency, fresh-once behavior, account/input separation, failure
blocking and ARC's real OSINT MCP through the proxy with its network client
replaced. No Claude or paid provider calls were made for these checks.

Run the offline regressions with:

```sh
.venv/bin/python -m unittest discover -s backend/tests -v
```

Missing provider keys produce errors rather than fabricated profiles. GitHub
inspection returns recently updated repositories, a bounded public-event sample,
and commit-author email **domains** with source links. These are attribution
signals, not verified identities or a measurement of total commit velocity.

Exa's web search tool follows the installed
[build-with-exa skill](.agents/skills/build-with-exa/SKILL.md): async `/search`,
`type="auto"`, and `contents={"highlights": True}`. It uses Exa's default result
count and returns titles, URLs, highlight-based snippets and available publication
dates. Claude handles the analysis; no separate Exa answer or research workflow
is invoked. No category, domain, date or cache-age filters are imposed.
`uv run --env-file .env` supplies the existing `EXA_API_KEY` to the MCP process;
the key stays out of source code and tool results.

Firecrawl follows the installed
[firecrawl-build skill](.agents/skills/firecrawl-build/SKILL.md). Exa discovers
URLs; Claude calls the official `firecrawl_scrape` MCP tool for public blogs,
portfolios and websites, requesting Markdown page content. Successful responses
enter the evidence scratchpad through the SDK's tool-result hook. The existing
`FIRECRAWL_API_KEY` in `.env` authenticates the MCP process; browser setup is not
needed for this API-key connection. Quote `.env` values that contain spaces.

## Current implementation limits

Run one API worker locally; events and scratchpads persist in SQLite. Active runs
are limited to 100 per process; completed history is not subject to that cap. Tool evidence is
limited to 500 KB per investigation; omitted responses produce an explicit event.
Successful graph commits retain their captured evidence in Neo4j. Graph nodes
are scoped to the investigation to avoid collisions between unrelated people.

Graph validation checks schema, unique node IDs, edge endpoints and evidence
references; it does not independently establish factual truth. This uses direct
Neo4j writes, not Graphiti, bi-temporal resolution or hybrid retrieval. Identity
questions have human review; final graph commits are automatic. Interrupted runs
remain readable but cannot resume harvesting automatically. There is no user
authentication: this remains a local, single-user application.

The Agent SDK manages prompt caching automatically. Stable prompts remain separate
from target/evidence content; `agent.usage` exposes cache-read and cache-creation
tokens plus reported USD cost. No separate Anthropic client or manual cache block
is required, and a fixed percentage saving is not guaranteed. Haiku 5.5 requires
at least 512 tokens for caching. See [SDK caching](https://code.claude.com/docs/en/agent-sdk/cost-tracking#track-cache-tokens)
and [Haiku 5.5](https://platform.claude.com/docs/en/models/haiku-5-5/overview).

Implementation checks on October 14, 2026 passed: Python imports, actual SDK hook
callbacks with saved provider output, native human answers through local ASGI
requests, invalid/stale replies, concurrent questions, cancellation, SSE replay,
grouped Cypher generation, frontend event transitions, ESLint, TypeScript and the
Next.js production build. The production page also rendered in isolated Chrome
at desktop and mobile sizes with no horizontal overflow, runtime exceptions or
backend requests on initial load. No SDK session, paid provider call or Neo4j write was
used. Live agent behavior and the database transaction remain unverified.

## Provider limits and cost decisions — checked October 14, 2026

Published ceilings are not spending allowances. Account plans, key-specific
limits and approved investigation budgets are still needed before configuring
account-wide throttling. No paid provider calls were made during this review.

| Service | Official guidance relevant to ARC | Current handling / pending decision |
| --- | --- | --- |
| Exa | Default `/search` limit is 10 queries/second shared by the team; individual keys can have lower limits. HTTP 402 means exhausted credits/key budget; 429 means rate limiting. [Docs](https://exa.ai/docs/admin/billing) | Basic `auto` search with highlights, provider-default result count. Distinct billing/rate errors; no application retry loop. Account allowance pending. |
| Apify | Default resource limit is 60 requests/second; actor-start endpoints allow 400. `X-RateLimit-Limit` identifies the endpoint limit. Actor concurrency/memory and pricing are separate. [API limits](https://docs.apify.com/api/v2#rate-limiting) | Both configured actors use pay-per-event pricing. Calls require `APIFY_MAX_TOTAL_CHARGE_USD`, passed as `max_total_charge_usd`; `max_items` alone is not a dollar cap. Profile requests explicitly disable email enrichment. [SDK parameters](https://docs.apify.com/api/client/python/reference/class/ActorClientAsync) |
| Firecrawl | `/scrape` limits are 10/100/500/5,000/10,000 requests per minute for Free/Hobby/Standard/Growth/Scale, shared by the team. Browser concurrency is separate. [Rate limits](https://docs.firecrawl.dev/rate-limits) | Only the scrape tool is allowlisted. Basic page scraping costs one credit; options such as JSON extraction add credits, and a returned error page can still be billed. MCP argument restrictions and account throttling remain to be configured. [Billing](https://docs.firecrawl.dev/billing) |
| GitHub | General REST limits are 60 requests/hour unauthenticated or 5,000/hour with a personal token; search has separate limits. [Limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api) | Custom-tool requests are serialized and an inspection stops on 403/429, reporting supplied retry/reset headers. This follows [GitHub's guidance](https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api). The official MCP process has separate transport handling. |
| Claude | Request, input-token and output-token limits depend on model and usage tier. [Rate limits](https://platform.claude.com/docs/en/api/rate-limits) | User-selected Haiku 5.5 default with optional per-role overrides. No invocation without explicit permission. Tier and budgets remain pending; no Anthropic verification requests were made. |
| Neo4j Aura | Instance CPU, memory and transaction resources constrain workloads. [Instance resources](https://neo4j.com/docs/aura/managing-instances/instance-resources/) | Official MCP stdio access is registered read-only and live-verified. The graph architect still writes through the direct driver. Confirm instance capacity before setting workload limits. |

Removed the hand-picked Exa 30-second and Apify 120/150-second overrides.
Exa now uses the installed SDK's network timeout; Apify uses actor-configured
runtime and its SDK's normal wait behavior. These defaults are not cost caps.
Apify starts use the SDK's documented non-rewindable request body so the paid
POST is sent once. The installed SDK rejects `max_retries=0`; read requests retain
its normal retry handling. Run IDs are logged before waiting, allowing recovery
without starting another actor. Streaming request bodies are experimental in
apify-client 3.3; recheck that behavior when upgrading. The event-charge cap does
not cap separate platform/storage charges. [Apify billing](https://docs.apify.com/actors/running/actors-in-store)
External MCP servers have their own retries; ARC does not yet enforce a shared
retry or spending allowance across services.

Existing result and turn bounds are application choices, not service limits:
one to ten posts (`max_posts`, default ten), twelve repos, thirty events, up to five commit lookups, fifteen harvest
turns, eight turns per subagent and five architect turns. Review those choices
alongside the approved per-investigation budget before a live agent run.

## API references checked on October 14, 2026

- [Claude SDK lifecycle and MCP configuration](https://code.claude.com/docs/en/agent-sdk/python),
  [subagents](https://code.claude.com/docs/en/agent-sdk/subagents), and
  [structured outputs](https://code.claude.com/docs/en/agent-sdk/structured-outputs).
- [Native human questions](https://code.claude.com/docs/en/agent-sdk/user-input),
  [permission callbacks](https://code.claude.com/docs/en/agent-sdk/permissions),
  and [Neo4j managed transactions](https://neo4j.com/docs/python-manual/current/transactions/).
- [Force graph canvas API](https://github.com/vasturiano/react-force-graph).
- [FastMCP HTTP serving](https://gofastmcp.com/deployment/running-server).
- [Exa async search](https://exa.ai/docs/sdks/quickstart).
- [Apify async actor API](https://docs.apify.com/api/client/python/reference/class/ActorClientAsync)
  uses `run_timeout=timedelta(...)` and typed run results in the installed client.
  The [posts actor schema](https://apify.com/supreme_coder/linkedin-post/input-schema)
  uses `limitPerSource`, not `maxPosts`.
- [Firecrawl's official MCP server](https://github.com/firecrawl/firecrawl-mcp-server).
- [GitHub's current official MCP server](https://github.com/github/github-mcp-server)
  replaces the legacy `@modelcontextprotocol/server-github` choice. Current
  [PushEvent payloads](https://docs.github.com/en/rest/using-the-rest-api/github-event-types#pushevent)
  expose a head SHA; the custom tool fetches those commits separately.

Local syntax/import checks and discovery of the four actual MCP tools passed.
Live Exa search succeeded on October 14, 2026, returning ten results with
highlights. An earlier authentication error came from duplicate `EXA_API_KEY`
assignments: uv loaded the first, rejected key. The duplicate was removed and
the existing working key retained. Keep one assignment per credential in `.env`.
The configured official Firecrawl MCP server also passed a live scrape of
`https://example.com`, returning 959 characters of Markdown. Passing its response
through the scratchpad produced an evidence record and a draft-node event.
This verified MCP transport, authentication, scraping and scratchpad handling;
the full Claude-driven workflow has not yet been exercised.

On October 14, 2026, the user authorized live Apify and Neo4j checks. Apify
account authentication and metadata access for both configured LinkedIn actors
returned HTTP 200. The user subsequently supplied their LinkedIn profile and
authorized one live scrape. ARC's actual FastMCP profile tool returned the
matching profile and its output passed scratchpad/draft-node capture. Exactly
one remote actor run was created, with a $0.004 event-charge limit derived from
the actor's current single-profile price; no posts or email enrichment were
requested. Run `w9XkLcEmBefDmZR97` finished `SUCCEEDED`. Its completion response
reported `usage_total_usd=0.0` and zero charged events; this is the observed run
metadata, not a guarantee about later billing or storage charges.

The first attempt failed locally because the SDK rejects a zero retry setting;
a run-history check confirmed zero runs before the corrected attempt. The
verification used a real in-process FastMCP client, not a mock or Claude session.
The profile response and verification receipt are saved under ignored
`.arc/verification/` for offline reuse. The $0.004 setting applied only to this
verification; a general application spending allowance remains undecided.

Neo4j database authentication passed with `RETURN 1`. The official
`neo4j-mcp-server==1.6.0` also exposed `get-schema` and `read-cypher`; the latter
successfully executed `RETURN 1 AS connection_check`. ARC now registers that
official server over stdio with `NEO4J_READ_ONLY=true` and telemetry disabled.
This local MCP process connects to the existing Aura database. It does not use
Claude to execute checks, and no graph data was written.

The separate Aura-hosted MCP endpoint returned HTTP 401 with a Bearer/OAuth
authentication challenge. Hosted access requires completing its authentication
setup; the database password alone is not that OAuth connection. See the
[official Aura MCP guide](https://neo4j.com/docs/mcp/current/mcp-for-aura/) and
[official stdio configuration](https://neo4j.com/docs/mcp/current/quickstart/).
Apify post scraping was subsequently live-verified for the same user-supplied
profile: run `r8mIJYF3AHTyiNXKz` returned one nonempty post with a matching author
profile URL, and scratchpad/draft-node capture passed. The real MCP tool used
`max_posts=1`, `deepScrape=false`, `fetchDocumentDetails=false`, `numComments=0`
and `numLikes=0`. Its $0.00205 event-charge cap came from current actor pricing:
$0.002 for one post plus the $0.00005 minimum startup event at the configured
512 MB memory. Completion metadata reported $0.00005 and one startup event.
The response and receipt are saved under `.arc/verification/` for offline reuse.
No existing successful checks were repeated and no Claude calls were made.
GitHub was subsequently verified using the user-configured token: authentication
returned HTTP 200 and the official hosted MCP exposed all eight tools on ARC's
allowlist. `get_file_contents` read `octocat/Hello-World/README`, and its response
passed scratchpad/draft-node capture. The custom `inspect_github_developer_profile`
tool retrieved the authenticated user's public profile, twelve repositories,
thirty public events and five sampled commits without provider errors. GitHub
reported a 5,000-request primary REST allowance at authentication; its remaining
count was a snapshot before the other checks, not a current balance.
The receipt and public responses are in ignored `.arc/verification/github-*.json`.
No Claude calls or writes were made. These are representative live checks, not
verification of every GitHub tool operation. The full Claude-driven workflow and
a live graph commit remain unverified.

## GitHub token for public research

Create a [fine-grained personal access token](https://github.com/settings/personal-access-tokens/new),
name it `ARC`, select your own account as resource owner, choose an expiration,
and select **Public repositories (read-only)**. Leave extra permissions unset
for public research. GitHub documents that fine-grained tokens include read-only
access to public repositories. [Token documentation](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)

Add the token once to the ignored local `.env` as `GITHUB_TOKEN=...`. Do not paste
it into chat. ARC uses it both for the custom public-profile REST tool and the
official hosted MCP server, with read-only MCP tools allowlisted. Authentication,
MCP tool discovery, one public file read and the custom public-profile tool were
live-verified on October 14, 2026; no additional permissions were requested.

## Cached model evaluation (October 15, 2026)

One authorized recursive cache-only trial completed six model calls for
$0.0070321 in usage-priced charges, with zero source calls or Neo4j writes.
It exposed extraction coverage, retrieval and output-contract failures. The
subsequent workspace integration above replaces the default route in code;
no additional paid evaluation has been run. See the [full evaluation report](docs/cached-model-evaluation-2026-10-15.md).
Do not rerun its paid command without new authorization.

Provider parameters were checked against the official
[Haiku 5.5 model/pricing documentation](https://platform.claude.com/docs/en/models/haiku-5-5/overview),
[token counting documentation](https://platform.claude.com/docs/en/build-with-claude/token-counting),
and [Messages API](https://platform.claude.com/docs/en/api/messages/create).
The evaluation bounds individual requests and total call count; it does not rely
on the SDK dollar threshold being a prepaid hard cap.
