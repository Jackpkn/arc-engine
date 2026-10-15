"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, ExternalLink, LockKeyhole, Plus, X } from "lucide-react";
import styles from "./arc-studio.module.css";

type View = "directory" | "mine" | "journal" | "review";
type Permission = "understand" | "peers" | "publish";
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
  const [claimChecked, setClaimChecked] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [journal, setJournal] = useState("");
  const [savedJournal, setSavedJournal] = useState("");
  const [correction, setCorrection] = useState("");
  const [savedCorrection, setSavedCorrection] = useState("");
  const [correctionKind, setCorrectionKind] = useState("Add context");
  const [correctionChecked, setCorrectionChecked] = useState(false);
  const [permission, setPermission] = useState<Permission>("publish");
  const [permissionPreview, setPermissionPreview] = useState(false);
  const [permissionChecked, setPermissionChecked] = useState(false);
  const [statement, setStatement] = useState("");
  const [releasedStatement, setReleasedStatement] = useState("");
  const [notice, setNotice] = useState("");
  const chosen = profiles.find((profile) => profile.id === chosenId) ?? profiles[0];
  const ownerName = name.trim() || chosen.name;
  const peers = profiles.filter((profile) => profile.id !== chosen.id).map((profile) => profile.name.split(" ")[0]);
  const isDirty = journal !== savedJournal || correction !== savedCorrection;

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

  const go = (next: View) => { setView(next); setNotice(""); setPermissionPreview(false); setPermissionChecked(false); };
  const startClaim = (profile = chosen) => {
    setSelected(null); setChosenId(profile.id); setStep(0); setClaimChecked(false); go("mine");
  };
  const saveJournal = () => {
    setSavedJournal(journal); setReleasedStatement(""); setPermissionChecked(false);
    setNotice("Kept in this tab. Still private. Any previous sharing preview has been cleared.");
  };
  const editJournal = (value: string) => {
    setJournal(value); setReleasedStatement(""); setPermissionPreview(false); setPermissionChecked(false);
  };
  const choosePermission = (next: Permission) => { setPermission(next); setPermissionPreview(false); setPermissionChecked(false); setNotice(""); };
  const applyPreview = () => {
    if (!permissionChecked) return;
    if (permission === "publish") {
      if (!statement.trim()) return;
      setReleasedStatement(statement.trim());
    }
    setNotice("Simulated — nothing was sent or published."); setPermissionChecked(false); setPermissionPreview(false);
  };

  return <div className={styles.studio}>
    <a href="#studio-main" className={styles.skipLink}>Skip to content</a>
    <header className={styles.header}>
      <button className={styles.wordmark} aria-label="ARC directory" onClick={() => go("directory")}>arc<span className={styles.wordmarkStar}>✳</span></button>
      <nav className={styles.nav} aria-label="Studio navigation">
        {([ ["directory", "Discover"], ["mine", "My profile"], ["journal", "Journal"] ] as [View, string][]).map(([id, label]) => <button key={id} className={view === id || (view === "review" && id === "journal") ? styles.activeNav : ""} aria-current={view === id ? "page" : undefined} onClick={() => go(id)}>{label}</button>)}
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
        <section className={styles.invitation}><span className={styles.invitationMark}>*</span><div><p className={styles.eyebrow}>YOUR LIFE IS BIGGER THAN YOUR BIO.</p><h2>Leave a little room<br />for the rest of you.</h2></div><div><p>Start with a profile. Keep a private journal.<br />Choose what becomes part of the picture.</p><button className={`${styles.button} ${styles.inkButton}`} onClick={() => claimed ? go("journal") : startClaim()}>{claimed ? "Open my journal" : "Find my corner"}<ArrowUpRight size={17} /></button></div></section>
      </>}

      {view === "mine" && !claimed && <section className={styles.onboarding} aria-label="Demo profile setup">
        <div className={styles.onboardRail}><p className={styles.eyebrow}>A CORNER OF YOUR OWN</p><p className={styles.stepNumber}>0{step + 1}<span>/ 04</span></p><div className={styles.stepMarks}>{[0, 1, 2, 3].map((value) => <span key={value} className={value <= step ? styles.stepComplete : ""} />)}</div><p>One small step at a time.</p><PaperBird small /><span className={styles.tabOnly}>THIS TAB ONLY · CLEARS ON RELOAD</span></div>
        <div className={styles.onboardContent}><div className={styles.stepControls}><button onClick={() => step ? setStep(step - 1) : go("directory")} className={styles.textButton}><ArrowLeft size={15} />Back</button><span>{["YOUR NAME", "A STARTING POINT", "A FIRST PICTURE", "YOUR DEMO PROFILE"][step]}</span></div>
          {step === 0 && <form onSubmit={(event) => { event.preventDefault(); if (name.trim()) setStep(1); }}><h1 id="studio-view-title" tabIndex={-1}>What should<br />we call you?</h1><label className={styles.fieldLabel} htmlFor="studio-name">Your name</label><input autoComplete="off" id="studio-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="A name you go by" className={styles.largeInput} maxLength={80} /><div className={styles.formActions}><button type="submit" disabled={!name.trim()} className={`${styles.button} ${styles.blueButton}`}>Continue<ArrowRight size={17} /></button><button type="button" className={styles.textButton} onClick={() => { setName(chosen.name); setStep(1); }}>Use a sample name</button></div></form>}
          {step === 1 && <form onSubmit={(event) => { event.preventDefault(); setStep(2); }}><h1 id="studio-view-title" tabIndex={-1}>Where should<br />we start?</h1><p className={styles.promptHelp}>A public profile or project. Add it now, or later.</p><label className={styles.fieldLabel} htmlFor="studio-source">Public source URL <span>optional</span></label><input type="url" autoComplete="off" id="studio-source" value={source} onChange={(event) => setSource(event.target.value)} placeholder="https://…" className={styles.largeInput} /><p className={styles.smallPrint}>This mockup does not open the link or collect anything.</p><div className={styles.formActions}><button type="submit" className={`${styles.button} ${styles.blueButton}`}>Continue<ArrowRight size={17} /></button><button type="button" className={styles.textButton} onClick={() => setStep(2)}>Skip for now</button></div></form>}
          {step === 2 && <div><h1 id="studio-view-title" tabIndex={-1}>A first picture.<br /><em>Yours to question.</em></h1><p className={styles.promptHelp}>Fictional example. No lookup was run.</p><div className={styles.samplePortrait}><span className={styles.sampleLabel}>SAMPLE PORTRAIT</span><h2>{chosen.title}</h2><span>{ownerName} · unverified demo profile</span></div><div className={styles.formActions}><button className={`${styles.button} ${styles.blueButton}`} onClick={() => setStep(3)}>Continue<ArrowRight size={17} /></button><button className={styles.textButton} onClick={() => setChosenId(profiles[(profiles.findIndex((profile) => profile.id === chosen.id) + 1) % profiles.length].id)}>Change the sample</button></div></div>}
          {step === 3 && <div><h1 id="studio-view-title" tabIndex={-1}>Make this<br />your corner.</h1><p className={styles.promptHelp}>Your journal. Your context. Your reply.</p><div className={styles.claimSummary}><span className={styles.initialSquare}>{ownerName.charAt(0).toUpperCase()}</span><div><strong>{ownerName}</strong><p>Demo claim · identity not verified</p></div><span className={styles.claimArrow}>↗</span></div><label className={styles.checkboxLabel}><input type="checkbox" checked={claimChecked} onChange={(event) => setClaimChecked(event.target.checked)} /><span>Open this sample only. No identity is verified.</span></label><div className={styles.formActions}><button disabled={!claimChecked} className={`${styles.button} ${styles.blueButton}`} onClick={() => { setClaimed(true); go("journal"); setNotice("Demo profile claimed. This is not identity verification."); }}>Claim demo profile<ArrowRight size={17} /></button><button className={styles.textButton} onClick={() => setStep(2)}>Change the starting picture</button></div></div>}
        </div>
      </section>}

      {view === "mine" && claimed && <>
        <section className={styles.ownerHero}><div><p className={styles.eyebrow}>YOUR CORNER / UNVERIFIED DEMO CLAIM</p><h1 id="studio-view-title" tabIndex={-1}>Hello,<br /><em>{ownerName.split(" ")[0]}.</em></h1><p className={styles.promptHelp}>You get a say in the picture people see.</p></div><ProfileArt profile={chosen} /><div className={styles.ownerAnnotation}><span>↙</span><p>There should always<br />be room to say:<br /><strong>“That’s not quite me.”</strong></p></div></section>
        <div className={styles.ownerGrid}><section className={styles.ownerPortrait}><div className={styles.sectionHeading}><h2>Your profile, in this preview.</h2><span>NOT PUBLISHED</span></div><span className={styles.sampleLabel}>EDITORIAL SAMPLE</span><h2 className={styles.portraitTitle}>{chosen.title}</h2><p>{chosen.summary}</p><button className={styles.textButton} onClick={() => setSelected(chosen)}>See the thinking behind it<ArrowUpRight size={15} /></button>{savedCorrection && <div className={styles.correctionOutput}><span className={styles.sampleLabel}>OWNER CORRECTION · YOUR EXACT WORDS</span><p>{savedCorrection}</p></div>}{releasedStatement && <div className={styles.releaseOutput}><span className={styles.sampleLabel}>OWNER-APPROVED STATEMENT · PREVIEW ONLY</span><p>{releasedStatement}</p></div>}</section>
          <section className={styles.correctionPanel}><p className={styles.eyebrow}>A PROFILE IS A CONVERSATION</p><h2>What’s missing<br />from this picture?</h2><div className={styles.segmented} aria-label="Correction type">{["Add context", "Challenge a reading"].map((kind) => <button key={kind} className={correctionKind === kind ? styles.segmentActive : ""} aria-pressed={correctionKind === kind} onClick={() => setCorrectionKind(kind)}>{kind}</button>)}</div><label className={styles.fieldLabel} htmlFor="studio-correction">{correctionKind === "Add context" ? "Context you would like to add" : "What would you like to challenge?"}</label><textarea id="studio-correction" value={correction} onChange={(event) => { setCorrection(event.target.value); setCorrectionChecked(false); }} rows={5} placeholder="In your own words…" className={styles.textarea} /><p className={styles.smallPrint}>This tab only · clears on reload. Your words are labelled Owner correction; no AI judgment is generated.</p><label className={styles.checkboxLabel}><input type="checkbox" checked={correctionChecked} onChange={(event) => setCorrectionChecked(event.target.checked)} /><span>Use these exact words as an owner correction in this preview.</span></label><button disabled={!correction.trim() || !correctionChecked} className={`${styles.button} ${styles.inkButton}`} onClick={() => { setSavedCorrection(correction); setCorrectionChecked(false); setNotice("Owner correction applied in this preview. Nothing was published."); }}>Apply owner correction<ArrowRight size={16} /></button></section></div>
        <details className={styles.connectors}><summary><span><Plus size={17} />More context, when you’re ready.</span><ChevronDown size={16} /></summary><div className={styles.connectorGrid}>{["LinkedIn", "GitHub", "Calendar", "Files"].map((connector) => <button key={connector} disabled><span>{connector}</span><span>Planned</span></button>)}</div><p>No accounts are connected. These options are not available in this mockup.</p>{source && <p className={styles.sourceText}>Starting URL entered: {source} · not fetched</p>}</details>
      </>}

      {view === "journal" && <>
        <section className={styles.journalHeader}><div><p className={styles.eyebrow}><LockKeyhole size={12} />THE PRIVATE PART</p><h1 id="studio-view-title" tabIndex={-1}>Some things<br />are just <em>yours.</em></h1></div><div className={styles.journalIntro}><p>Half-formed ideas. Things you’re working through.<br />The parts that don’t fit in a public profile.</p><p>Write freely. Decide what to share separately.</p></div></section>
        <section className={styles.journalLayout} aria-label="Private journal editor"><div className={styles.journalEditor}><div className={styles.editorToolbar}><span>01 / A PRIVATE NOTE</span><span><span className={styles.tinySquare} />{journal !== savedJournal ? "UNSAVED DRAFT" : savedJournal ? "KEPT IN THIS TAB" : "A BLANK PAGE"}</span></div><label className={styles.visuallyHidden} htmlFor="studio-journal">Your private journal</label><textarea id="studio-journal" className={styles.journalTextarea} value={journal} onChange={(event) => editJournal(event.target.value)} placeholder={"What’s on your mind?\n\nStart anywhere. You can type, or paste a note here."} /><div className={styles.editorBottom}><span>This tab only · clears on reload.<br />No model reads this. Nothing is sent or saved to disk.</span><button disabled={journal === savedJournal} className={`${styles.button} ${styles.inkButton}`} onClick={saveJournal}>Keep in this tab<Check size={15} /></button></div></div><aside className={styles.journalAside}><span className={styles.asideNumber}>↗</span><h2>Your journal<br />isn’t your<br /><em>profile.</em></h2><div className={styles.journalAsideBottom}><p>A note stays private.<br />A sharing preview is a separate choice.</p><button className={styles.textButton} disabled={!savedJournal.trim()} onClick={() => go("review")}>Review what can leave<ArrowRight size={17} /></button>{!savedJournal.trim() && <span>Keep a note to explore the next step.</span>}</div></aside></section>
      </>}

      {view === "review" && <>
        <div className={styles.reviewBack}><button className={styles.textButton} onClick={() => go("journal")}><ArrowLeft size={15} />Back to my journal</button><span>PERMISSION PREVIEW / NOTHING LEAVES THIS TAB</span></div>
        <section className={styles.reviewHeader}><p className={styles.eyebrow}>A DELIBERATE NEXT STEP</p><h1 id="studio-view-title" tabIndex={-1}>You choose<br />what <em>travels.</em></h1><p>Understanding, confidential peer context and public statements are three different permissions.</p></section>
        <div className={styles.reviewGrid}><aside className={styles.permissionNav} aria-label="Permission preview type">{([ ["understand", "01", "Understand privately", "Your private view only"], ["peers", "02", "Consider an introduction", `${peers.join(" + ")} · confidential`], ["publish", "03", "A public statement", "Your exact approved words"] ] as [Permission, string, string, string][]).map(([id, number, title, detail]) => <button key={id} onClick={() => choosePermission(id)} className={permission === id ? styles.permissionActive : ""} aria-pressed={permission === id}><span>{number}</span><div><strong>{title}</strong><small>{detail}</small></div><ArrowUpRight size={17} /></button>)}<div className={styles.permissionFoot}><LockKeyhole size={20} /><p>These are interactive previews.<br />No model, peer or public profile receives your note.</p></div></aside>
          <section className={styles.permissionPanel} aria-label="Review selected permission"><span className={styles.sampleLabel}>PREVIEW ONLY</span><h2>{permission === "understand" ? "A little more understanding." : permission === "peers" ? "Context for one introduction." : "A statement you stand behind."}</h2>
            {permission === "publish" ? <><label className={styles.fieldLabel} htmlFor="studio-statement">What would you be comfortable saying publicly?</label><textarea id="studio-statement" className={styles.textarea} rows={4} value={statement} onChange={(event) => { setStatement(event.target.value); setPermissionChecked(false); setPermissionPreview(false); }} placeholder="Write the exact statement yourself. Your note is never copied here automatically." /><p className={styles.smallPrint}>This is your statement, not a generated interpretation.</p></> : <details className={styles.selectedEntry}><summary><span><LockKeyhole size={14} />Selected private entry · 01</span><ChevronDown size={15} /></summary><p>{savedJournal || "No saved note in this tab."}</p></details>}
            {permission === "peers" && <dl className={styles.scopeGrid}><div><dt>WHO</dt><dd>{peers.join(" and ")}’s representatives</dd></div><div><dt>WHY</dt><dd>One professional introduction</dd></div><div><dt>HOW LONG</dt><dd>24-hour preview window</dd></div></dl>}
            {!permissionPreview ? <button disabled={permission === "publish" ? !statement.trim() : !savedJournal.trim()} className={`${styles.button} ${styles.blueButton}`} onClick={() => { setPermissionPreview(true); setPermissionChecked(false); }}>Preview permission<ArrowRight size={17} /></button> : <div className={styles.permissionConfirmation}>
              <h3>{permission === "understand" ? "Use this selected entry to improve my private understanding" : permission === "peers" ? `For this introduction, let ${peers.join("’s and ")}’s representatives consider this full entry` : "Publish this exact statement to my public profile"}</h3>
              {permission === "publish" && <blockquote>{statement.trim()}</blockquote>}
              <p>{permission === "understand" ? "Only your private view would change. Nothing would be published or sent to peers." : permission === "peers" ? "They could use the confidential context to judge fit. Human-visible results would remain limited to a separately approved release preview." : "In a working product, this statement would become visible to anyone viewing the profile."}</p>
              <label className={styles.checkboxLabel}><input type="checkbox" checked={permissionChecked} onChange={(event) => setPermissionChecked(event.target.checked)} /><span>I approve {permission === "publish" ? "this exact text" : "the scope shown above"} for this preview.</span></label><div className={styles.formActions}><button disabled={!permissionChecked} className={`${styles.button} ${styles.inkButton}`} onClick={applyPreview}>Apply in this preview<Check size={16} /></button><button className={styles.textButton} onClick={() => { setPermissionPreview(false); setPermissionChecked(false); }}>Change</button></div>
            </div>}
          </section></div>
      </>}
    </main>

    <footer className={styles.footer}><button className={styles.footerLogo} onClick={() => go("directory")} aria-label="Back to directory">arc ↗</button><p>People are a work in progress.<br />Their profiles should be, too.</p><div><span>FICTIONAL DATA · TAB MEMORY ONLY</span><Link href="/pilot" prefetch={false}>Open the working local pilot<ExternalLink size={12} /></Link><Link href="/" prefetch={false}>Research workspace<ArrowUpRight size={12} /></Link></div></footer>
    {selected && <ProfileDrawer profile={selected} onClose={() => setSelected(null)} claimed={claimed} onClaim={() => claimed ? (setSelected(null), go("mine")) : startClaim(selected)} />}
  </div>;
}

function ProfileDrawer({ profile, onClose, onClaim, claimed }: { profile: Profile; onClose: () => void; onClaim: () => void; claimed: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [showReasons, setShowReasons] = useState(false);
  useEffect(() => {
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const modal = dialog.current;
    if (modal && !modal.open) modal.showModal();
    return () => { modal?.close(); if (trigger?.isConnected) trigger.focus(); };
  }, []);
  return <dialog ref={dialog} className={`${styles.profileDrawer} ${styles.studio}`} aria-labelledby="studio-profile-title" onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className={styles.drawerContent}><header className={styles.drawerHeader}><span>PROFILE NOTES / FICTIONAL SAMPLE</span><button autoFocus onClick={onClose} aria-label="Close profile" className={styles.iconButton}><X size={20} /></button></header><div className={styles.drawerName}><div><p className={styles.eyebrow}>{profile.role} / {profile.place}</p><h2 id="studio-profile-title">{profile.name}</h2></div><ProfileArt profile={profile} compact /></div><div className={styles.drawerPortrait}><span className={styles.sampleLabel}>AN EDITORIAL INTERPRETATION</span><h3>{profile.title}</h3><p>{profile.summary}</p><div className={styles.profileTags}>{profile.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div><button className={styles.reasonToggle} aria-expanded={showReasons} aria-controls="studio-profile-reasons" onClick={() => setShowReasons((previous) => !previous)}><span>Why this picture?</span><span>{showReasons ? "LESS" : `${profile.reasons.length} SAMPLE SOURCES`}<ChevronDown size={17} className={showReasons ? styles.rotate : ""} /></span></button>
      {showReasons && <section id="studio-profile-reasons" className={styles.reasons} aria-label="Example evidence and uncertainty">{profile.reasons.map((reason, index) => <article key={reason.source}><div><span>0{index + 1}</span><time>{reason.date}</time></div><h4>{reason.source}</h4><p>{reason.observation}</p><p className={styles.reasonReading}><span>Our reading ↳</span>{reason.interpretation}</p></article>)}<div className={styles.uncertainty}><span>WHAT WE DON’T KNOW</span><p>{profile.uncertainty}</p></div><p className={styles.smallPrint}>All sources and observations here are invented examples. No profile was scraped and no AI assessment was run.</p></section>}
      <section className={styles.drawerClaim}><span>↗</span><h3>A picture should<br />have room for a reply.</h3><p>Owners can add context or challenge an interpretation. A demo claim is not identity verification.</p><button className={`${styles.button} ${styles.inkButton}`} onClick={onClaim}>{claimed ? "Open my owner view" : "Try claiming this sample"}<ArrowUpRight size={16} /></button></section></div>
  </dialog>;
}
