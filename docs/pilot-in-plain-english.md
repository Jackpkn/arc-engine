# ARC today, in plain English

## What was already here

Your teammate has built a research workbench. It can collect public information,
show the evidence behind a professional profile, map relationships, and let you
ask questions about the collected material. Some of that research uses paid AI
and data services.

It already has a separate private journal. Its owner can ask a model on the same
computer to draft shareable statements, then activate a public representative.
That representative can point to approved information; it cannot bind its human
to a deal.

The journal database is separate from public research and has restricted file
access. It is **not yet encrypted**. The journal is local to the computer running
the ARC API, which is not necessarily every visitor's computer.

## What the new pilot adds

Open **Three-agent pilot** in the sidebar. You will see three fictional people:
Maya needs a developer, Leo builds software, and Sam can help connect them.

Each card has a private journal, a setting for how it may be used, and a separate
list of statements that humans may receive. The two permission gates have
different jobs:

- **Confidential understanding:** you give standing permission for the relevant
  journal entry to be considered by the two named agents in this circle. That
  permission is tied to a purpose, the current journal version and an expiry.
- **Human-visible release:** you separately decide which statements can appear in
  the result shown to people. Agents cannot publish their hidden reasoning or
  paste peer journals into the result.

The three representatives each take a turn using the local model. If they all
support an introduction, ARC renders a result using the approved statements. It
can also stay quiet. A missing model or invalid answer produces a blocked state,
not a made-up successful conversation.

Changing a journal, pausing a representative or allowing permission to expire
stops stale work. You can pause even while the agents are reasoning; the pending
introduction is then discarded. Reopening a completed request does not run the model again.
Receipts show which source version was selected for each local reasoning attempt.
An unsuccessful attempt does not prove the model received or understood it.

## What it looks like

The existing product is a dark research workspace with green accents, a sidebar,
conversation history, dossiers and a relationship graph. The pilot keeps that
style and adds three participant cards, the two permission gates, a run control,
human outcomes and expandable receipts.

This is a functional starting point for your feedback, rather than a fixed final
design.

## What it cannot promise yet

- These are three fictional representatives on one computer, not three verified
  people with independent devices.
- The operator can inspect all the fictional journals. This does not demonstrate
  keeping a real peer's confidence hidden from their human.
- There is no remote encrypted community, account recovery or full Rolodex yet.
- The model does not become more trustworthy merely because it runs locally.
- The pilot makes suggestions; it does not send invitations, hire someone, make
  payments or promise work on a human's behalf.

The existing Qwen model is enough to start testing the loop. We do not need to
build our own AI brain or Husky-style speed engine first. The main new work is
getting discretion, membership, reliable delivery and relationship learning
right.

See [the concrete development plan](three-agent-pilot-plan.md) for assignments,
acceptance checks and the path from this simulation to a real community.
