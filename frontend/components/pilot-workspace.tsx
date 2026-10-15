"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, CirclePause, Clock3, Fingerprint, KeyRound, LockKeyhole, NotebookPen, RefreshCw, ShieldCheck, Sparkles, Users } from "lucide-react";
import { pilotRequest } from "@/lib/profile-api";

type Mode = "sealed" | "local" | "represent";
type Mandate = { expires_at: string; peer_ids: string[]; source_entry_ids: string[]; source_revision: number; version: string };
type PilotAgent = {
  agent_id: string; name: string; role: string; journal: string; entry_id: string;
  release_facts: string[]; mode: Mode; revision: number; mandate: Mandate | null;
};
type PilotRun = {
  request_id: string; status: "completed" | "quiet" | "blocked";
  mode: "local_model" | "unavailable"; message: string; created_at: string;
  outcomes: { recipient_id: string; text: string }[];
  receipts: { sender_id: string; recipient_id: string; purpose: string; source_entry_ids: string[]; source_revision: number }[];
};
type PilotState = { revision: number; simulation: true; purpose: "professional_introduction"; agents: PilotAgent[]; last_run: PilotRun | null };
type Draft = { journal: string; release_facts: string; mode: Mode };
const modes: { id: Mode; label: string; description: string }[] = [
  { id: "sealed", label: "Sealed", description: "Store this entry. No model access and no representation." },
  { id: "local", label: "Understand locally", description: "Allow local understanding. This agent stays out of the circle." },
  { id: "represent", label: "Represent in this circle", description: "With a current rule, use this entry for local reasoning with the two named peers." },
];
const toDraft = (agent: PilotAgent): Draft => ({ journal: agent.journal, release_facts: agent.release_facts.join("\n"), mode: agent.mode });
const facts = (text: string) => text.split("\n").map((value) => value.trim()).filter(Boolean);
const dirty = (agent: PilotAgent, draft: Draft) => draft.journal !== agent.journal || draft.mode !== agent.mode || JSON.stringify(facts(draft.release_facts)) !== JSON.stringify(agent.release_facts);
const currentMandate = (agent: PilotAgent, now: number) => agent.mode === "represent" && !!agent.mandate && agent.mandate.source_revision === agent.revision && Date.parse(agent.mandate.expires_at) > now;
const readableError = (error: unknown) => error instanceof Error ? error.message : "Something went wrong. Please try again.";
const formatDate = (value: string) => new Date(value).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" });

export function PilotWorkspace() {
  const [state, setState] = useState<PilotState | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [loading, setLoading] = useState(true);
  const [absent, setAbsent] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [now, setNow] = useState(0);
  const mutation = useRef(false);

  const accept = (next: PilotState, savedId?: string) => {
    setState(next);
    setAbsent(false);
    setDrafts((previous) => Object.fromEntries(next.agents.map((agent) => {
      const oldAgent = state?.agents.find((item) => item.agent_id === agent.agent_id);
      const keepEdit = agent.agent_id !== savedId && previous[agent.agent_id] && oldAgent && dirty(oldAgent, previous[agent.agent_id]);
      return [agent.agent_id, keepEdit ? previous[agent.agent_id] : toDraft(agent)];
    })));
  };

  useEffect(() => {
    let active = true;
    pilotRequest("/api/pilot").then((data: PilotState) => {
      if (!active) return;
      setState(data);
      setDrafts(Object.fromEntries(data.agents.map((agent) => [agent.agent_id, toDraft(agent)])));
    }).catch((failure) => {
      if (!active) return;
      const message = readableError(failure);
      if (message === "Pilot not created.") setAbsent(true);
      else setError(message);
    }).finally(() => { if (active) setLoading(false); });
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    setTimeout(() => { if (active) setNow(Date.now()); }, 0);
    return () => { active = false; clearInterval(timer); };
  }, []);

  const act = async (label: string, operation: () => Promise<PilotState>, message: string, savedId?: string) => {
    if (mutation.current) return;
    mutation.current = true;
    setBusy(label); setError(""); setNotice("");
    try { accept(await operation(), savedId); setNotice(message); }
    catch (failure) { setError(readableError(failure)); }
    finally { mutation.current = false; setBusy(""); }
  };
  const refresh = async () => {
    if (mutation.current) return;
    mutation.current = true; setBusy("refresh"); setError("");
    try {
      const next: PilotState = await pilotRequest("/api/pilot");
      accept(next);
      setNotice("Refreshed the saved circle. Your unsaved edits are still here.");
    } catch (failure) {
      const message = readableError(failure);
      if (message === "Pilot not created.") { setAbsent(true); setState(null); }
      else setError(message);
    } finally { mutation.current = false; setBusy(""); }
  };
  const updateDraft = (id: string, patch: Partial<Draft>) => setDrafts((previous) => ({ ...previous, [id]: { ...previous[id], ...patch } }));
  const readyCount = state?.agents.filter((agent) => currentMandate(agent, now)).length ?? 0;
  const hasUnsaved = !!state?.agents.some((agent) => drafts[agent.agent_id] && dirty(agent, drafts[agent.agent_id]));
  const canRun = !!state && readyCount === 3 && !hasUnsaved && !busy;
  const name = (id: string) => state?.agents.find((agent) => agent.agent_id === id)?.name ?? id;

  return <div className="workspace-shell min-h-screen text-zinc-200">
    <header className="border-b border-white/6 bg-[#0b0d10]/80">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-5 sm:px-9">
        <div className="flex items-center gap-4 sm:gap-7">
          <Link href="/" aria-label="Back to investigations" className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/5 hover:text-white"><ArrowLeft size={17} /></Link>
          <Link href="/" className="text-lg font-semibold tracking-[0.18em] text-zinc-100">ARC<span className="ml-1 text-emerald-400">·</span></Link>
          <span className="hidden h-5 w-px bg-white/10 sm:block" /><span className="hidden text-sm text-zinc-400 sm:block">The first circle</span>
        </div>
        <span className="flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/5 px-3 py-1.5 text-[10px] font-medium text-emerald-300 sm:text-xs"><span className="size-1.5 rounded-full bg-emerald-400" />Local pilot · fictional people</span>
      </div>
    </header>

    <main className="mx-auto max-w-[1440px] px-5 pb-14 pt-9 sm:px-9 sm:pt-12">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div className="max-w-2xl"><p className="mb-3 text-[10px] font-medium uppercase tracking-[0.24em] text-emerald-400/80">Three representatives. One small circle.</p>
          <h1 className="text-3xl font-medium tracking-tight text-zinc-100 sm:text-4xl">A useful introduction,<br /><span className="text-zinc-500">with room for a private life.</span></h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-zinc-400">Maya needs a developer. Leo can help. Sam connects people. Explore how their representatives find a useful connection while the journal stays under its owner’s control.</p>
        </div>
        <div className="max-w-sm border-l border-white/10 pl-4 text-xs leading-6 text-zinc-500"><p>All three fictional personas run on this device. They are not verified people or separate accounts.</p><p className="mt-1">Notes are stored locally and are <span className="text-zinc-400">not encrypted at rest</span> in this pilot.</p></div>
      </div>

      <section aria-label="Two permission gates" className="my-8 grid gap-3 md:grid-cols-2">
        <div className="glass-card flex gap-4 p-5"><span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/3 text-zinc-400"><KeyRound size={17} /></span><div><h2 className="text-sm font-medium text-zinc-200"><span className="mr-2 text-zinc-600">01</span>Permission to understand</h2><p className="mt-2 text-xs leading-6 text-zinc-500">A standing rule names the two peers, this journal entry and a 24-hour window. Their reasoning uses the selected full entry inside the local model.</p></div></div>
        <div className="glass-card flex gap-4 p-5"><span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-emerald-400/15 bg-emerald-400/5 text-emerald-400"><ShieldCheck size={17} /></span><div><h2 className="text-sm font-medium text-zinc-200"><span className="mr-2 text-zinc-600">02</span>Permission to disclose</h2><p className="mt-2 text-xs leading-6 text-zinc-500">Only the exact facts you approve may appear in released results. Private reasoning and peer transcripts are not shown. Saving changes to an entry or its rules pauses representation.</p></div></div>
      </section>

      <div aria-live="polite" className="space-y-3">
        {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-400/20 bg-amber-400/5 px-5 py-4 text-sm text-amber-200"><span>{error}</span><button disabled={!!busy} onClick={() => void refresh()} className="flex items-center gap-2 text-xs underline underline-offset-4 disabled:opacity-40"><RefreshCw size={12} />Retry saved state</button></div>}
        {notice && <p className="rounded-xl border border-emerald-400/10 bg-emerald-400/3 px-5 py-3 text-xs leading-6 text-emerald-200/80">{notice}</p>}
      </div>

      {loading ? <div className="glass-card my-6 flex items-center gap-3 p-8 text-sm text-zinc-500"><RefreshCw size={16} className="activity-spin" />Opening the local circle…</div> : absent ?
        <section className="glass-card my-6 flex flex-col items-start gap-6 p-7 sm:flex-row sm:items-center sm:justify-between sm:p-9"><div><Users size={26} className="mb-4 text-emerald-400" /><h2 className="text-xl font-medium">Begin with three fictional journals.</h2><p className="mt-3 max-w-xl text-sm leading-7 text-zinc-500">Create Maya, Leo and Sam on this device. They begin in local-only mode with no circle authorization. You will review the notes and approved facts before giving each representative a standing rule.</p></div><button disabled={!!busy} onClick={() => void act("create", () => pilotRequest("/api/pilot/create", {}), "Circle created. Review each journal, select Represent in this circle, save, then authorize its rule.")} className="primary-button flex items-center gap-2 whitespace-nowrap px-5 py-3">{busy === "create" ? "Creating…" : "Create fictional pilot"}<ArrowRight size={15} /></button></section> : state && <>
        <div className="mb-4 mt-8 flex items-center justify-between gap-4"><h2 className="text-sm font-medium text-zinc-200">The circle <span className="ml-2 text-xs font-normal text-zinc-600">3 fictional participants</span></h2><button disabled={!!busy} onClick={() => void refresh()} className="flex items-center gap-2 rounded-lg px-2 py-1 text-xs text-zinc-500 hover:text-zinc-200 disabled:opacity-40"><RefreshCw size={12} />Refresh</button></div>
        <section aria-label="Pilot participants" className="grid items-start gap-4 xl:grid-cols-3">
          {state.agents.map((agent, index) => {
            const draft = drafts[agent.agent_id] ?? toDraft(agent);
            const unsaved = dirty(agent, draft);
            const current = currentMandate(agent, now);
            const peers = state.agents.filter((peer) => peer.agent_id !== agent.agent_id);
            return <article key={agent.agent_id} className="glass-card overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-white/5 p-5"><div className="flex items-center gap-3"><span className={`flex size-10 items-center justify-center rounded-xl border text-sm font-medium ${index === 0 ? "border-emerald-400/20 bg-emerald-400/8 text-emerald-300" : index === 1 ? "border-sky-300/15 bg-sky-300/5 text-sky-200" : "border-violet-300/15 bg-violet-300/5 text-violet-200"}`}>{agent.name.charAt(0)}</span><div><h3 className="font-medium text-zinc-100">{agent.name}</h3><p className="mt-1 text-[11px] text-zinc-500">{agent.role}</p></div></div><span className={`rounded-full px-2 py-1 text-[10px] ${current ? "bg-emerald-400/8 text-emerald-300" : "bg-white/4 text-zinc-500"}`}>{current ? "Rule active" : agent.mode === "sealed" ? "Sealed" : "Paused"}</span></div>
              <div className="space-y-5 p-5">
                <details className="group rounded-xl border border-white/7 bg-black/10"><summary className="flex items-center justify-between gap-3 p-4 text-xs text-zinc-400"><span className="flex items-center gap-2"><LockKeyhole size={14} />Private journal<span className="text-[10px] text-zinc-600">· entry 1</span></span><ChevronDown size={13} className="transition group-open:rotate-180" /></summary><div className="px-4 pb-4"><label htmlFor={`journal-${agent.agent_id}`} className="mb-2 block text-[10px] leading-5 text-zinc-500">Owner view. The full selected entry is available only to local reasoning when its rule permits it.</label><textarea id={`journal-${agent.agent_id}`} disabled={!!busy} value={draft.journal} onChange={(event) => updateDraft(agent.agent_id, { journal: event.target.value })} rows={7} className="w-full resize-y rounded-lg border border-white/10 bg-[#0b0d10] p-3 text-xs leading-6 text-zinc-300 outline-none disabled:opacity-50" /></div></details>

                <fieldset disabled={!!busy}><legend className="mb-2 text-[10px] uppercase tracking-widest text-zinc-600">This representative may</legend><div className="space-y-2">{modes.map((mode) => <label key={mode.id} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${draft.mode === mode.id ? "border-emerald-400/20 bg-emerald-400/4" : "border-white/6 hover:bg-white/2"}`}><input type="radio" name={`mode-${agent.agent_id}`} value={mode.id} checked={draft.mode === mode.id} onChange={() => updateDraft(agent.agent_id, { mode: mode.id })} className="mt-0.5 accent-emerald-400" /><span><span className="block text-xs text-zinc-300">{mode.label}</span>{draft.mode === mode.id && <span className="mt-1 block text-[11px] leading-5 text-zinc-500">{mode.description}</span>}</span></label>)}</div></fieldset>

                <div><label htmlFor={`facts-${agent.agent_id}`} className="flex items-center gap-2 text-xs font-medium text-zinc-300"><ShieldCheck size={14} className="text-emerald-400/80" />Facts allowed in human-visible outcomes</label><p className="mb-3 mt-2 text-[11px] leading-5 text-zinc-500">Review these as {agent.name}. One exact statement per line. These facts may be shown to the other two people in this fictional circle. Confidential peer understanding is controlled separately above.</p><textarea id={`facts-${agent.agent_id}`} disabled={!!busy} value={draft.release_facts} onChange={(event) => updateDraft(agent.agent_id, { release_facts: event.target.value })} rows={4} placeholder="Write only what this representative may disclose…" className="w-full resize-y rounded-lg border border-white/10 bg-[#0b0d10] p-3 text-xs leading-6 text-zinc-300 outline-none placeholder:text-zinc-700 disabled:opacity-50" /></div>

                <div className="flex items-center justify-between gap-3"><span className="text-[10px] text-zinc-600">{unsaved ? "Unsaved changes · rule must be renewed" : `Saved · revision ${agent.revision}`}</span><button disabled={!!busy || !unsaved} onClick={() => void act(`save-${agent.agent_id}`, () => pilotRequest(`/api/pilot/agents/${encodeURIComponent(agent.agent_id)}/journal`, { revision: agent.revision, journal: draft.journal, release_facts: facts(draft.release_facts), mode: draft.mode }), `${agent.name}’s entry and disclosure facts are saved. Renew the standing rule to resume representation.`, agent.agent_id)} className="rounded-lg border border-white/12 px-3 py-2 text-xs text-zinc-300 hover:bg-white/4 disabled:opacity-30">{busy === `save-${agent.agent_id}` ? "Saving…" : "Save changes"}</button></div>
              </div>
              <div className="border-t border-white/5 bg-white/[0.015] p-5"><div className="mb-2 flex items-center gap-2 text-xs text-zinc-300"><Fingerprint size={14} className="text-zinc-500" />Standing rule for this circle</div><p className="text-[11px] leading-6 text-zinc-500">For a professional introduction, allow local reasoning with <span className="text-zinc-300">{peers.map((peer) => peer.name).join(" and ")}</span> using this entry. Release only the approved facts above.</p><div className="my-3 flex items-start gap-2 text-[10px] leading-5 text-zinc-600"><Clock3 size={12} className="mt-1 shrink-0" />{current && agent.mandate ? `Active until ${formatDate(agent.mandate.expires_at)}.` : agent.mandate ? `Previous rule expired or became invalid (${formatDate(agent.mandate.expires_at)}).` : "No current authorization. The next rule lasts 24 hours."}</div><div className="flex gap-2"><button disabled={!!busy || unsaved || agent.mode !== "represent" || current} onClick={() => void act(`authorize-${agent.agent_id}`, () => pilotRequest(`/api/pilot/agents/${encodeURIComponent(agent.agent_id)}/mandate`, { revision: agent.revision, source_entry_ids: [agent.entry_id], peer_ids: peers.map((peer) => peer.agent_id), expires_in_hours: 24 }), `${agent.name}’s standing rule is active for this entry and these two peers for 24 hours.`)} className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/7 px-3 py-2.5 text-xs text-emerald-300 transition hover:bg-emerald-400/12 disabled:opacity-30">{current ? <Check size={13} /> : <KeyRound size={13} />}{current ? "Authorized" : busy === `authorize-${agent.agent_id}` ? "Authorizing…" : "Authorize rule · 24h"}</button><button disabled={!!busy || !agent.mandate} onClick={() => void act(`pause-${agent.agent_id}`, () => pilotRequest(`/api/pilot/agents/${encodeURIComponent(agent.agent_id)}/pause`, {}), `${agent.name}’s standing rule is paused. No further representation is permitted.`)} className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2.5 text-xs text-zinc-400 hover:bg-white/4 disabled:opacity-30"><CirclePause size={13} />Pause</button></div>{unsaved ? <p className="mt-3 text-[10px] text-amber-200/70">Save your changes before authorizing.</p> : agent.mode !== "represent" && <p className="mt-3 text-[10px] text-zinc-600">Select Represent in this circle, then save to enable a rule.</p>}</div>
            </article>;
          })}
        </section>

        <section className="glass-card mt-6 overflow-hidden" aria-label="Run the local circle">
          <div className="flex flex-col justify-between gap-5 p-6 sm:p-7 lg:flex-row lg:items-center"><div><p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-zinc-600">A small, real test</p><h2 className="text-lg font-medium text-zinc-200">Can this circle make a useful introduction?</h2><p className="mt-2 max-w-2xl text-xs leading-6 text-zinc-500">The local model reasons over the permitted entries. A separate release gate limits results to approved facts. If the local model is unavailable, the run stops. There is no cloud fallback or pretend result.</p></div><div className="shrink-0"><button disabled={!canRun} onClick={() => void act("run", async () => { await pilotRequest("/api/pilot/run", { request_id: crypto.randomUUID(), revision: state.revision }); return pilotRequest("/api/pilot"); }, "The run’s result is saved below. Read the outcome and private-context receipts.")} className="primary-button flex w-full items-center justify-center gap-2 px-5 py-3">{busy === "run" ? <RefreshCw size={15} className="activity-spin" /> : <Sparkles size={15} />}{busy === "run" ? "Reasoning locally…" : "Run the local circle"}</button><p className="mt-2 text-center text-[10px] text-zinc-600">{hasUnsaved ? "Save all changes first" : `${readyCount} of 3 current rules`}</p></div></div>
          {state.last_run ? <RunResult run={state.last_run} name={name} /> : <div className="flex items-center gap-3 border-t border-white/5 px-6 py-5 text-xs text-zinc-600 sm:px-7"><NotebookPen size={15} />No run yet. Authorize each representative when the entry and sharing facts look right.</div>}
        </section>
      </>}
      <footer className="mt-9 flex flex-col justify-between gap-3 border-t border-white/5 pt-5 text-[10px] leading-6 text-zinc-600 sm:flex-row"><span>Built to test understanding, consent and useful connections.</span><span className="flex items-center gap-2"><LockKeyhole size={11} />Local simulation · no identity verification · no external research</span></footer>
    </main>
  </div>;
}

function RunResult({ run, name }: { run: PilotRun; name: (id: string) => string }) {
  return <div className="border-t border-white/5 bg-black/10 p-6 sm:p-7"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><span className={`size-1.5 rounded-full ${run.status === "completed" ? "bg-emerald-400" : run.status === "quiet" ? "bg-zinc-500" : "bg-amber-300"}`} /><h3 className="text-sm font-medium text-zinc-200">{run.status === "completed" ? "An introduction to consider" : run.status === "quiet" ? "The circle stayed quiet" : "The run stopped safely"}</h3></div><span className="text-[10px] text-zinc-600">{formatDate(run.created_at)} · {run.mode === "local_model" ? "Local model" : "No valid local decision"}</span></div><p className="mt-3 text-xs leading-6 text-zinc-500">{run.message}</p>{run.outcomes.length > 0 && <div className="mt-5 grid gap-3 md:grid-cols-3">{run.outcomes.map((outcome, index) => <div key={`${outcome.recipient_id}-${index}`} className="rounded-xl border border-emerald-400/12 bg-emerald-400/[0.025] p-4"><p className="mb-2 text-[10px] uppercase tracking-widest text-emerald-300/70">For {name(outcome.recipient_id)}</p><p className="whitespace-pre-wrap text-sm leading-7 text-zinc-300">{outcome.text}</p></div>)}</div>}<details className="group mt-5 border-t border-white/5 pt-4"><summary className="flex items-center justify-between gap-3 text-xs text-zinc-500"><span className="flex items-center gap-2"><ShieldCheck size={14} />Private-context receipts · {run.receipts.length}</span><ChevronDown size={13} className="transition group-open:rotate-180" /></summary><p className="mb-3 mt-3 text-[11px] leading-6 text-zinc-600">These records identify the confidential entries selected for each local peer reasoning attempt. They do not confirm delivery when a model is unavailable, and do not record a public disclosure. Private reasoning and peer transcripts are not shown.</p>{run.receipts.length ? <div className="space-y-2">{run.receipts.map((receipt, index) => <div key={index} className="rounded-lg border border-white/5 px-3 py-3 text-[11px] leading-6 text-zinc-500"><div className="flex flex-wrap items-center gap-x-2 text-zinc-300"><span>{name(receipt.sender_id)}</span><ArrowRight size={11} /><span>{name(receipt.recipient_id)}</span><span className="ml-auto text-[10px] text-zinc-600">Revision {receipt.source_revision}</span></div><p>Purpose: {receipt.purpose.replaceAll("_", " ")}</p><p className="break-all text-[10px] text-zinc-600">Source: {receipt.source_entry_ids.join(", ")}</p></div>)}</div> : <p className="text-xs text-zinc-600">No private context use recorded.</p>}<p className="mt-3 break-all text-[10px] text-zinc-700">Run {run.request_id}</p></details></div>;
}
