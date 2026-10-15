# Durable history and source reuse

Approved scope: implement permanent investigation history, then source caching.
Execute inline; no paid provider or Claude verification calls.

Architecture: local SQLite in ignored `.arc/arc.sqlite3`, separate run storage
and cache modules. Append events and evidence transactionally before SSE delivery.
Restore conversations, budget accounting, decisions and request IDs. Incomplete
runs become interrupted history; never automatically resume paid work. One API
worker owns the run store; cache proxy processes share SQLite transactions.

Cache successful MCP results via a FastMCP proxy for osint, Firecrawl and GitHub.
Keep Neo4j reads live. Keys include upstream identity, credential fingerprint,
tool, normalized inputs and format version. Preserve original collection dates;
explicit fresh-source option refreshes each exact request once per investigation.
Pending/uncertain requests block duplicate automatic calls. No arbitrary TTL.

- [x] Implement run store and recovery; preserve existing saved investigation.
- [x] Implement cache claims and real proxy middleware; keep original providers.
- [x] Wire SDK registry, provenance events, explicit refresh and sidebar copy.
- [x] Verify restart replay, evidence/decisions, idempotency, unknown-cost blocking,
      cache hits, input separation, concurrency, errors and freshness offline.
- [x] Import existing completed run and usable saved source responses, restart
      only the local API, confirm read-only history replay, update README.

Review focus: process crash between provider start/result, graph committed before
terminal event, cancelled chat without final cost, persisted large-result notices,
credential isolation, restart preserving request IDs, WAL backup consistency.
