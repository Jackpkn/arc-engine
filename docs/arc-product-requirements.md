# ARC product requirements — October 15, 2026

Status: revised founder brief after UI review. This revision supersedes the
previous permission and owner-written correction flows in `/studio`. The
founder-approved visual style is retained. The studio remains an interactive,
fictional preview; a continuous judgment engine is the next development task.

## The requirements, in one paragraph

ARC builds an evolving understanding of a person from public evidence, their
journal and proof of what they actually do. The human consistently contributes
context and evidence; the agent independently decides what that evidence
supports and authors the judgment cards. Humans cannot write, approve or
directly edit an agent's judgment. Once a pattern is sufficiently supported,
the agent should update the profile interpretation automatically. Confidence
should develop through attributable evidence across weeks, months and longer
periods, and a stronger color gradient should communicate stronger support for
that particular judgment. Contradictions, uncertainty and changing circumstances
can weaken it. Keep the current clean, sharp, colorful visual theme, typography,
layout and whimsy. Onboarding remains short and chunked. This version focuses
on profiles, journaling, evidence and evolving judgments, with no permission,
release approval or owner-authored judgment flow. A person's ongoing evidence
can influence the agent's interpretation; their desired conclusion is not itself
proof. Raw journal entries are not displayed as public profile cards.

## Step-by-step objectives

1. **Preserve the approved design.** Keep the cream paper, cobalt, coral, yellow
   and mint palette, square edges, crisp rules, large typography and original
   angular artwork. Add gradients specifically to communicate judgment support.
2. **Remove the previous approval workflow.** Remove permission screens,
   claim-confirmation checkboxes, public-statement approval and owner-written
   correction cards from the studio. Do not replace them with another gate.
3. **Keep onboarding small.** One question or decision per screen, Back and
   progress. Name, optional public starting point, sample portrait, owner view.
4. **Make the journal the contribution surface.** Provide a blank page for
   typing/paste and a dated contribution history. People supply observations,
   context, links and proof instead of writing their own judgment cards.
5. **Put the agent's interpretation on the profile.** Show a concise judgment,
   its evidence period, support state and expandable reasons/uncertainty. The
   agent owns the wording and decides whether the evidence supports it.
6. **Show confidence over time.** Use a subtle gradient plus a readable label.
   A clearly marked sample-history control illustrates a week, a month and a
   longer period without pretending that a real assessment ran.
7. **Keep the demonstration honest.** New journal entries are held in tab memory
   and await agent review. They do not trigger fake inference or increase a
   rating through keyword matching. Reload clears the mockup.
8. **Build the real judgment loop next.** Connect dated evidence to local model
   reasoning, maintain revisions, evaluate contradictions and automatically
   update dependent cards when support changes.

## What exists now

The repository already has public-source research tools, evidence capture,
Neo4j dossiers and sourced interpretations. It also has a separate local journal
and a working fictional three-agent pilot using the existing Qwen2.5:7b model
through Ollama. These are useful foundations for the next integration.

The studio is a separate visual prototype. It demonstrates fictional people,
agent-authored example judgments, time-based support stages, a blank journal,
dated in-memory contributions and short onboarding. The examples are fixed
fixtures, not outputs from a new model run. It does not scrape profiles, verify
identities, connect accounts, persist notes or learn from real journal data.

The existing private vault is SQLite with restrictive file permissions, not
encryption at rest. Backend research and the older three-agent simulation have
not been repurposed as a continuously learning public judgment service by this
UI change.

## Journal ingestion scope

| Input | Current status | Next development work |
| --- | --- | --- |
| Writing and paste | Studio blank page and tab-memory history; existing journal API can store text | Connect durable entries, revisions, provenance and model review |
| Public profile/project URL | Existing research accepts targets; studio URL is form input only | Identity matching, source capture, deduplication, refresh and cost control |
| Proof links and files | Proposed | Parse evidence, record origin and event dates, distinguish verified material from self-report |
| Notes apps | Proposed | Choose apps, selected collections and incremental sync |
| Email/calendar | Proposed | Define useful events, attribution, third-party data handling and retention |
| Other connectors | Founder scope pending | Specify purpose and evidence quality before implementation |

Dates must distinguish when something happened, when it was submitted and when
ARC observed it. Backdating a journal entry does not independently establish that
an event occurred. Journal effort matters because it supplies evidence over time,
not because writing more automatically earns a stronger profile.

## Confidence and gradients

Use an ordinal support scale with accompanying text, for example:

| State | Meaning | Visual treatment |
| --- | --- | --- |
| First impression / emerging | Limited evidence or a short observed period | Pale gradient |
| Taking shape | A pattern recurs across distinct periods | More visible gradient |
| Supported over time | Relevant observations continue over a longer period | Stronger gradient within the same palette |
| Unresolved or weakened | Conflicting, stale or insufficient evidence | Softer treatment plus explicit explanation |

These are evidence-support states, not calibrated probabilities or a measure of
human worth. A month is not a universal threshold for truth. Demo week/month/
longer-period examples illustrate the visual concept; real thresholds require
measuring the judgment engine on realistic cases. Color alone must not carry the
meaning: include the label, dates and reasons.

## Judgment-layer acceptance criteria

- **The agent owns the conclusion.** A person adds evidence or context, never
  edits the judgment text, chooses their confidence or approves the final card.
- **Time differs from volume.** One hundred notes today cannot establish
  consistency across months. Repeated accounts of one event retain one origin.
- **Claims differ from proof.** Owner self-report, public observation, peer
  statement and independently checked evidence remain distinguishable.
- **Confidence belongs to a narrow judgment.** Repeated software contributions
  may support consistency on that project; they do not establish universal
  reliability, honesty or trustworthiness.
- **Competing explanations survive.** Retain supporting evidence, counterevidence,
  plausible alternatives and insufficient-information states.
- **Contradictions matter.** New conflicting evidence can weaken a card, soften
  its gradient or leave the agent unresolved. More activity cannot guarantee an
  increase in confidence.
- **Age and change matter.** Show the evidence period and last review. Old goals,
  availability and circumstances cannot silently describe the present.
- **Revisions propagate.** A corrected source, date or event triggers review of
  dependent interpretations while preserving the source history.
- **Automatic updates are explainable.** Record why a card appeared, strengthened,
  weakened or disappeared, with source references and model/revision metadata.
- **Journal text is input, not profile copy.** The public card is an interpretation;
  raw notes and model reasoning traces are not rendered as the public portrait.
- **Test indirect disclosure.** Unintended private facts must not escape through
  paraphrased judgments, reasons or source excerpts. An automatic content policy
  can enforce that without making the human approve or author the conclusion.
- **Test independence.** Include desired self-descriptions unsupported by actions,
  concentrated one-day posting, copied evidence, sustained distinct observations,
  conflicting evidence and changed circumstances. Verify the agent can disagree.

## Concrete next development sequence

1. Define a durable evidence record with author, event date, capture date,
   source, verification state and links to any duplicates.
2. Add an owner-local review job using the existing local model. Ask for a
   structured candidate judgment, supporting and opposing evidence IDs,
   alternatives and a reason to update or withhold it.
3. Validate referenced evidence server-side. Evaluate temporal support separately
   from the language model's self-reported certainty.
4. Store a versioned judgment and its dependencies. Update the profile card
   automatically when the evidence warrants a change, with no owner approval step.
5. Evaluate the cases above before connecting continuous ingestion and agent
   retrieval. Schedule re-review when evidence changes or becomes stale.

The interface is a small iteration on the already approved design. The real
judgment loop requires several weeks of engineering and evaluation for a useful
pilot, with timing depending on evidence quality and scope. A multi-user product
also needs reliable identity matching, durable jobs, encrypted storage/key
recovery, connector sync, source management and privacy-safe retrieval. These are
planning estimates rather than delivery commitments. No new foundation model or
Underdog download is required to begin the controlled local-model experiments.
