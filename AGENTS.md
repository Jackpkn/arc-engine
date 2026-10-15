# ARC working rules

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
