# ARC working rules

October 17 Crusoe integration: `ARC_RESEARCH_WORKER_PROVIDER=crusoe` routes only
focused public-case workers to the OpenAI-compatible Crusoe adapter. Exact
CRUSOE_WORKER_MODEL and CRUSOE_API_KEY are required; catalog preflight runs before
paid harvesting. Claude SDK harvest/extraction/critic/portrait remain unchanged.
Private journal data must never enter this cloud adapter. No provider calls were
made for implementation; 117 offline backend tests pass (eight Crusoe checks).
Live verification and activation remain pending credentials/model configuration.
Do not infer a new Claude-run authorization from Crusoe credits or integration.

User instructions, recorded October 14, 2026:

- Never invoke Anthropic or Claude without the user's explicit permission for
  that run. This includes Agent SDK sessions, subagents, smoke tests, debugging,
  and end-to-end verification. An API key or a request to implement code is not
  permission to spend tokens. The user selected claude-haiku-5-5 for the current
  orchestrator, harvester and architect; optional per-role overrides are available.
  Do not select a different model or increase spending without authorization.
  The user authorized a Claude budget below $2 and delegated Apify cap selection:
  configured $1.50 per investigation for Claude and $0.03 event charges per Apify
  actor run. These are not a guaranteed total-provider cap or permission to run
  an investigation. Claude's SDK budget is a threshold, not a prepaid hard cap.
- Review official current documentation before choosing provider parameters.
  Follow the installed build-with-exa skill for Exa API usage. Record sources
  and verification dates in README.md; do not assume October 2026 versions or
  model names exist without checking.
- Separate published provider limits, account-specific quotas, SDK defaults,
  and application budgets. Ask for missing account plans and budgets. Do not
  invent rates, retry counts, timeouts, result counts, or spending caps.
- Documentation/configuration reviews must not launch billable provider calls.
  Get explicit approval before paid verification; prefer offline checks. Never
  blindly retry a charged operation or restart an Apify run after a wait timeout.
- Keep credentials in the ignored local environment; never print their values.
- Implement real integrations in focused modules. Do not create dummy MCP
  servers, speculative scaffolding, or unnecessary tests. Preserve existing work.

Pending decisions: provider account plans and Exa/Firecrawl spending allowances.
Official Neo4j MCP is registered for read-only access and
passed a live read-cypher check. The current graph writer still uses the direct
driver; migrating writes to MCP is unfinished. Apify profile scraping passed one
authorized live MCP call on October 14, 2026 for the user's supplied LinkedIn
profile. Run w9XkLcEmBefDmZR97 succeeded with a $0.004 event-charge cap. The real
response and receipt are in ignored .arc/verification/; inspect them offline
instead of repeating the paid scrape. Posts also passed one authorized live MCP
call for the same profile: run r8mIJYF3AHTyiNXKz returned one post with matching
author and passed scratchpad capture. Event-charge cap was $0.00205; completion
metadata reported $0.00005. Its result and receipt are in .arc/verification/;
reuse them offline. APIFY_MAX_TOTAL_CHARGE_USD is now configured to $0.03 per
actor run under the user's delegated budget choice. No Claude calls were used
for either verification.

GitHub verification also passed on October 14, 2026 using the configured token:
HTTP 200 authentication, all eight allowed official MCP tools discovered, one
public file read with scratchpad capture, and the custom developer-profile tool
for Jackpkn (12 repos, 30 events, five commit lookups, no provider errors). Receipt
and public responses are in .arc/verification/github-*.json. Reuse these results
instead of repeating successful checks. No Claude calls or writes were made.
Only representative operations have been live-verified; the full Claude-driven
workflow and Neo4j writes through MCP remain unverified.

Subsequent user-started run 543e4074-d81b-4ec5-993d-d23c36794c83 completed with a
direct-driver graph commit, but the SDK persisted the large LinkedIn profile and
ARC wrongly treated the file notice as evidence. Repair recovered the saved
profile offline and added scoped PostToolUse file recovery/output replacement.
The apparent guessed GitHub handle was actually present in the original Exa
snippet; it was not invented. Original profile, receipt, run event log
and pre-repair evidence snapshot are in ignored .arc/verification/. Do not repeat
the scrape to recover that data. The old graph remains based on incomplete input;
it was not regenerated or changed. Any new Claude run still needs explicit
permission. Completed-run replay was preserved for the local repair restart.

The sidebar conversation UI now supports evidence-only follow-ups through
backend/conversation.py. Those sessions have no tools/MCP servers and share the
remaining Claude investigation budget. Resumed SDK result costs are cumulative;
record only increments. Unknown final usage blocks subsequent replies. Offline
API/browser verification passed; no live Claude follow-up was run. Do not launch
one as a UI smoke test without explicit permission.

October 15: history/evidence/decisions/cost/request IDs now persist in SQLite at
.arc/arc.sqlite3 (ARC_DATABASE_PATH override). One API worker owns runtime tasks.
Never auto-resume interrupted paid work. OSINT/Firecrawl/GitHub use production
FastMCP cache proxies; Neo4j stays uncached. Default source reuse has no invented
TTL; the user can explicitly choose fresh sources before new research. Preserve
original observed_at dates and mark reused results. Pending/unknown provider
outcomes must not silently retry. Existing run 543e4074 was migrated with 387
events/six evidence records; six source results were seeded from saved data,
including the recovered LinkedIn profile. Original graph remains unchanged.
Offline regression checks and actual API restart replay passed without paid calls.

October 15 core workflow update supersedes the earlier “graph unchanged” notes:
the user explicitly authorized cache-only repair and upgraded portrait generation.
Both requested Claude passes completed ($0.025449175 + $0.022740975), with zero new
source calls. Neo4j now holds 29 nodes and five sourced portrait sections; recovered
LinkedIn evidence includes 11 experience entries. Preserve backups and receipts
in .arc/verification/. This authorization is consumed; do not launch additional
Claude verification sessions without a new request.

PeerClaim nodes link to ARCInvestigation and remain separate from ARCNode /
AIJudgment, source evidence and architect prompts. Self-attributed peers and local
self-claims must never be presented as independently verified identities.
Private notes live only in .arc/private/vault.sqlite3, never public Neo4j, research
history/cache, SSE or visitor-model prompts. Only the owner-only local draft
endpoint may send notes to a loopback model. Owner approval explicitly declassifies
shareable statements; journal changes invalidate it. Visitor inference selects
only public/approved fact IDs; render known text server-side. Never replace this
firewall with a prompt-only promise or add a cloud fallback. Saluki GGUF and MLX
weights are different formats; model installation was not part of the integration.
Port 8080 had no model server. Keep the API on loopback for private operations;
remote pairing and identity verification remain future work. Spending-cap expansion,
Graphiti and multi-tenant RBAC are explicitly deferred. Eleven offline tests plus
lint/build and intercepted browser workflows passed; no real claim or fake peer
judgment was written.

October 15 cache-only recursive model evaluation: the user authorized ONE trial
under $0.10. This authorization has been consumed: six Haiku 5.5 Messages calls,
43,736 input/5,317 output tokens, $0.0070321 at published rates. Zero source calls,
Neo4j writes or private-vault reads. Results are partial: duplicate project claim
selection omitted OAN, fenced worker JSON was rejected, portrait lacked one
section's span citations, and metadata-heavy retrieval missed relevant cached
README passages. Do not rerun or activate the live default without a new request.
Artifacts: /private/tmp/arc-cached-model-eval; report:
docs/cached-model-evaluation-2026-10-15.md. Offline fence recovery is an unreviewed
proposal only; do not promote it to canonical support. Crusoe endpoint/model
configuration remains pending. Backend suite now has 60 passing tests.

October 16 workspace integration supersedes the earlier "do not activate default"
note: the user explicitly requested wiring the recursive engine to Investigate.
The normal API now calls research/pipeline.py (SDK harvest, then case-only focused
workers/critic and reviewed projection/portrait). No new paid call was authorized
or made during this integration. The fresh paid path still needs an authorized
end-to-end evaluation; do not launch it as a smoke test.
The main Conversation has a no-credit saved-profile review action for 543e4074.
It uses reviewed deterministic fixtures and saved model portrait responses, clearly
labeled in the UI. It writes local case/history only: no source calls, Neo4j writes,
private notes or peer mutations. Do not misrepresent it as fresh model reasoning.
Case-scoped exact-span API routes and Dossier/Graph inspectors expose support,
quotes, pointers, dates and gaps. Missing portrait citations suppress that section's
assertion. Fenced JSON/trailing commas normalize locally; no paid repair retries.
Large exclusion manifests stay in SQLite; worker packets retain count/manifest ID.
Real FastAPI/browser replay, graph selection, dossier passages, reload and mobile
checks passed. Browser receipt: /private/tmp/arc-workspace-browser.json.


October 17 You.com approval update: the user explicitly removed the extra
per-call approval requirement for You.com Web Search. Routine You.com searches
and direct search verification may proceed without asking again. This exception
covers the configured snippets-only Web Search integration, not Claude/model
sessions, other paid providers, extraction add-ons, automatic retries/top-ups,
or disclosure of private information. Existing cache reuse and provider-error
handling remain in force; account-specific plan/allowance is still unspecified.
Exa has been retired from active tools; retain its historical evidence/receipts.

You.com live search passed October 17: one request through the production OSINT
cache proxy returned one public documentation result; an identical second call
was a cache hit. Estimated base charge $0.005; no Claude calls. Reuse receipt and
response at the integration checkout's .arc/verification/you-live-20261017/.
Do not repeat the connectivity check merely because a later task asks for status.

October 17 autonomous public collection update: the user requested removal of
unnecessary collection restrictions. A user-started investigation may select
configured public-source tools and pursue relevant posts, projects, company
pages, linked accounts and corroboration without asking for each ordinary lookup.
Do not impose one-profile-only delegation unless the user explicitly limits scope.
Isolate ambiguous leads while continuing resolved branches. Existing budgets,
provider limits, no-blind-retry rules, identity separation and private-journal
boundaries remain. This does not authorize Codex to start a Claude verification
run. The SDK harvest prompts implement this policy; the later recursive review
workers still operate only on collected evidence. Offline tests passed; the new
model behavior has not been live-evaluated.

October 17 broader coverage/contact clarification: collection instructions now
cover public professional work, affiliations, products, publications, talks,
interviews and published business contact options, not only resumes/posts.
Business emails require an original public page explicitly offering them for
professional contact, with source URL, observed date and surrounding purpose.
Do not infer contact permission from enrichment fields or commit metadata, collect
private personal contact details, guess/test addresses or send messages. This is
a collection-prompt update, not a new enrichment service or verified contact UI;
no live model/provider evaluation was run for it.

October 17 fresh-start reset: the user explicitly requested deleting all saved
ARC data, including caches and private journals. Public Neo4j ARC records were
deleted (73 nodes, 151 relationships; zero nodes remained). Both workspaces'
history/cache databases and private vaults were reset empty; local research,
verification backups and known temporary replay/model-evaluation artifacts were
removed. No recovery backup was retained. Prior notes about saved receipts and
reusable profiles are historical and those files must not be assumed to exist.
Credentials, code and tool installations remain. Do not seed or restore old
profiles automatically. No model/source calls were made for the reset.

October 17–18 judge evaluation: user requested that ARC itself research the judges.
One normal live run for Martin Cala was executed (`judge-martin-cala-20261017`),
capturing 15 source records. Recorded model usage $0.03044456 excludes source fees.
No Crusoe inference. The run incorrectly included an unresolved same-name Oxford
LinkedIn source and lacked Firecrawl tools. Its graph is now withdrawn (not erased)
from public profile reads and the current UI/exports; audit backups and receipt in
.arc/verification/martin-withdrawal/. Do not reuse that assessment as correct or
present historical model claims as an accepted dossier. Source records remain.
Firecrawl now uses official HTTP with handshake-era proxy mode; real tools/list
passed, no scrape executed for this check. Extraction scopes source identity and
quarantines unresolved/unassessed records from worker retrieval. These are model
scope decisions, not verified identities. 121 offline backend tests plus frontend
lint/build passed. The run authorization is consumed; ask before another paid
model/source evaluation. Repaired end-to-end research remains unverified.
Read-only browser check passed after restarting API :8002 and frontend :3001:
withdrawal visible after reload, public profile 404, all 15 evidence records
retained, no current ledger assessment. Receipt /private/tmp/arc-martin-browser-receipt.json.

October 18 user-started Pawan run 8d556cb2-dbe7-4f03-b04d-b55e7b2c2321
saved 10 source records including a real Firecrawl portfolio scrape, then failed
in scope_extraction: two proposals used evidence/source IDs as passage citations.
Repair quarantines whole invalid proposals and continues with valid ones, retaining
all exclusions in the audit. No citation guessing, automatic model retry, or
promotion to verified support. Exact saved-response replay retained two unreviewed
claims and excluded two, with zero model/source calls or graph writes. Audit and
history backup: .arc/verification/citation-recovery-8d556cb2/. Original failed run
was not resumed; a safe diagnostic event explains the failure in the UI. 122 tests
plus frontend lint/build passed. No new paid evaluation is authorized by this fix.

October 18 later user run fa137120-70b4-41ef-8d42-07d98bc767f6 passed extraction
and three workers but failed before critic inference: the separate 28KB payload
guard rejected combined evidence. Critic now uses the actual existing 48KB wire
bound shared with EvaluationModel; all cited spans are mandatory, alternatives
fit only in remaining space. Local preflight rejections record known zero critic
cost, not UNKNOWN_COST. Exact saved-case offline construction: 42,405 bytes,
seven cited passages, five findings, four alternatives. No model/source calls or
semantic review were performed for this repair; no completed dossier is implied.
Audit: .arc/verification/critic-input-fa137120/. Do not auto-resume paid work.
124 offline backend tests passed. API restarted with the critic-input repair.
Latest failed-run explanation was appended without erasing history; nine source
records remain. No new model calls, source calls or graph writes were made.

October 18 explicit saved-run continuation completed for
fa137120-70b4-41ef-8d42-07d98bc767f6. The user's “ok do” authorized the remaining
model-only review and valid dossier commit, with no new scraping. This permission
is consumed: exactly two new Haiku requests (critic + portrait), $0.0046326 added
model cost; cumulative recorded model cost $0.028970345 including collection.
The four existing completed extraction/worker requests were preserved and not
repeated. The local critic preflight failure was reconciled to zero cost with its
receipts before explicitly reopening that checkpoint. No automatic resume was added.
All seven cited passages were retained for portrait generation (23,076-byte packet)
under the existing shared 48,000-byte wire guard and unchanged request/output/cost
limits. Review stopped SOURCES_EXHAUSTED: no independent corroboration was invented.
Neo4j readback matched 12 nodes, eight relationships and five portrait sections;
builder velocity is explicitly insufficient evidence. Nine source records remain.
Backups, usage and graph receipts: .arc/verification/resume-fa137120/.
Authorized recovery script: /private/tmp/arc-resume-fa137120.py (one-time markers;
do not rerun). The ordinary pipeline still has a separate 12 KB portrait gate;
this recovery does not establish that every future fresh run will complete.

October 18 required source-tool execution: user explicitly required automatic tool
calls. Added collection_coverage.py and SDK Stop receipt enforcement in the active
integration checkout. Crossref is required; captured GitHub handles require both
username checkers; sourced website/blog domains require DNS, archive, certificates.
Only completed calls for matching inputs satisfy the gate; failed attempts are
not silently retried. No-progress stops are explicitly incomplete, not successful
research. Existing SDK budgets/turn limits unchanged. Updated prompts consistently.
130 offline tests passed and saved Pawan receipt replay identified six missed tools.
No live model/source evaluation or historical dossier mutation was authorized or
performed for this implementation. Do not claim the tools succeeded live from
these tests. No automatic paid resume was introduced.
