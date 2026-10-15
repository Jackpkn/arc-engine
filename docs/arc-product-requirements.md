# ARC product requirements — October 15, 2026

Status: founder brief and development sequence for feedback. `/studio` is an
interactive, fictional UI mockup; `/pilot` remains the working local three-agent
simulation. This brief does not claim the proposed judgment engine is built.

## The requirements, in one paragraph

ARC should build an evolving profile of a person that other agents can consult.
Its profile cards should show the AI's interpretation of recurring evidence—such
as “appears to be a committed gym enthusiast”—with reasons, uncertainty, and room
for correction. People should be able to claim their profile and continually
influence how they are understood through a private journal, using a blank
writing page, pasted text, and eventually connected services. The interface
should have sharp corners, bold color, and playful details inspired by Underdog,
with onboarding broken into tiny steps containing only a few words at a time.
Permissions should appear when a particular action needs access or disclosure,
with clear standing rules for repeated actions. This work should live in a new
PR, preserve the journal's privacy controls, and leave a durable requirements
copy for founder feedback. The core loop is continuous interpretation by the
agent and continuous evidence, context, and correction from the human—not a
one-time scraped biography or a fixed character score.

## Step-by-step objectives

1. **Record the baseline.** Reuse the existing research/evidence graph, local
   journal, visitor-approved statements and three-agent pilot. Keep working,
   demonstrated and planned capabilities distinct.
2. **Establish the visual language.** Use square corners, crisp rules, cream
   paper, ink, cobalt, coral, yellow and mint. Introduce original angular graphic
   details. Avoid glass panels, pill controls, decorative gradients and stock
   chatbot dashboards. Borrow Underdog's warmth and brevity, not its assets.
3. **Chunk onboarding.** One question or decision, one main action, Back and a
   short progress indicator per screen. Start with a name/public source,
   review a sample profile, preview claiming, open the journal, then review a
   specific proposed disclosure when needed. Do not front-load a consent wall.
4. **Build the portrait experience.** Browse interpretation-led cards; inspect
   the evidence, dates, limitations and possible alternative explanations;
   preview ownership and make a clearly attributed owner correction.
5. **Make journaling literal.** Start with a clean notepad that accepts writing
   and paste. Explain where a draft lives and whether it persists. Do not make
   journals public merely because they affect the agent's private understanding.
6. **Place permissions at the action.** Separate access to sources, private
   local understanding, selected confidential context used with named peer
   representatives, and statements disclosed to humans. A standing rule must
   name audience, purpose, selected entries/revisions and duration, and offer
   pause/revoke. A public release preview shows the exact proposed statement.
7. **Map ingestion scope.** Specify connectors and integration behavior before
   implementing it. Label future controls honestly; never imply an account is
   connected, a source was scraped, or a model learned from a mockup click.
8. **Review the interface in a separate PR.** Verify short onboarding, back
   navigation, keyboard access, narrow layouts, editing, correction and release
   previews. Keep the actual pilot reachable. Invite founder feedback on the
   product direction before deeper integration.
9. **Build the judgment layer next.** Implement evidence-backed hypotheses,
   correction history, temporal updates and privacy-aware agent retrieval.
   Validate changing interpretations using controlled examples before running
   continuous research about real people.

## What the repository already provides

The existing backend gathers public professional sources through configured
OSINT tools, tracks source evidence and builds a Neo4j dossier. Its schema and
profile UI distinguish evidence, AI interpretations and self-attributed peer
statements. Research may invoke paid providers; this UI work does not run them.

The existing owner journal lives in a separate local SQLite vault, protected by
file permissions and an owner cookie. It is **not encrypted at rest**. Local
claiming does not verify identity. A local model may draft shareable statements,
but visitors receive public dossier facts and owner-approved statements,
selected by ID and rendered by the server. Journal edits invalidate the current
approval of journal-derived statements.

The three-agent pilot runs fictional representatives on one computer using the
existing local model, currently Qwen2.5:7b through Ollama. It has revision-bound,
expiring circle mandates and separate human-output approval. It is not a remote
community with independently verified identities or confidential peer runtimes.

## What this UI change establishes

`/studio` demonstrates the new visual style, a sample directory, interpretation
explanations, chunked onboarding, owner-view preview, writing/paste, correction
and exact-statement disclosure review. The people and evidence are fictional.
Drafts exist in this tab's memory only and disappear on reload. No journal text,
source URL or correction is sent to the backend, a model, or a connector. The
mockup does not implement verified claiming, OSINT collection, learning,
publication or persistent journal saving. The existing working `/pilot` and
research/profile routes remain separate.

## Journal ingestion scope to refine

| Input | Pilot/product status | What must be specified before shipping |
| --- | --- | --- |
| Blank page and paste | Existing journal saves typed text; studio demonstrates editing in memory | Save policy, edit history, entry selection, delete/recovery, private-use mode |
| Public profile URLs | Existing research accepts targets; studio accepts a URL as form input only | Source ownership, identity matching, permitted collection, refresh cadence, costs |
| Files and exported notes | Proposed | Supported formats, size bounds, local parsing, provenance, removal |
| Notes applications | Proposed | Exact app, read scope, selected notebooks, incremental sync, revocation |
| Email and calendar | Proposed | Selected accounts/folders/events, third-party information handling, retention, OAuth scopes |
| Other integrations | Founder scope pending | Purpose, minimum permission, local/cloud processing, recipients, audit trail |

Writing, connecting, understanding and publishing are different actions. Each
connector should present its specific access request when selected. A successful
sync must not silently authorize public release. Removing access stops future
reads; retention/removal of already imported material needs an explicit policy.

## The judgment layer: next development task

The public card leads with a useful, revisable interpretation. Its explanation
retains observations and their origin without making the card a scrape dump.
For example, several independent, recent training posts might support “training
appears to be a regular part of their week.” They do not prove personality,
health, or reliability. A journal clarification such as “those were old posts;
I no longer train” is an attributable correction that should prompt review,
not be silently relabeled as independent public evidence.

Required behavior:

- Distinguish public observation, owner self-report, peer statement and AI
  inference. Retain source, author, capture date and applicable date.
- Keep plausible alternatives and “insufficient evidence”; record supporting
  and conflicting evidence. Avoid invented confidence percentages and universal
  person scores.
- Deduplicate copied stories by original source. Repeated agents do not create
  independent corroboration.
- Create revisions for corrections and new evidence. Reconsider dependent
  interpretations and invalidate stale agent answers.
- Let current goals expire or be refreshed. Preserve historical context instead
  of presenting old availability or interests as current.
- Keep private understanding separate from public judgments. A human's desired
  interpretation is a self-report, not automatic proof. Only an authorized
  public statement may cross into a public profile.
- Give both the human and querying agents the interpretation's basis,
  limitations, timestamp and revision appropriate to their access scope.
- Evaluate wrong initial inference → correction → changed circumstances →
  duplicate evidence → unresolved conclusion. Verify that recommendations change
  without exposing the private correction.

## Just-in-time permission: product interpretation

The founder's request to handle permission and responsibility through actions
in time is implemented as **specific permission at the relevant action**, with
standing authorization for a defined repeated purpose. It is not blanket
permission to collect or disclose everything, and UI timing alone does not
transfer legal responsibility. Exact rules for evidence collection, identity,
retention, public visibility and appeals remain product decisions for the real
deployment. This change adds no external data access or disclosure.

## Development effort and infrastructure

The UI is the easiest part to iterate: a few focused days per feedback round.
Connecting this design to the existing single-device journal and profile API
is a separate integration step, roughly one to two weeks including handling
loading, conflicts, revocation and recovery. These are planning estimates for
an experienced small team, not delivery commitments.

A credible judgment pilot takes several more weeks because it needs a revision
model, evidence aging, correction logic and evaluation examples—not just a
prompt. A real multi-user launch is a larger, multi-month effort: authenticated
claiming and disputes, encrypted storage and key recovery, source permissions,
connector sync, reliable jobs, cost controls, abuse handling and privacy-safe
agent access. Remote agents processing confidential peer context require a
trusted execution/hosting design; an ordinary browser cannot hide plaintext
from the person controlling that browser.

The existing local Qwen model is enough to test the loop. Its speed and judgment
quality must be measured on realistic, authorized examples. No new foundation
model, Underdog download or copied proprietary engine is needed for this UI or
the first controlled judgment experiment.
