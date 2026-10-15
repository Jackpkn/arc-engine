# Three-agent ARC pilot

Development baseline: `13a0ac5d0cdd9990c5f0be5448d9fc37d3f2ab71` in
`Jackpkn/arc-engine`, inspected October 15, 2026.

## Product goal

Prove one useful loop: a person expresses a need in their journal, three
representatives consider a relevant collaboration, and each human receives only
an authorized result. Preserve two distinct gates:

1. **Journal to confidential representatives:** a standing mandate determines
   eligible sources, named peers, purpose, expiry and processing mode. Eligible
   full context can be exchanged automatically; this is not a per-message
   approval process or a permanent restriction to sanitized summaries.
2. **Confidential reasoning to humans:** a release controller decides what each
   person may actually see. Peer journal text and hidden reasoning must not enter
   the personal assistant, public profile, research graph or ordinary logs.

The present branch implements a deliberately narrow **fictional, local
simulation** of that loop. One browser controls three fictional people. It does
not establish three real identities or conceal their confidences from the
operator of that computer. No real person's journal should be entered here.

## What the teammate's repository already contained

Verified in source, rather than inferred from earlier ARC handoffs:

| Area | Existing implementation | Practical limit |
| --- | --- | --- |
| Research workspace | Next.js/React interface; conversation, dossier, graph and peer-claim views | Existing investigations use paid providers; none is required by this pilot |
| Research engine | Python/FastAPI, Claude Agent SDK, Exa/Apify/Firecrawl/GitHub adapters | Provider configuration and explicit paid-run authorization remain necessary |
| Research history | SQLite event/history/source cache and restart handling | One API worker; incomplete paid work is not automatically resumed |
| Public dossiers | Neo4j-backed profiles, evidence, professional portraits | A dossier is public research, not private journal truth |
| Private journal | Separate SQLite file, restrictive file permissions, local-browser ownership | Plaintext at rest; no keychain-backed encryption, recovery or verified identity |
| Public representative | Owner-approved statements; local model chooses fact IDs; server renders known text | Approval is for visitors generally, not a confidential community mandate |
| Local inference | Loopback-only HTTP connection, no environment proxy or redirects, no cloud fallback | Model runtime must also be trustworthy and configured for local-only use |

The previously described TypeScript ARC foundation, encrypted archive and Matrix
harness are a different codebase. Its archive and remote were not available in
this checkout. Do not claim those components are integrated here.

## Implemented pilot slice

- A `/pilot` workspace alongside the existing research UI.
- Three fictional representatives: Maya needs a developer, Leo builds software,
  and Sam can help make an introduction.
- Separate journals and three modes: sealed, local understanding, and
  representation within this circle.
- Standing grants bound to the source revision, two named peers, one purpose and
  an expiry. Editing a journal or pausing a grant invalidates pending work.
- Full selected synthetic context is passed only to the configured loopback
  model. Confidential context is not reduced to the public-profile brief.
- Three bounded model turns, one for each representative. A model can select
  approved release-fact IDs and an introduction/quiet decision. Arbitrary model
  prose is never rendered as a human answer.
- Each complete model payload has a 12,000-byte application bound. Excess context
  blocks the round before inference; it is not silently sliced. This bound is not
  a guarantee about every model's token capacity.
- An introduction requires all three representatives to agree. Quiet or blocked
  rounds do not fabricate a successful match.
- Human-visible wording is rendered by the server from the known release facts.
  This first release vocabulary is intentionally small; broad natural-language
  mediation is a later evaluation problem.
- Local metadata receipts show source, recipient, purpose and revision. Raw peer
  transcripts and model rationale are not retained in the run record.
- Persistent request IDs prevent duplicate model turns on replay. Journal,
  mandate or expiry changes defeat stale replay. Failed/uncertain work does not
  silently retry.

This is three representatives taking part in one bounded episode, not three
different neural networks, a distributed group chat or an autonomous agreement
to hire someone. Existing public-profile approval and real dossiers are left
separate from the synthetic workspace.

## Local model choice

Use the existing engine adapter; do not train a foundation model or build Husky.
The Mac inspected for this task already had `qwen2.5:7b` installed in Ollama. This
is an appropriate first integration check because it avoids a new multi-GB
download. Model adequacy for confidentiality and interpersonal judgment must be
measured separately from whether it returns valid JSON.

Start the installed runtime with cloud features disabled, binding only to this
computer. These are application settings for this pilot, not provider quotas:

```sh
OLLAMA_NO_CLOUD=1 OLLAMA_HOST=127.0.0.1:11434 \
  OLLAMA_CONTEXT_LENGTH=16384 ollama serve
```

Run ARC's existing backend with the local override:

```sh
ARC_LOCAL_AGENT_URL=http://127.0.0.1:11434/v1 \
ARC_LOCAL_MODEL=qwen2.5:7b \
  uv run uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

Run the frontend using the repository's normal instructions and open
`http://localhost:3000/pilot`. No Neo4j credentials, investigation or research API
key is needed for this route. Dependency installation is still necessary because
the existing API entry point imports the research modules.

Saluki remains an optional later comparison: the published
`Underdog-Saluki-27B-1.0-IQ2-mix.gguf` is a 7.89 GB model for llama.cpp under
Apache 2.0. GGUF and MLX files are different formats. Installing Saluki or its
vision add-on is not part of this change. Compare on the same ARC cases before
choosing a larger model.

The application can restrict the HTTP destination to loopback; it cannot prove
that arbitrary software listening there does not forward prompts. Use a trusted
runtime, disable its cloud features, and retain that assumption in product claims.

## Verification of this branch — October 15, 2026

- All **23 offline backend tests** passed on Python 3.14, including the 11
  existing regression tests. No paid provider was invoked.
- Frontend lint, TypeScript and the production build passed.
- A real API round used the already-installed **Qwen2.5 7B** model through Ollama
  on an Apple M4 Mac with 16 GB memory. The initial complete three-agent round
  took approximately **16 seconds**, including model loading. This is one
  integration observation, not a benchmark or a judgment-quality guarantee.
- That round produced three recipient-specific introductions and six metadata
  receipts. Its deliberately private fictional canaries did not appear in the
  human results. Repeating the same request returned an identical saved result.
- Browser verification covered creating the circle, saving all three entries,
  granting their rules, running the actual model, and pausing a member. Pause
  removed the current result and disabled the run control.
- Pilot POSTs use JSON without an authored Content-Type to avoid an observed
  local browser preflight failure. The pilot router checks the exact allowed
  Origin and loopback client before parsing, then requires the owner cookie.
  The public/profile API is unchanged; no frontend proxy exposes private routes.

## Concrete next development assignments

### 1. Evaluate this bounded loop

Owner: agent/backend engineer, with founder review.

- Run useful-match, incompatible-goal, missing-information and changed-intention
  cases using fictional journals.
- Record valid schema rate, appropriate quiet decisions, response time and
  whether introductions are actually useful.
- Check the outgoing source scope separately from the human-release scope.
- Compare the installed small model with Saluki only after the baseline is
  measured; do not infer judgment quality from advertised token speed.

Completion: one repeatable useful introduction, one appropriate silence, and
edit/pause/expiry/replay checks passing without paid research calls.

### 2. Make the real journal suitable for sensitive data

Owner: desktop/security engineer.

- Add maintained authenticated encryption and OS-backed key storage. Design
  recovery, lock/logout and export behavior before promising encryption.
- Keep keys and confidential peer state away from human-facing routes.
- Connect the real notebook and history importers only after the source/revision
  model is agreed; do not merge public OSINT inferences with private journal truth.
- Add per-entry scope and corrections, rather than scaling the pilot's one-entry
  fictional fixture into a general archive.

Completion: stolen database contents cannot reveal entries without the key;
recovery is tested; diagnostics and exports respect the same boundaries.

### 3. Establish three real representative identities

Owner: agent-infrastructure engineer.

- Separate human login, representative identity and trusted processing identity.
- Define membership, admission, block/removal and source correction behavior.
- Use persistent, authenticated encrypted delivery and a transactional outbox.
  Evaluate the earlier Matrix harness if its source becomes available.
- Keep peer plaintext in an admitted managed/protected runtime when the product
  promise requires hiding it from the recipient human. A local process controlled
  by that human cannot provide that assurance.

Completion: three independently authenticated participants; removal stops future
delivery; newcomers receive no prior confidential history; restart/retry produces
one logical outcome.

### 4. Extend release quality and relationship memory

Owner: model/evaluation engineer, with founder policy decisions.

- Broaden the finite release types only after testing inference and extraction
  attacks. Choosing a permitted output is itself an information channel; an
  allowlist does not prove semantic privacy.
- Permit automatic confidential exchange under standing rules while ensuring the
  personal communicator sees released results only.
- Record explicit commitments and observed outcomes with provenance, uncertainty,
  disputes and corrections. Private journal interpretations do not automatically
  become portable reputation.

Completion: useful recipient-specific results, supported outcome records and
correction propagation. A generic trust score is not the acceptance criterion.

## Mechanical acceptance checks

| Case | Required behavior |
| --- | --- |
| Sealed/local-only participant | No confidential peer exchange |
| Unknown or extra peer/source | Reject before inference |
| Journal edited or grant paused during inference | No stale human release |
| Grant expires during a turn | Stop pending release and cached replay |
| Invalid IDs or extra model prose | Reject invalid selection; never render prose |
| Model absent, malformed or too much context | Explicit blocked state; no cloud/static success |
| Same request repeated | Same result, zero new model calls |
| Same request after a source/mandate change | Conflict; no old result resurrected |
| Interrupted run | No automatic model restart |
| Owner GET or debug view | Synthetic operator access clearly labelled; no real confidentiality claim |
| Public graph/history/SSE | No pilot journal or confidential transcript |

## Founder feedback after trying it

The screen is an initial functional pilot, not the final ARC visual direction.
The most useful next feedback is:

1. Is the first useful outcome an introduction, advice, reconnection or something
   else?
2. What would feel like a betrayal even if the agent technically followed its
   mandate?
3. Which kinds of positions may an agent convey automatically to another human?
4. Should a user see detailed sharing receipts, a short explanation, or both?
5. What first real community can provide consent and observable outcomes?

## References checked October 15, 2026

- [Ollama local compatibility](https://docs.ollama.com/api/openai-compatibility)
- [Ollama local-only configuration](https://docs.ollama.com/faq#how-do-i-disable-ollamas-cloud-features)
- [Saluki model card and license](https://huggingface.co/ConwayResearch/Underdog-Saluki-27B-1.0)
- [llama.cpp server](https://github.com/ggml-org/llama.cpp/tree/master/tools/server)

Earlier ARC architecture and handoff material were used as private product
references. Their full contents are not copied into this public repository.
