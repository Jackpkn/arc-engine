"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { PanelLeft, Square, X, LoaderCircle, Check, Pause, SlidersHorizontal, ArrowLeft } from "lucide-react";
import { useInvestigation, type InvestigationSummary } from "@/lib/use-investigation";
import { provider, toolResults } from "@/lib/presentation";
import { EvidenceGraph } from "./evidence-graph";
import { ToolStream } from "./tool-stream";
import { ReviewPanel, NodeInspector } from "./review-panel";
import { ChatComposer } from "./chat-composer";
import { InvestigationSidebar, views, type WorkspaceView } from "./investigation-sidebar";
import { PeerJudgments } from "./peer-judgments";
import { ClaimJournal } from "./claim-journal";
import { ProfileAgent } from "./profile-agent";
import { EvidenceInspector } from "./evidence-inspector";
import type { EvidenceSpanView } from "@/lib/investigation";

export function Workspace() {
  const { state, start, send, answer, cancel, evidence, span, cachedProfile, history, historyError, refreshHistory, open, newInvestigation } = useInvestigation();
  const [view, setView] = useState<WorkspaceView>("conversation");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [raw, setRaw] = useState("");
  const [loadingEvidence, setLoadingEvidence] = useState(false);
  const [passages, setPassages] = useState<EvidenceSpanView[] | null>(null);
  const evidenceDialog = useRef<HTMLDialogElement>(null);
  const detailsDialog = useRef<HTMLDialogElement>(null);
  const mobileSidebar = useRef<HTMLDialogElement>(null);
  const evidenceRequest = useRef(0);
  const busy = state.status === "starting" || state.status === "running";
  const paused = state.prompts.length > 0 || state.connection === "reconnecting";
  const node = state.graph.nodes.find((node) => node.id === selected);
  const results = toolResults(state.logs);
  const hasSession = !!state.sessionId;
  const cachedReplay = state.logs.some(event => event.type === "research.mode" && event.mode === "cached_replay");
  const canFollowUp = !cachedReplay && state.logs.some((event) => event.type === "investigation.complete");
  const status = state.connection === "reconnecting" && busy ? "Reconnecting"
    : state.prompts.length ? "Your answer needed" : busy ? state.phase === "conversation" ? "Replying" : "Researching"
    : state.status === "complete" ? "Complete" : state.status === "idle" ? "" : state.status;
  const showView = (value: WorkspaceView) => { setView(value); mobileSidebar.current?.close(); };
  const sidebarProps = { view, onView: showView, sessionId: state.sessionId, history, error: historyError,
    onRefresh: () => { void refreshHistory(); }, pending: state.status === "starting",
    onNew: () => { newInvestigation(); setSelected(null); showView("conversation"); },
    onOpen: (item: InvestigationSummary) => { open(item); setSelected(null); showView("conversation"); } };
  const openEvidence = async (id: string) => {
    const requestId = ++evidenceRequest.current;
    setPassages(null); setRaw(""); setLoadingEvidence(true); evidenceDialog.current?.showModal();
    try { const result = await evidence(id); if (requestId === evidenceRequest.current) setRaw(JSON.stringify(result, null, 2)); }
    catch (error) { if (requestId === evidenceRequest.current) setRaw(String(error)); }
    finally { if (requestId === evidenceRequest.current) setLoadingEvidence(false); }
  };
  const openSpans = async (ids: string[]) => {
    const requestId = ++evidenceRequest.current;
    setPassages([]); setRaw(""); setLoadingEvidence(true); evidenceDialog.current?.showModal();
    try { const result = await Promise.all([...new Set(ids)].map(id => span(id))); if (requestId === evidenceRequest.current) setPassages(result); }
    catch (error) { if (requestId === evidenceRequest.current) { setPassages(null); setRaw(String(error)); } }
    finally { if (requestId === evidenceRequest.current) setLoadingEvidence(false); }
  };
  const selectNode = (id: string) => {
    setSelected(id);
    const selectedNode = state.graph.nodes.find(item => item.id === id);
    if (selectedNode?.span_ids?.length) void openSpans(selectedNode.span_ids);
  };

  return <main className="flex h-dvh min-h-0 overflow-hidden bg-[#101215] text-zinc-100">
    <aside className={sidebarOpen ? "hidden shrink-0 border-r border-white/5 md:flex" : "hidden"} aria-label="Sidebar"><InvestigationSidebar {...sidebarProps} onClose={() => setSidebarOpen(false)} /></aside>
    <dialog ref={mobileSidebar} aria-label="Navigation menu" className="m-0 h-dvh max-h-none max-w-none border-0 bg-[#0b0d10] p-0 text-zinc-100 backdrop:bg-black/60"><InvestigationSidebar {...sidebarProps} onClose={() => mobileSidebar.current?.close()} /></dialog>
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <header className="flex h-16 shrink-0 items-center gap-3 px-4 sm:px-6">
        <button aria-label="Toggle sidebar" onClick={() => { if (window.matchMedia("(min-width: 768px)").matches) setSidebarOpen(!sidebarOpen); else mobileSidebar.current?.showModal(); }} className="rounded-lg p-2 text-zinc-500 hover:bg-white/5 hover:text-zinc-200"><PanelLeft size={18} /></button>
        <div className="min-w-0 flex-1"><h1 className="truncate text-sm font-medium text-zinc-300">{state.target || "New investigation"}</h1>{view !== "conversation" && <p className="mt-0.5 text-[10px] text-zinc-600">{views.find((item) => item.id === view)?.title}</p>}</div>
        {status && <span role="status" className={`flex shrink-0 items-center gap-1.5 text-[11px] ${paused ? "text-amber-300" : state.status === "failed" ? "text-rose-300" : "text-zinc-500"}`}>
          {busy ? paused ? <Pause size={12} /> : <LoaderCircle size={12} className="activity-spin" /> : state.status === "complete" ? <Check size={12} /> : null}<span className="hidden sm:inline">{status}</span></span>}
        {busy && hasSession && <button onClick={() => void cancel()} aria-label="Stop current operation" className="rounded-lg p-2 text-zinc-400 hover:bg-white/5"><Square size={14} /></button>}
        <button aria-label="Investigation details" onClick={() => detailsDialog.current?.showModal()} className="rounded-lg p-2 text-zinc-500 hover:bg-white/5 hover:text-zinc-200"><SlidersHorizontal size={17} /></button>
      </header>
      {state.error && <p role="alert" className="mx-4 mb-2 rounded-lg border border-rose-500/15 bg-rose-500/5 px-4 py-3 text-xs text-rose-300">{state.error}</p>}
      {cachedReplay && <p className="mx-5 mb-3 text-xs leading-5 text-amber-200/80">Cached profile review · no new model or source calls · public graph unchanged. Research decisions use reviewed fixtures; portrait text reuses saved model interpretations.</p>}
      {state.prompts.length > 0 && view !== "conversation" && <button onClick={() => showView("conversation")} className="mx-4 mb-3 flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-left text-xs text-amber-300"><ArrowLeft size={14} />ARC needs your answer. Return to the conversation.</button>}
      <section key={`conversation-${state.sessionId || "new"}`} aria-label="Conversation" className={view === "conversation" ? "flex min-h-0 flex-1 flex-col" : "hidden"}>
        <ToolStream state={state} visible={view === "conversation"} answer={answer} onEvidence={(id) => void openEvidence(id)} />
        {cachedProfile && !busy && <div className="mx-auto w-full max-w-4xl px-4 pb-2"><button onClick={() => { setSelected(null); void start(cachedProfile.target, false, cachedProfile.session_id); }} className="rounded-lg border border-emerald-500/20 px-4 py-2 text-xs text-emerald-300 hover:bg-emerald-500/5">Review saved {cachedProfile.target} evidence · no credits</button><p className="mt-2 text-[11px] text-zinc-500">Runs the recursive review in this workspace. Open Dossier or Graph afterward and click a claim.</p></div>}
        <ChatComposer hasSession={hasSession} canFollowUp={canFollowUp} busy={busy} waiting={!!state.prompts.length}
          onSubmit={async (text, refreshSources) => { setSelected(null); return hasSession ? send(text) : start(text, refreshSources); }} />
      </section>
      <section aria-label="Dossier" className={view === "dossier" ? "relative min-h-0 flex-1 overflow-y-auto" : "hidden"}><div className="mx-auto max-w-7xl">
        <ReviewPanel state={state} onSelect={selectNode} onEvidence={(id) => void openEvidence(id)} onSpans={(ids) => void openSpans(ids)} />
        {view === "dossier" && state.committed && <div key={state.sessionId}>
          <Link href={`/u/${state.sessionId}`} className="mx-7 text-sm text-emerald-300 hover:underline">Open public profile ↗</Link>
          <ClaimJournal profileId={state.sessionId} />
          <ProfileAgent profileId={state.sessionId} name={state.graph.nodes.find((item) => item.label === "Person")?.title || state.target} />
        </div>}
        {node && <div className="sticky bottom-3 z-20 mx-5 mb-4"><NodeInspector node={node} onEvidence={(id) => void openEvidence(id)} onClose={() => setSelected(null)} /></div>}
      </div></section>
      <section aria-label="Graph" className={view === "graph" ? "relative flex min-h-0 flex-1 flex-col overflow-y-auto" : "hidden"}>
        {view === "graph" && <EvidenceGraph graph={state.graph} committed={state.committed} selected={selected} onSelect={selectNode} />}
        {node && <div className="absolute right-3 bottom-14 z-20 max-h-[55%] w-[min(340px,calc(100%-24px))] overflow-y-auto"><NodeInspector node={node} onEvidence={(id) => void openEvidence(id)} onClose={() => setSelected(null)} /></div>}
      </section>
      <section aria-label="Peer claims" className={view === "peers" ? "min-h-0 flex-1 overflow-y-auto" : "hidden"}>{view === "peers" && (state.committed ? <PeerJudgments key={state.sessionId} profileId={state.sessionId} /> : <p className="p-7 text-sm text-zinc-500">Complete an investigation to open its peer judgments.</p>)}</section>
    </div>
    <dialog ref={detailsDialog} aria-labelledby="details-heading" className="my-0 mr-0 ml-auto h-dvh max-h-none w-[min(90vw,380px)] max-w-none border-l border-white/10 bg-[#13161b] p-6 text-zinc-100 backdrop:bg-black/40">
      <div className="mb-8 flex items-center justify-between"><h2 id="details-heading" className="text-sm font-medium">Investigation details</h2><button onClick={() => detailsDialog.current?.close()} aria-label="Close details" className="text-zinc-500"><X size={18} /></button></div>
      <h3 className="eyebrow mb-4">Source activity</h3><div className="space-y-4">{["Exa", "Apify", "GitHub", "Firecrawl", "Neo4j"].map((name) => {
        const calls = state.logs.filter((event) => event.type === "tool.started" && provider(event.tool) === name);
        const running = busy && calls.some((event) => !results.has(event.tool_use_id || ""));
        const failed = calls.some((event) => results.get(event.tool_use_id || "")?.type === "tool.failed");
        const used = calls.some((event) => results.get(event.tool_use_id || "")?.type === "tool.finished");
        const committed = name === "Neo4j" && state.committed;
        return <div key={name} className="flex items-center justify-between text-xs"><span className="text-zinc-400">{name}</span><span className={running ? "text-amber-300" : failed ? "text-rose-300" : used || committed ? "text-emerald-300" : "text-zinc-600"}>{committed ? "Committed" : running ? paused ? "Waiting" : "Active" : failed ? "Error" : used ? "Used" : "Not used"}</span></div>;
      })}</div>
      <div className="mt-8 space-y-4 border-t border-white/7 pt-6 text-xs"><p className="flex justify-between text-zinc-400"><span>{state.usageUnknown ? "Known Claude cost so far" : "Reported Claude cost"}</span><span>${state.cost.toFixed(4)}</span></p>{state.usageUnknown && <p className="text-amber-300">Final model usage is unknown. This amount is incomplete; further model replies are blocked.</p>}<p className="flex justify-between text-zinc-500"><span>Cache read</span><span>{state.cacheRead.toLocaleString()} tokens</span></p><p className="text-zinc-600">Provider charges are separate. Follow-ups reuse collected evidence and spend from the remaining investigation budget.</p>{state.model && <p className="text-zinc-600">{state.model}</p>}{hasSession && <p className="break-all text-[10px] text-zinc-700">Session {state.sessionId}</p>}</div>
    </dialog>
    <dialog ref={evidenceDialog} aria-labelledby="evidence-heading" className="my-0 mr-0 ml-auto h-dvh max-h-none w-[min(100vw,680px)] max-w-none overflow-y-auto border-l border-zinc-700 bg-zinc-950 p-0 text-zinc-100 backdrop:bg-black/60">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-zinc-950 p-4"><h2 id="evidence-heading" className="text-sm font-medium">{passages ? "Exact source evidence" : "Captured source output"}</h2><form method="dialog"><button aria-label="Close evidence" className="rounded p-1 text-zinc-400 hover:text-white"><X size={18} /></button></form></div>
      {loadingEvidence ? <p role="status" className="flex items-center gap-2 p-6 text-xs text-zinc-400"><LoaderCircle size={15} className="activity-spin" />Loading captured output…</p> : passages ? <EvidenceInspector passages={passages} /> : <pre className="overflow-auto whitespace-pre-wrap break-words p-4 text-xs leading-relaxed text-zinc-300">{raw}</pre>}
    </dialog>
  </main>;
}
