# Offline execution results — October 15, 2026

Tasks 1–6 were executed sequentially on `codex/recursive-offline`. Changes are uncommitted. No paid model evaluation or source-provider calls were made. The existing Neo4j dossier was not modified.

## Verification

- Backend: **51 tests passed** with `.venv/bin/python -m unittest discover -s backend/tests -q`.
- New research modules/tests: Ruff checks passed.
- Frontend: `npm run lint` and `npm run build` passed, including TypeScript and the new `/research/replay` route.
- Replay import validation: valid artifact accepted; four malformed nested-input cases rejected.
- Browser: eight tasks and three claims rendered; duplicate event delivery deduplicated; no horizontal overflow at 390px; no runtime exceptions or unexpected HTTP requests.
- `git diff --check`: passed.

The first sandboxed build failed because Turbopack could not bind an internal worker port. Its cached failure was isolated, then the approved build outside the sandbox passed. Browser checks also required local-port access outside the sandbox.

## Required replay

Executed:

```bash
.venv/bin/python -m backend.replay_research --session-id 543e4074-d81b-4ec5-993d-d23c36794c83 --offline --output-dir /private/tmp/arc-recursive-replay
```

| Result | Value |
| --- | --- |
| Current cached sources | 6 |
| Superseded file notices excluded | 1 |
| Waves / tasks / maximum depth | 3 / 8 / 2 |
| Reviewed findings | 5 |
| Graph preview nodes / edges | 11 / 8 |
| Events | 79 |
| Recovery outcomes | 2 cached replacements, 3 missing-cache outcomes; simulated faults explicitly labeled |
| Stop reason | `WAVE_LIMIT` |
| Model calls / actual model tokens | 0 / 0 |
| Source calls / Neo4j writes / private-vault reads / peer writes | 0 / 0 / 0 / 0 |

All three claims remain `SELF_REPORTED_ONLY`: Stela's 40% latency reduction, Flightdeck authorship/functionality, and Open Agent Network's working escrow. The cache does not establish independent benchmarks, contributions or deployed-contract behavior. Five portrait sections remain missing because no synthesis model ran. Original operator identity context is retained separately and does not upgrade evidence support.

Artifacts in `/private/tmp/arc-recursive-replay`:

- `summary.json` — all eight acceptance assertions pass.
- `graph-preview.json` — public graph and coverage, not committed.
- `event-trace.jsonl` — three critic reviews, two discovered repository leads, child ancestry and recovery outcomes.
- `token-size-report.json` — packet measurements and included/excluded passages.
- `case.sqlite3` — inspectable case state and original snapshots.
- `replay.json` — open at the frontend's `/research/replay` file viewer.

Saved payloads total **140,981 bytes**. Packets range from **11,633–11,998 bytes**, bounded at 12,000; aggregate packet bytes across eight tasks are **94,953**. These are serialized UTF-8 byte measurements, not provider tokens or cost estimates. System/tool schemas and future model overhead are excluded.

## Review and fixes

One fresh reviewer found five important issues: late/cancelled usage loss, incomplete restart checkpoints, review retractions blocked by graph dependencies, self-authored mirrors counted as independent, and explicit Apify refresh identity lost across HTTP. Each received regression coverage and was fixed. Three additional UI/input concerns were also fixed: stale terminal task statuses, malformed replay imports, and accepting an unrelated session in a fixed-identity fixture. Final verification followed the fix pass; no second model-quality review is claimed.

## Decisions retained

- Work stays in the shared checkout on a dedicated branch, with the local execution ledger retained; no worktree copy, secret copy, merge, push or commit. Integration remains a later user decision.
- Application-managed children use separate task capabilities. Native SDK Agent execution remains denied until trusted attribution is evaluated. This limits the current demo to the application scheduler.
- Worker and critic contracts are provider-neutral. Crusoe waits for exact configuration; the existing live API retains v1 until v2 is explicitly activated.
- The default semantic reviewer does not auto-approve findings. Model quality, portrait quality, actual tokens, live reconciliation and Neo4j commit behavior are not validated by offline replay.
- A standalone local-file viewer makes this milestone inspectable without adding a paid API entrypoint. Wrong replay sessions are rejected, preventing hardcoded identity contamination.
- The demo uses a 12,000-byte packet allowance. The 4,096-byte default may reject cases with large excluded-span manifests; it fails closed rather than truncating evidence silently.
- Board-backed scratchpad raw-byte accounting is retained for compatibility; its old cap does not delete durable sources. Legacy allowance reporting can therefore be misleading and should not be used as model token accounting.
- The user requested a stop after offline verification. No paid model-only evaluation was initiated.

No reviewer-reported minor remains unfixed. The standalone Node TypeScript validation command emits a module-format performance warning; frontend lint/build and browser execution pass.
