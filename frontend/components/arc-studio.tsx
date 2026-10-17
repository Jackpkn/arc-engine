"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, ExternalLink, LockKeyhole, Plus, X } from "lucide-react";
import styles from "./arc-studio.module.css";

type View = "directory" | "mine" | "journal";
type HistoryWindow = "week" | "month" | "quarter";
type JournalEntry = { id: string; date: string; text: string; proof: string };
type Profile = {
  id: string; name: string; initials: string; role: string; place: string; color: string;
  title: string; summary: string; tags: string[]; uncertainty: string;
  reasons: { date: string; source: string; observation: string; interpretation: string }[];
};

const profiles: Profile[] = [
  { id: "maya", name: "Maya Rao", initials: "MR", role: "Product designer", place: "Bristol", color: "mint",
    title: "Builds before pitching.", summary: "Turns an idea into something people can try. Seems most at home where design meets a small, useful project.",
    tags: ["Small experiments", "Community tools"], uncertainty: "Two project examples suggest this pattern. They tell us little about how Maya works in a larger team.",
    reasons: [
      { date: "25 Sep 2026", source: "Sample · project notebook", observation: "A community-directory prototype was shared before a formal launch plan.", interpretation: "A preference for testing an idea by making it tangible." },
      { date: "02 Oct 2026", source: "Sample · public project update", observation: "The next version followed conversations with five potential users.", interpretation: "An interest in learning from use, rather than polishing in isolation." },
    ] },
  { id: "leo", name: "Leo Park", initials: "LP", role: "Developer & runner", place: "London", color: "coral",
    title: "Training is a ritual.", summary: "Brings patient repetition to code and to running. Likes a clear problem, a steady rhythm, and the satisfaction of getting better.",
    tags: ["Web craft", "Long-distance thinking"], uncertainty: "This is a reading of two fictional examples, not a personality assessment. A consistent habit does not prove reliability in every setting.",
    reasons: [
      { date: "18 Sep 2026", source: "Sample · developer log", observation: "Small improvements to the same open project appeared over several weeks.", interpretation: "Progress through repeated practice seems to matter." },
      { date: "30 Sep 2026", source: "Sample · running notebook", observation: "A training note focused on consistency instead of a race result.", interpretation: "The process may be as meaningful as the finish line." },
    ] },
  { id: "sam", name: "Sam Okafor", initials: "SO", role: "Community organiser", place: "Manchester", color: "yellow",
    title: "Brings people together.", summary: "Makes space for people who might otherwise never meet. Notices a useful connection and gives it somewhere to begin.",
    tags: ["Good introductions", "Room for newcomers"], uncertainty: "Hosting events is visible; what people experienced in the room is harder to know. No independent feedback is included here.",
    reasons: [
      { date: "12 Sep 2026", source: "Sample · event invitation", observation: "A neighbourhood makers’ evening paired newcomers with returning members.", interpretation: "An effort to make joining feel easier." },
      { date: "04 Oct 2026", source: "Sample · community note", observation: "A follow-up introduced two participants with complementary projects.", interpretation: "Connections appear to continue beyond the event itself." },
    ] },
];

type ConfidenceStage = "Emerging" | "Taking shape" | "Well supported";
type HistoryEvent = { date: string; label: string; kind: "evidence" | "gap" | "counterexample" };
type HistoryFixture = { stage: ConfidenceStage; secondaryStage: ConfidenceStage; span: string; activeWeeks: number; totalWeeks: number; events: HistoryEvent[] };
const histories: Record<HistoryWindow, HistoryFixture> = {
  week: { stage: "Emerging", secondaryStage: "Emerging", span: "08–14 Oct 2026", activeWeeks: 1, totalWeeks: 1, events: [
    { date: "2026-10-09", label: "One dated example. A useful first clue.", kind: "evidence" },
  ] },
  month: { stage: "Taking shape", secondaryStage: "Taking shape", span: "17 Sep–14 Oct 2026", activeWeeks: 3, totalWeeks: 4, events: [
    { date: "2026-09-18", label: "A first dated example.", kind: "evidence" },
    { date: "2026-09-26", label: "A related action in another week.", kind: "evidence" },
    { date: "2026-10-03", label: "A third example suggests a pattern.", kind: "evidence" },
    { date: "2026-10-10", label: "No evidence this week. Leave it unknown.", kind: "gap" },
  ] },
  quarter: { stage: "Well supported", secondaryStage: "Emerging", span: "23 Jul–14 Oct 2026", activeWeeks: 9, totalWeeks: 12, events: [
    { date: "2026-07-24", label: "The first dated example.", kind: "evidence" },
    { date: "2026-07-31", label: "Follow-through a week later.", kind: "evidence" },
    { date: "2026-08-07", label: "The pattern appears in another activity.", kind: "evidence" },
    { date: "2026-08-14", label: "A dated artifact backs the journal account.", kind: "evidence" },
    { date: "2026-08-21", label: "A quiet week. No conclusion drawn.", kind: "gap" },
    { date: "2026-08-28", label: "Another action, separated in time.", kind: "evidence" },
    { date: "2026-09-04", label: "A further example supports the main reading.", kind: "evidence" },
    { date: "2026-09-11", label: "No dated evidence this week.", kind: "gap" },
    { date: "2026-09-18", label: "A repeated habit in a new setting.", kind: "evidence" },
    { date: "2026-09-26", label: "A source example adds context.", kind: "evidence" },
    { date: "2026-10-03", label: "A counterexample weakens the second reading.", kind: "counterexample" },
    { date: "2026-10-10", label: "Another unknown week, not a bad mark.", kind: "gap" },
  ] },
};

function JudgmentCard({ profile, history, secondary }: { profile: Profile; history: HistoryFixture; secondary: boolean }) {
  const title = secondary ? ({ maya: "Learns well in a group.", leo: "Protects a steady routine.", sam: "Makes room for newcomers." }[profile.id] ?? "A second reading.") : profile.title;
  const stage = secondary ? history.secondaryStage : history.stage;
  const reason = secondary && history.totalWeeks === 12 ? "A later counterexample puts this reading back in question. More time has made it less certain." : history.totalWeeks === 1 ? "One week offers a clue, not an established pattern." : history.totalWeeks === 4 ? "Related examples across different weeks begin to support this reading." : "Repeated supporting examples over three months make this reading more settled.";
  return <article className={styles.judgmentCard} data-stage={stage}><div className={styles.judgmentCardTop}><span>AGENT JUDGMENT / SAMPLE</span><strong>{stage}</strong></div><h3>{title}</h3><p>{reason}</p><div className={styles.judgmentCardFoot}><span>{history.span}</span><span>{history.activeWeeks} active {history.activeWeeks === 1 ? "week" : "weeks"}</span></div></article>;
}

function HistoryTimeline({ history }: { history: HistoryFixture }) {
  return <ol className={styles.historyTimeline}>{history.events.map((event) => <li key={event.date} data-kind={event.kind}><span className={styles.timelineMark} /><div><time dateTime={event.date}>{event.date}</time><p>{event.label}</p></div></li>)}</ol>;
}

function PaperBird({ small = false }: { small?: boolean }) {
  return <svg viewBox="0 0 460 330" aria-hidden="true" focusable="false" className={small ? styles.smallBird : styles.bird}>
    <path d="M22 254 82 227 58 198 125 167 161 196" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 7" />
    <path d="m118 170 143-80-42 143Z" fill="#244be7" />
    <path d="m261 90 120-53-43 123Z" fill="#ff7050" />
    <path d="m219 233 42-143 77 70Z" fill="#1635b5" />
    <path d="m338 160 77 9-34-132Z" fill="#244be7" />
    <path d="m118 170 101 63-56-3Z" fill="#c6e6d6" />
    <path d="m261 90 77 70 43-123Z" fill="none" stroke="#f5f0e6" strokeWidth="1.5" />
    <path d="m338 160 42 17-15 37Z" fill="#e7f46a" />
    <circle cx="369" cy="123" r="4" fill="#f5f0e6" />
    <path d="m281 274 7 0m-3.5-3.5v7m136-55h9m-4.5-4.5v9" stroke="currentColor" strokeWidth="1.5" />
  </svg>;
}

function ProfileArt({ profile, compact = false }: { profile: Profile; compact?: boolean }) {
  return <div className={`${styles.profileArt} ${styles[profile.color]} ${compact ? styles.compactArt : ""}`} aria-hidden="true">
    <svg viewBox="0 0 280 180" focusable="false">
      {profile.id === "maya" ? <><path d="m15 140 62-115 57 79 62-81 69 117Z" fill="#244be7" /><path d="m77 25 57 79-57 36Z" fill="#f5f0e6" /><path d="m196 23-62 81 62 36Z" fill="#ff7050" /><path d="M15 154h250" stroke="#1b211c" /><circle cx="239" cy="37" r="11" fill="#e7f46a" /></> : profile.id === "leo" ? <><path d="M28 25h67v76h70v54H28Z" fill="#f5f0e6" /><path d="M109 25h67v76h70v54h-81V79h-56Z" fill="#244be7" /><path d="m214 22 30 30-30 30-30-30Z" fill="#e7f46a" /><path d="M28 166h218" stroke="#1b211c" /></> : <><path d="m26 60 62-35 62 35-62 35Z" fill="#244be7" /><path d="m88 95 62-35v70l-62 35Z" fill="#ff7050" /><path d="m26 60 62 35v70l-62-35Z" fill="#f5f0e6" /><path d="m152 43 48-27 48 27-48 27Z" fill="#ff7050" /><path d="m200 70 48-27v54l-48 27Z" fill="#244be7" /><path d="m152 43 48 27v54l-48-27Z" fill="#c6e6d6" /></>}
    </svg>
    <span>{profile.initials}</span>
  </div>;
}

export function ArcStudio() {
  const [view, setView] = useState<View>("directory");
  const [selected, setSelected] = useState<Profile | null>(null);
  const [chosenId, setChosenId] = useState("maya");
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [source, setSource] = useState("");
  const [claimed, setClaimed] = useState(false);
  const [journal, setJournal] = useState("");
  const [journalDate, setJournalDate] = useState("2026-10-15");
  const [proof, setProof] = useState("");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [historyWindow, setHistoryWindow] = useState<HistoryWindow>("month");
  const [notice, setNotice] = useState("");
  const chosen = profiles.find((profile) => profile.id === chosenId) ?? profiles[0];
  const ownerName = name.trim() || chosen.name;
  const isDirty = !!journal.trim() || !!proof.trim();
  const history = histories[historyWindow];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    if (view !== "directory") document.getElementById("studio-view-title")?.focus({ preventScroll: true });
  }, [view, step]);

  useEffect(() => {
    if (!isDirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  const go = (next: View) => { setView(next); setNotice(""); };
  const startClaim = (profile = chosen) => {
    setSelected(null); setChosenId(profile.id); setStep(0); go("mine");
  };
  const saveJournal = () => {
    if (!journal.trim() || !journalDate) return;
    setEntries((previous) => [{ id: crypto.randomUUID(), date: journalDate, text: journal.trim(), proof: proof.trim() }, ...previous]);
    setJournal(""); setProof("");
    setNotice("Dated entry added in this tab. Awaiting agent review; sample judgments have not changed.");
  };
  const openOwner = () => { setClaimed(true); go("mine"); };

  return <div className={styles.studio}>
    <a href="#studio-main" className={styles.skipLink}>Skip to content</a>
    <header className={styles.header}>
      <button className={styles.wordmark} aria-label="ARC directory" onClick={() => go("directory")}>arc<span className={styles.wordmarkStar}>✳</span></button>
      <nav className={styles.nav} aria-label="Studio navigation">
        {([ ["directory", "Discover"], ["mine", "My profile"], ["journal", "Journal"] ] as [View, string][]).map(([id, label]) => <button key={id} className={view === id ? styles.activeNav : ""} aria-current={view === id ? "page" : undefined} onClick={() => go(id)}>{label}</button>)}
      </nav>
      <button className={`${styles.button} ${styles.blueButton} ${styles.headerCta}`} onClick={() => claimed ? go("mine") : startClaim()}>{claimed ? "My corner" : "Make this yours"}<ArrowUpRight size={16} /></button>
    </header>
    <div className={styles.editionBar}><span>A LITTLE MORE HUMAN.</span><span>Interactive mockup · fictional profiles</span><span className={styles.editionNumber}>EARLY EDITION / 001</span></div>

    <main id="studio-main" className={styles.main}>
      {notice && <div role="status" className={styles.notice}><Check size={16} /><span>{notice}</span><button aria-label="Dismiss notice" onClick={() => setNotice("")}><X size={15} /></button></div>}

      {view === "directory" && <>
        <section className={styles.hero}>
          <div className={styles.heroCopy}><p className={styles.eyebrow}><span className={styles.tinySquare} />PEOPLE, IN CONTEXT</p><h1 id="studio-view-title" tabIndex={-1}>There’s more<br />to a <em>person.</em></h1><div className={styles.heroBottom}><p>Beyond a job title. Behind a first impression.<br />A place for what makes someone, someone.</p><a href="#people" className={styles.squareArrow} aria-label="Explore fictional profiles"><ArrowDown size={21} /></a></div></div>
          <div className={styles.heroArt}><span className={styles.artCoordinate}>FIG. 01 — ROOM TO SURPRISE YOU</span><PaperBird /><div className={styles.artSticker}>SMALL CLUES.<br />BIGGER<br />PICTURES.<span>↗</span></div><span className={styles.artFootnote}>A first picture. Never the whole story.</span></div>
        </section>
        <section id="people" className={styles.directory} aria-labelledby="people-heading">
          <div className={styles.sectionHeading}><h2 id="people-heading">A few people to start with.</h2><span>03 FICTIONAL PROFILES <span className={styles.separator}>/</span> OPEN TO INTERPRETATION</span></div>
          <div className={styles.profileGrid}>{profiles.map((profile, index) => <button key={profile.id} className={styles.profileCard} onClick={() => setSelected(profile)} aria-label={`Explore ${profile.name}, ${profile.title}`}>
            <div className={styles.cardTop}><span>0{index + 1}</span><span className={styles.cardArrow}><ArrowUpRight size={21} /></span></div><ProfileArt profile={profile} />
            <div className={styles.cardBody}><p className={styles.profileMeta}>{profile.role} <span>↗</span> {profile.place}</p><h3>{profile.title}</h3><p className={styles.cardSummary}>{profile.summary}</p><div className={styles.cardFooter}><span>{profile.name}</span><span>MEET {profile.name.split(" ")[0].toUpperCase()} <ArrowRight size={14} /></span></div></div>
          </button>)}</div>
          <div className={styles.directoryFoot}><p><span>↳</span> An interpretation should come with its workings.</p><span>Open a profile to see the reasons, sources and uncertainty.</span></div>
        </section>
        <section className={styles.invitation}><span className={styles.invitationMark}>*</span><div><p className={styles.eyebrow}>YOUR LIFE IS BIGGER THAN YOUR BIO.</p><h2>Leave a little room<br />for the rest of you.</h2></div><div><p>Start with a profile. Keep a private journal.<br />Give your agent the context to understand you.</p><button className={`${styles.button} ${styles.inkButton}`} onClick={() => claimed ? go("journal") : startClaim()}>{claimed ? "Open my journal" : "Find my corner"}<ArrowUpRight size={17} /></button></div></section>
      </>}

      {view === "mine" && !claimed && <section className={styles.onboarding} aria-label="Demo profile setup">
        <div className={styles.onboardRail}><p className={styles.eyebrow}>A CORNER OF YOUR OWN</p><p className={styles.stepNumber}>0{step + 1}<span>/ 04</span></p><div className={styles.stepMarks}>{[0, 1, 2, 3].map((value) => <span key={value} className={value <= step ? styles.stepComplete : ""} />)}</div><p>One small step at a time.</p><PaperBird small /><span className={styles.tabOnly}>THIS TAB ONLY · CLEARS ON RELOAD</span></div>
        <div className={styles.onboardContent}><div className={styles.stepControls}><button onClick={() => step ? setStep(step - 1) : go("directory")} className={styles.textButton}><ArrowLeft size={15} />Back</button><span>{["YOUR NAME", "A STARTING POINT", "A FIRST PICTURE", "YOUR DEMO PROFILE"][step]}</span></div>
          {step === 0 && <form onSubmit={(event) => { event.preventDefault(); if (name.trim()) setStep(1); }}><h1 id="studio-view-title" tabIndex={-1}>What should<br />we call you?</h1><label className={styles.fieldLabel} htmlFor="studio-name">Your name</label><input autoComplete="off" id="studio-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="A name you go by" className={styles.largeInput} maxLength={80} /><div className={styles.formActions}><button type="submit" disabled={!name.trim()} className={`${styles.button} ${styles.blueButton}`}>Continue<ArrowRight size={17} /></button><button type="button" className={styles.textButton} onClick={() => { setName(chosen.name); setStep(1); }}>Use a sample name</button></div></form>}
          {step === 1 && <form onSubmit={(event) => { event.preventDefault(); setStep(2); }}><h1 id="studio-view-title" tabIndex={-1}>Where should<br />we start?</h1><p className={styles.promptHelp}>A public profile or project. Add it now, or later.</p><label className={styles.fieldLabel} htmlFor="studio-source">Public source URL <span>optional</span></label><input type="url" autoComplete="off" id="studio-source" value={source} onChange={(event) => setSource(event.target.value)} placeholder="https://…" className={styles.largeInput} /><p className={styles.smallPrint}>This mockup does not open the link or collect anything.</p><div className={styles.formActions}><button type="submit" className={`${styles.button} ${styles.blueButton}`}>Continue<ArrowRight size={17} /></button><button type="button" className={styles.textButton} onClick={() => setStep(2)}>Skip for now</button></div></form>}
          {step === 2 && <div><h1 id="studio-view-title" tabIndex={-1}>A first picture.<br /><em>Still taking shape.</em></h1><p className={styles.promptHelp}>Fictional example. No lookup was run.</p><div className={styles.samplePortrait}><span className={styles.sampleLabel}>AGENT JUDGMENT / SAMPLE</span><h2>{chosen.title}</h2><span>{ownerName} · unverified demo profile</span></div><div className={styles.formActions}><button className={`${styles.button} ${styles.blueButton}`} onClick={() => setStep(3)}>Continue<ArrowRight size={17} /></button><button className={styles.textButton} onClick={() => setChosenId(profiles[(profiles.findIndex((profile) => profile.id === chosen.id) + 1) % profiles.length].id)}>Change the sample</button></div></div>}
          {step === 3 && <div><h1 id="studio-view-title" tabIndex={-1}>Make this<br />your corner.</h1><p className={styles.promptHelp}>You bring dated journal entries and proof. Your agent does the judging.</p><div className={styles.claimSummary}><span className={styles.initialSquare}>{ownerName.charAt(0).toUpperCase()}</span><div><strong>{ownerName}</strong><p>Fictional owner preview · identity not verified</p></div><span className={styles.claimArrow}>↗</span></div><div className={styles.formActions}><button className={`${styles.button} ${styles.blueButton}`} onClick={openOwner}>Open owner preview<ArrowRight size={17} /></button><button className={styles.textButton} onClick={() => setStep(2)}>Change the starting picture</button></div></div>}

        </div>
      </section>}

      {view === "mine" && claimed && <>
        <section className={styles.ownerHero}><div><p className={styles.eyebrow}>YOUR CORNER / FICTIONAL OWNER PREVIEW</p><h1 id="studio-view-title" tabIndex={-1}>Hello,<br /><em>{ownerName.split(" ")[0]}.</em></h1><p className={styles.promptHelp}>You provide the evidence. Your agent forms the judgment.</p></div><ProfileArt profile={chosen} /><div className={styles.ownerAnnotation}><span>↙</span><p>Small actions.<br />A longer view.<br /><strong>A picture with roots.</strong></p></div></section>
        <div className={styles.ownerGrid}><section className={styles.ownerPortrait}>
          <div className={styles.sectionHeading}><h2>An evolving understanding.</h2><span>AGENT JUDGMENTS / SAMPLE</span></div>
          <div className={styles.historyControl}><span>SAMPLE HISTORY</span><div>{([ ["week", "1 week"], ["month", "1 month"], ["quarter", "3 months"] ] as [HistoryWindow, string][]).map(([value, label]) => <button key={value} className={historyWindow === value ? styles.historyActive : ""} aria-pressed={historyWindow === value} onClick={() => setHistoryWindow(value)}>{label}</button>)}</div></div>
          <p className={styles.historyDisclaimer}>Explore a fixed fictional history. Your new entries do not change these sample judgments.</p>
          <JudgmentCard profile={chosen} history={history} secondary={false} />
          <JudgmentCard profile={chosen} history={history} secondary />
          <button className={styles.textButton} onClick={() => setSelected(chosen)}>See the evidence and uncertainty<ArrowUpRight size={15} /></button>
          {entries.length > 0 && <div className={styles.pendingReview}><span>{entries.length.toString().padStart(2, "0")}</span><div><strong>Awaiting agent review</strong><p>{entries.length === 1 ? "Your dated entry is" : "Your dated entries are"} in this tab. No model has reviewed {entries.length === 1 ? "it" : "them"}.</p></div></div>}
        </section>
          <section className={styles.historyPanel}><p className={styles.eyebrow}>CONSISTENCY HAS A TIME DIMENSION</p><h2>A pattern takes<br /><em>time to see.</em></h2><div className={styles.historyStats}><div><strong>{history.activeWeeks}</strong><span>ACTIVE {history.activeWeeks === 1 ? "WEEK" : "WEEKS"}</span></div><div><strong>{history.totalWeeks}</strong><span>{history.totalWeeks === 1 ? "WEEK" : "WEEKS"} OBSERVED</span></div></div><p className={styles.historyDate}>{history.span} · fictional evidence</p><HistoryTimeline history={history} /><p className={styles.historyNote}>Several notes on one day don’t replace weeks of evidence. Gaps are unknowns, not bad marks. A counterexample can weaken a reading.</p><button className={`${styles.button} ${styles.inkButton}`} onClick={() => go("journal")}>Add a dated journal entry<ArrowRight size={16} /></button></section></div>
        <details className={styles.connectors}><summary><span><Plus size={17} />More context, when you’re ready.</span><ChevronDown size={16} /></summary><div className={styles.connectorGrid}>{["LinkedIn", "GitHub", "Calendar", "Files"].map((connector) => <button key={connector} disabled><span>{connector}</span><span>Planned</span></button>)}</div><p>No accounts are connected. These options are not available in this mockup.</p>{source && <p className={styles.sourceText}>Starting URL entered: {source} · not fetched</p>}</details>
      </>}

      {view === "journal" && <>
        <section className={styles.journalHeader}><div><p className={styles.eyebrow}><LockKeyhole size={12} />THE PRIVATE PART</p><h1 id="studio-view-title" tabIndex={-1}>Some things<br />are just <em>yours.</em></h1></div><div className={styles.journalIntro}><p>What happened. What you tried. What changed.<br />Small, dated moments give your agent something to understand.</p><p>You provide context and proof. Your agent draws its own conclusions.</p></div></section>
        <section className={styles.journalLayout} aria-label="Private journal editor"><div className={styles.journalEditor}><div className={styles.editorToolbar}><span>{(entries.length + 1).toString().padStart(2, "0")} / A DATED ENTRY</span><span><span className={styles.tinySquare} />{isDirty ? "UNSAVED DRAFT" : "A BLANK PAGE"}</span></div><label className={styles.visuallyHidden} htmlFor="studio-journal">Your private journal</label><textarea id="studio-journal" className={styles.journalTextarea} value={journal} onChange={(event) => setJournal(event.target.value)} placeholder={"What’s on your mind?\n\nStart anywhere. You can type, or paste a note here."} /><div className={styles.entryFields}><div><label htmlFor="studio-entry-date">Entry date</label><input id="studio-entry-date" type="date" value={journalDate} onChange={(event) => setJournalDate(event.target.value)} /></div><div><label htmlFor="studio-entry-proof">Proof link <span>optional · not opened</span></label><input id="studio-entry-proof" type="url" value={proof} onChange={(event) => setProof(event.target.value)} placeholder="https://…" /></div></div><div className={styles.editorBottom}><span>This tab only · clears on reload.<br />No model reads this. Nothing is sent or saved to disk.</span><button disabled={!journal.trim() || !journalDate} className={`${styles.button} ${styles.inkButton}`} onClick={saveJournal}>Add dated entry<Plus size={15} /></button></div></div><aside className={styles.journalAside}><span className={styles.asideNumber}>↗</span><h2>You live it.<br />Your agent<br /><em>learns.</em></h2><div className={styles.journalAsideBottom}><p>A consistent trail over time.<br />Independent judgments, grounded in evidence.</p><button className={styles.textButton} onClick={openOwner}>View evolving profile<ArrowRight size={17} /></button><span>Sample judgments stay separate from your new entries.</span></div></aside></section>
        {entries.length > 0 && <section className={styles.entryLedger} aria-label="Dated journal entries"><div className={styles.sectionHeading}><h2>Your dated trail.</h2><span>{entries.length.toString().padStart(2, "0")} {entries.length === 1 ? "ENTRY" : "ENTRIES"} / THIS TAB ONLY</span></div>{entries.map((entry) => <details key={entry.id}><summary><time dateTime={entry.date}>{entry.date}</time><span>Awaiting agent review</span><ChevronDown size={15} /></summary><p>{entry.text}</p>{entry.proof && <div className={styles.entryProof}>Proof link · not opened<span>{entry.proof}</span></div>}</details>)}</section>}
      </>}

    </main>

    <footer className={styles.footer}><button className={styles.footerLogo} onClick={() => go("directory")} aria-label="Back to directory">arc ↗</button><p>People are a work in progress.<br />Their profiles should be, too.</p><div><span>FICTIONAL DATA · TAB MEMORY ONLY</span><Link href="/pilot" prefetch={false}>Open the working local pilot<ExternalLink size={12} /></Link><Link href="/" prefetch={false}>Research workspace<ArrowUpRight size={12} /></Link></div></footer>
    {selected && <ProfileDrawer history={history} profile={selected} onClose={() => setSelected(null)} claimed={claimed} onClaim={() => claimed ? (setSelected(null), go("mine")) : startClaim(selected)} />}
  </div>;
}

function ProfileDrawer({ profile, history, onClose, onClaim, claimed }: { profile: Profile; history: HistoryFixture; onClose: () => void; onClaim: () => void; claimed: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [showReasons, setShowReasons] = useState(false);
  const examples = history.events.filter((event) => event.kind !== "gap").slice(0, 2).map((event, index) => ({ ...profile.reasons[index], date: event.date }));
  const uncertainty = history.totalWeeks === 1 ? "Only one dated week is available. We cannot tell whether this is a lasting pattern." : profile.uncertainty;
  useEffect(() => {
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const modal = dialog.current;
    if (modal && !modal.open) modal.showModal();
    return () => { modal?.close(); if (trigger?.isConnected) trigger.focus(); };
  }, []);
  return <dialog ref={dialog} className={`${styles.profileDrawer} ${styles.studio}`} aria-labelledby="studio-profile-title" onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className={styles.drawerContent}><header className={styles.drawerHeader}><span>PROFILE NOTES / FICTIONAL SAMPLE</span><button autoFocus onClick={onClose} aria-label="Close profile" className={styles.iconButton}><X size={20} /></button></header><div className={styles.drawerName}><div><p className={styles.eyebrow}>{profile.role} / {profile.place}</p><h2 id="studio-profile-title">{profile.name}</h2></div><ProfileArt profile={profile} compact /></div><div className={styles.drawerPortrait}><span className={styles.sampleLabel}>AGENT JUDGMENT / FICTIONAL SAMPLE</span><h3>{profile.title}</h3><p>{profile.summary}</p><div className={styles.drawerConfidence}><span className={styles.confidenceSwatch} data-stage={history.stage} /><strong>{history.stage}</strong><span>{history.activeWeeks} active {history.activeWeeks === 1 ? "week" : "weeks"} · {history.span}</span></div><div className={styles.profileTags}>{profile.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div><button className={styles.reasonToggle} aria-expanded={showReasons} aria-controls="studio-profile-reasons" onClick={() => setShowReasons((previous) => !previous)}><span>Why this picture?</span><span>{showReasons ? "LESS" : `${examples.length} SOURCE EXAMPLES`}<ChevronDown size={17} className={showReasons ? styles.rotate : ""} /></span></button>
      {showReasons && <section id="studio-profile-reasons" className={styles.reasons} aria-label="Example evidence and uncertainty"><p className={styles.smallPrint}>Illustrative records from the selected fictional history window.</p>{examples.map((reason, index) => <article key={reason.source}><div><span>0{index + 1}</span><time dateTime={reason.date}>{reason.date}</time></div><h4>{reason.source}</h4><p>{reason.observation}</p><p className={styles.reasonReading}><span>Agent reading · sample ↳</span>{reason.interpretation}</p></article>)}<div className={styles.uncertainty}><span>WHAT WE DON’T KNOW</span><p>{uncertainty}</p></div><div className={styles.confidenceLegend}>{(["Emerging", "Taking shape", "Well supported"] as ConfidenceStage[]).map((stage) => <span key={stage}><i className={styles.confidenceSwatch} data-stage={stage} />{stage}</span>)}</div><p className={styles.smallPrint}>Deeper color means a better-supported reading, not a better person. Contradictory evidence can soften it. All history and sources are fictional; no model review was run.</p></section>}
      <section className={styles.drawerClaim}><span>↗</span><h3>A picture grows<br />from what you do.</h3><p>You contribute dated journal entries and proof. Your agent forms and revises its own judgments.</p><button className={`${styles.button} ${styles.inkButton}`} onClick={onClaim}>{claimed ? "Open my owner view" : "Open this sample"}<ArrowUpRight size={16} /></button></section></div>
  </dialog>;
}
