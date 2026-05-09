import { memo, useCallback, useMemo, useState } from "react";
import { asNonEmptyString, asStringList, formatAuthors, isRecord } from "../lib/analysis-utils";

const TABS = [
  { id: "summary", label: "Start" },
  { id: "narrative", label: "Story" },
  { id: "script", label: "Speak" },
  { id: "terms", label: "Key Terms" },
  { id: "methods", label: "Method" },
  { id: "results", label: "Results" },
  { id: "critique", label: "Critique" },
  { id: "slides", label: "Slides 15" },
  { id: "quick", label: "Slides 5" },
  { id: "qa", label: "Viva" },
  { id: "cheat", label: "Cheat" },
  { id: "reference", label: "References" },
];

const MODE_GROUPS = [
  { id: "understand", label: "Understand", tabIds: ["summary", "narrative", "terms", "methods", "results", "critique"] },
  { id: "present", label: "Present", tabIds: ["script", "slides", "quick"] },
  { id: "revise", label: "Revise", tabIds: ["qa", "cheat", "reference"] },
];

const MODE_SUBTITLE = {
  understand: "Concepts, story, methods",
  present: "Script and slide flow",
  revise: "Viva, cheat sheet, references",
};

const CORE_LABELS = {
  problem: "Problem",
  solution: "Solution",
  keyResult: "Key result",
  soWhat: "So what",
};

function difficultyTone(diff) {
  const d = String(diff || "").toLowerCase();
  if (d === "easy") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (d === "hard") return "border-rose-200 bg-rose-50 text-rose-700";
  return "border-amber-200 bg-amber-50 text-amber-700";
}

const Prose = memo(function Prose({ children, className = "" }) {
  return <p className={`text-sm leading-relaxed text-slate-600 ${className}`}>{children}</p>;
});

const SectionTitle = memo(function SectionTitle({ children }) {
  return <h3 className="text-sm font-semibold text-slate-900">{children}</h3>;
});

const SlideRow = memo(function SlideRow({ slide }) {
  const [open, setOpen] = useState(false);
  const title = asNonEmptyString(slide?.title) || `Slide ${slide?.slideNumber ?? ""}`;
  const bullets = Array.isArray(slide?.bullets) ? slide.bullets.filter((b) => typeof b === "string" && b.trim()) : [];
  const note = asNonEmptyString(slide?.speakerNote);
  const num = slide?.slideNumber ?? "—";

  return (
    <div
      className={`overflow-hidden rounded-xl border transition-colors ${
        open
          ? "border-blue-200 bg-blue-50/60 shadow-sm"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <button
        type="button"
        className="flex w-full items-start gap-3 px-3 py-3 text-left md:px-4"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-xs font-black text-blue-700">
          {num}
        </span>
        <span className="min-w-0 flex-1 pt-0.5 text-sm font-semibold leading-snug text-slate-900">{title}</span>
        <span className="shrink-0 pt-1 text-slate-400">{open ? "−" : "+"}</span>
      </button>
      {open ? (
        <div className="border-t border-slate-200 px-3 pb-4 pt-1 md:px-4 md:pl-[4.25rem]">
          {bullets.length ? (
            <ul className="space-y-2 text-sm text-slate-600">
              {bullets.map((b, bi) => (
                <li key={bi} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-blue-500" aria-hidden />
                  <span className="leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {note ? (
            <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-[10px] font-semibold text-slate-500">Speaker note</p>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{note}</p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
});

const QaRow = memo(function QaRow({ item }) {
  const [open, setOpen] = useState(false);
  const q = asNonEmptyString(item?.question);
  const a = asNonEmptyString(item?.answer);
  const diff = asNonEmptyString(item?.difficulty) || "medium";
  if (!q) return null;
  const chip = difficultyTone(diff);
  const diffLabel = diff.charAt(0).toUpperCase() + diff.slice(1).toLowerCase();

  return (
    <div
      className={`rounded-xl border transition-all ${
        open ? "border-blue-200 bg-blue-50/50" : "border-slate-200 bg-white"
      }`}
    >
      <button type="button" className="flex w-full items-start gap-3 px-3 py-3 text-left md:px-4" onClick={() => setOpen((v) => !v)}>
        <span className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${chip}`}>{diffLabel}</span>
        <span className="min-w-0 flex-1 text-sm font-semibold leading-snug text-slate-900">{q}</span>
        <span className="shrink-0 text-slate-400">{open ? "−" : "+"}</span>
      </button>
      {open && a ? (
        <div className="border-t border-slate-200 px-3 pb-4 pt-2 md:px-4">
          <Prose className="text-[13px] leading-relaxed">{a}</Prose>
          {asNonEmptyString(item?.whyTheyAskThis) ? (
            <p className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
              <span className="font-semibold text-slate-700">Why they ask:</span> {item.whyTheyAskThis}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
});

function TabSummary({ analysis, omitPaperHeader }) {
  const authors = formatAuthors(analysis?.authors);
  if (omitPaperHeader) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <SectionTitle>Quick understanding</SectionTitle>
          <Prose className="mt-3 text-[15px] leading-relaxed text-slate-700">{asNonEmptyString(analysis?.overview) || "—"}</Prose>
        </div>
        {isRecord(analysis?.coreStory) && asNonEmptyString(analysis.coreStory.keyResult) ? (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-[10px] font-semibold text-blue-700">Anchor line</p>
            <p className="mt-2 text-sm font-medium leading-relaxed text-slate-800">{analysis.coreStory.keyResult}</p>
          </div>
        ) : null}
        <div>
          <SectionTitle>What problem this document is solving</SectionTitle>
          <Prose className="mt-2">{asNonEmptyString(analysis?.problemStatement) || "—"}</Prose>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>Document details</SectionTitle>
        <p className="mt-3 text-xl font-bold leading-snug tracking-tight text-slate-900 md:text-2xl">
          {asNonEmptyString(analysis?.paperTitle) || "Untitled paper"}
        </p>
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-500">
          {authors ? <span>{authors}</span> : null}
          {analysis?.year ? <span className="tabular-nums">{analysis.year}</span> : null}
          {asNonEmptyString(analysis?.venue) ? <span>{analysis.venue}</span> : null}
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <SectionTitle>Simple summary</SectionTitle>
        <Prose className="mt-3 text-[15px]">{asNonEmptyString(analysis?.overview) || "—"}</Prose>
      </div>
    </div>
  );
}

function TabNarrative({ analysis }) {
  const cs = isRecord(analysis?.coreStory) ? analysis.coreStory : null;
  return (
    <div className="space-y-8">
      <div>
        <SectionTitle>Core story to remember</SectionTitle>
        <p className="mt-1 text-xs text-slate-500">Use these four points when presenting under time pressure.</p>
        {cs ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(["problem", "solution", "keyResult", "soWhat"]).map((key) => (
              <div
                key={key}
                className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300"
              >
                <p className="text-[10px] font-semibold text-blue-700">{CORE_LABELS[key] || key}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{asNonEmptyString(cs[key]) || "—"}</p>
              </div>
            ))}
          </div>
        ) : (
          <Prose className="mt-3">No core story block.</Prose>
        )}
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <SectionTitle>Why this matters</SectionTitle>
        <Prose className="mt-3">{asNonEmptyString(analysis?.problemStatement) || "—"}</Prose>
      </div>
    </div>
  );
}

function TabTerms({ analysis }) {
  const terms = Array.isArray(analysis?.keyTerms) ? analysis.keyTerms : [];
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {terms.length === 0 ? (
        <li className="col-span-full">
          <Prose>No key terms returned.</Prose>
        </li>
      ) : null}
      {terms.map((t, i) => (
        <li
          key={`${asNonEmptyString(t?.term) || i}`}
          className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300"
        >
          <p className="text-sm font-bold text-slate-900">{asNonEmptyString(t?.term) || "Term"}</p>
          <Prose className="mt-2 flex-1">{asNonEmptyString(t?.definition) || "—"}</Prose>
          {asNonEmptyString(t?.analogy) ? (
            <p className="mt-3 border-t border-slate-200 pt-3 text-xs italic leading-relaxed text-slate-500">
              {t.analogy}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function TabMethods({ analysis }) {
  const m = isRecord(analysis?.methodology) ? analysis.methodology : null;
  if (!m) return <Prose>No methodology block.</Prose>;
  const tools = asStringList(m.tools);
  const datasets = asStringList(m.datasets);
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <SectionTitle>Method in plain words</SectionTitle>
        <Prose className="mt-3">{asNonEmptyString(m.summary) || "—"}</Prose>
      </div>
      <div>
        <SectionTitle>Step-by-step flow</SectionTitle>
        <ol className="mt-3 space-y-3">
          {asStringList(m.steps).map((s, i) => (
            <li key={s.slice(0, 64)} className="flex gap-3 text-sm text-slate-600">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-xs font-black text-blue-700">
                {i + 1}
              </span>
              <span className="pt-0.5 leading-relaxed">{s}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <SectionTitle>Tools used</SectionTitle>
          {tools.length ? (
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {tools.map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-blue-500" />
                  {t}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-xs italic text-slate-500">No tools listed for this document.</p>
          )}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <SectionTitle>Data used</SectionTitle>
          {datasets.length ? (
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {datasets.map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-indigo-500" />
                  {t}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-xs italic text-slate-500">No datasets listed for this document.</p>
          )}
        </div>
      </div>
      <div>
        <SectionTitle>Why this approach was chosen</SectionTitle>
        <Prose className="mt-2">{asNonEmptyString(m.whyThisApproach) || "—"}</Prose>
      </div>
    </div>
  );
}

function TabResults({ analysis }) {
  const r = isRecord(analysis?.results) ? analysis.results : null;
  if (!r) return <Prose>No results block.</Prose>;
  const findings = Array.isArray(r.keyFindings) ? r.keyFindings.filter((x) => typeof x === "string" && x.trim()) : [];
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <SectionTitle>Results in simple words</SectionTitle>
        <Prose className="mt-3">{asNonEmptyString(r.summary) || "—"}</Prose>
      </div>
      <div>
        <SectionTitle>Key findings you should quote</SectionTitle>
        <ul className="mt-3 space-y-2">
          {findings.map((f, fi) => (
            <li key={fi} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-relaxed text-slate-600">
              {f}
            </li>
          ))}
        </ul>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <SectionTitle>Compared to earlier work</SectionTitle>
          <Prose className="mt-2">{asNonEmptyString(r.comparisonToPriorWork) || "—"}</Prose>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <SectionTitle>What the numbers actually mean</SectionTitle>
          <Prose className="mt-2">{asNonEmptyString(r.whatTheNumbersMean) || "—"}</Prose>
        </div>
      </div>
    </div>
  );
}

function TabCritique({ analysis }) {
  const c = isRecord(analysis?.criticalAnalysis) ? analysis.criticalAnalysis : null;
  if (!c) return <Prose>No critical analysis block.</Prose>;
  const list = (label, items, tone) => (
    <div className={`rounded-xl border p-4 ${tone}`}>
      <SectionTitle>{label}</SectionTitle>
      <ul className="mt-3 space-y-2 text-sm text-slate-600">
        {asStringList(items).map((x, xi) => (
          <li key={`${label}-${xi}`} className="flex gap-2 leading-relaxed">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-current opacity-50" />
            {x}
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {list("What this does well", c.strengths, "border-emerald-200 bg-emerald-50")}
        {list("What to be careful about", c.weaknesses, "border-amber-200 bg-amber-50")}
      </div>
      {list("Questions your professor may ask", c.openQuestions, "border-slate-200 bg-white")}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <SectionTitle>What could be improved next</SectionTitle>
        <Prose className="mt-2">{asNonEmptyString(c.futureWork) || "—"}</Prose>
      </div>
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <SectionTitle>If you were the author</SectionTitle>
        <Prose className="mt-2">{asNonEmptyString(c.whatYouWouldChange) || "—"}</Prose>
      </div>
    </div>
  );
}

function TabSlides({ slides }) {
  const list = Array.isArray(slides) ? slides : [];
  if (!list.length) return <Prose>No slide outline in this workspace.</Prose>;
  return <div className="space-y-2">{list.map((s, si) => (
    <SlideRow key={`${s?.slideNumber ?? si}-${si}`} slide={s} />
  ))}</div>;
}

function TabQa({ items }) {
  const list = Array.isArray(items) ? items : [];
  if (!list.length) return <Prose>No Q&A prep items.</Prose>;
  return <div className="space-y-2">{list.map((item, index) => (
    <QaRow key={String(index)} item={item} />
  ))}</div>;
}

function TabCheat({ analysis }) {
  const ch = isRecord(analysis?.cheatSheet) ? analysis.cheatSheet : null;
  if (!ch) return <Prose>No cheat sheet block.</Prose>;
  const lines = Array.isArray(ch.methodologyInThreeLines) ? ch.methodologyInThreeLines : [];
  const nums = Array.isArray(ch.keyNumbers) ? ch.keyNumbers : [];
  const fallbacks = Array.isArray(ch.fallbackAnswers) ? ch.fallbackAnswers : [];
  const dns = Array.isArray(ch.doNotSay) ? ch.doNotSay : [];
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <SectionTitle>Must-remember numbers</SectionTitle>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {nums.map((n) => (
            <li key={String(n)} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              {String(n)}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <SectionTitle>Method in 3 lines</SectionTitle>
        <ol className="mt-3 space-y-2">
          {lines.map((l, i) => (
            <li key={String(l)} className="flex gap-3 text-sm text-slate-600">
              <span className="font-black text-blue-700">{i + 1}.</span>
              <span className="leading-relaxed">{String(l)}</span>
            </li>
          ))}
        </ol>
      </div>
      <div>
        <SectionTitle>Ready-to-speak talking points</SectionTitle>
        <ul className="mt-3 space-y-2">
          {asStringList(ch.talkingPoints).map((t) => (
            <li key={t.slice(0, 64)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
              {t}
            </li>
          ))}
        </ul>
      </div>
      {fallbacks.length ? (
        <div>
          <SectionTitle>Backup answers (when stuck)</SectionTitle>
          <ul className="mt-3 space-y-3">
            {fallbacks.map((fb, i) => (
              <li key={i} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-[10px] font-semibold text-slate-500">If they ask</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{asNonEmptyString(fb?.trigger) || "—"}</p>
                {asNonEmptyString(fb?.say) ? <Prose className="mt-2">{fb.say}</Prose> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {dns.length ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
          <SectionTitle>Avoid saying these</SectionTitle>
          <ul className="mt-3 space-y-1.5 text-sm text-rose-700">
            {dns.map((line, i) => (
              <li key={i} className="flex gap-2">
                <span aria-hidden>✕</span>
                {String(line)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function TabReference({ analysis }) {
  const tr = isRecord(analysis?.technicalReference) ? analysis.technicalReference : null;
  const fr = Array.isArray(analysis?.furtherReading) ? analysis.furtherReading : [];
  const lit = Array.isArray(analysis?.literatureConnections) ? analysis.literatureConnections : [];
  const flashcards = Array.isArray(analysis?.flashcards) ? analysis.flashcards : [];
  const tech = tr && Array.isArray(tr.algorithmsOrTechniques) ? tr.algorithmsOrTechniques : [];
  if (!tech.length && !lit.length && !fr.length && !flashcards.length) {
    return <Prose>No reference entries for this document.</Prose>;
  }
  return (
    <div className="space-y-8">
      {tech.length ? (
        <div>
          <SectionTitle>Methods / techniques mentioned</SectionTitle>
          <ul className="mt-3 space-y-2">
            {tech.map((a, i) => (
              <li key={i} className="rounded-xl border border-slate-200 bg-white p-4">
                <span className="font-semibold text-slate-900">{asNonEmptyString(a?.name) || "—"}</span>
                {asNonEmptyString(a?.oneLiner) ? <Prose className="mt-2">{a.oneLiner}</Prose> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {lit.length ? (
        <div>
          <SectionTitle>Related readings</SectionTitle>
          <ul className="mt-3 space-y-3">
            {lit.map((x, i) => (
              <li key={i} className="rounded-xl border border-slate-200 bg-white p-4">
                <span className="font-semibold text-slate-900">{asNonEmptyString(x?.title) || "—"}</span>
                {asNonEmptyString(x?.relation) ? <Prose className="mt-2">{x.relation}</Prose> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {fr.length ? (
        <div>
          <SectionTitle>If you want to go deeper</SectionTitle>
          <ul className="mt-3 space-y-3">
            {fr.map((x, i) => (
              <li key={i} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-900">{asNonEmptyString(x?.trigger) || "Topic"}</p>
                {asNonEmptyString(x?.whatToSay) ? <Prose className="mt-2">{x.whatToSay}</Prose> : null}
                {asNonEmptyString(x?.searchQuery) ? (
                  <p className="mt-3 font-mono text-[11px] text-blue-700">{x.searchQuery}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {flashcards.length ? (
        <div>
          <SectionTitle>Self-test flashcards</SectionTitle>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {flashcards.map((card, i) => (
              <li key={i} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-bold text-slate-900">{asNonEmptyString(card?.question) || "Question"}</p>
                {asNonEmptyString(card?.answer) ? <Prose className="mt-2 text-[13px]">{card.answer}</Prose> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function TabScript({ analysis }) {
  const ps = isRecord(analysis?.presentationScript) ? analysis.presentationScript : null;
  if (!ps) return <Prose>No presentation script.</Prose>;
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
        <SectionTitle>Opening you can speak</SectionTitle>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 md:text-[15px]">{asNonEmptyString(ps.opening) || "—"}</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <SectionTitle>Closing you can end with</SectionTitle>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-[15px]">{asNonEmptyString(ps.closing) || "—"}</p>
      </div>
    </div>
  );
}

function ActivePanel({ tabId, analysis, omitPaperHeader }) {
  switch (tabId) {
    case "summary":
      return <TabSummary analysis={analysis} omitPaperHeader={omitPaperHeader} />;
    case "narrative":
      return <TabNarrative analysis={analysis} />;
    case "script":
      return <TabScript analysis={analysis} />;
    case "terms":
      return <TabTerms analysis={analysis} />;
    case "methods":
      return <TabMethods analysis={analysis} />;
    case "results":
      return <TabResults analysis={analysis} />;
    case "critique":
      return <TabCritique analysis={analysis} />;
    case "slides":
      return <TabSlides slides={analysis?.slides} />;
    case "quick":
      return <TabSlides slides={analysis?.quickSlides} />;
    case "qa":
      return <TabQa items={analysis?.qaPrep} />;
    case "cheat":
      return <TabCheat analysis={analysis} />;
    case "reference":
      return <TabReference analysis={analysis} />;
    default:
      return null;
  }
}

export const StructuredAnalysisPanel = memo(function StructuredAnalysisPanel({ analysis, embedMeta }) {
  const [mode, setMode] = useState("understand");
  const [tab, setTab] = useState("summary");
  const omitPaperHeader = Boolean(embedMeta?.omitPaperHeader);

  const safeAnalysis = useMemo(() => (isRecord(analysis) ? analysis : {}), [analysis]);
  const activeMode = useMemo(() => MODE_GROUPS.find((item) => item.id === mode) || MODE_GROUPS[0], [mode]);
  const visibleTabs = useMemo(
    () => TABS.filter((tabItem) => activeMode.tabIds.includes(tabItem.id)),
    [activeMode],
  );
  const activeTab = useMemo(() => {
    if (visibleTabs.some((item) => item.id === tab)) return tab;
    return visibleTabs[0]?.id || "summary";
  }, [tab, visibleTabs]);

  const onKeyNav = useCallback(
    (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const idx = visibleTabs.findIndex((t) => t.id === activeTab);
      if (idx < 0) return;
      const next = e.key === "ArrowRight" ? Math.min(visibleTabs.length - 1, idx + 1) : Math.max(0, idx - 1);
      setTab(visibleTabs[next].id);
      e.preventDefault();
    },
    [activeTab, visibleTabs],
  );

  if (!isRecord(analysis) || Object.keys(safeAnalysis).length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
        <p className="text-sm font-medium text-slate-700">Structured analysis is not available for this workspace yet.</p>
        <p className="mt-2 text-xs text-slate-500">If processing just finished, refresh this page in a moment.</p>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      onKeyDown={onKeyNav}
      role="region"
      aria-label="Structured paper analysis"
    >
      {/* Mode selector — clean 3-column */}
      <div className="grid grid-cols-3 border-b border-slate-200">
        {MODE_GROUPS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setMode(item.id);
              if (!item.tabIds.includes(activeTab)) {
                setTab(item.tabIds[0]);
              }
            }}
            className={`px-4 py-3.5 text-left transition-colors border-r last:border-r-0 border-slate-200 ${
              mode === item.id
                ? "bg-blue-50 border-b-2 border-b-blue-500"
                : "bg-white hover:bg-slate-50"
            }`}
          >
            <p className={`text-xs font-bold ${mode === item.id ? "text-blue-700" : "text-slate-700"}`}>{item.label}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{MODE_SUBTITLE[item.id]}</p>
          </button>
        ))}
      </div>

      {/* Sub-tabs — horizontal pill strip */}
      <div className="flex gap-1.5 overflow-x-auto border-b border-slate-100 bg-slate-50 px-4 py-2.5">
        {visibleTabs.map((t) => {
          const active = t.id === activeTab;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                active
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-700"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content — no height constraint, flows naturally */}
      <div className="p-4 md:p-6" role="tabpanel">
        <ActivePanel tabId={activeTab} analysis={safeAnalysis} omitPaperHeader={omitPaperHeader} />
      </div>
    </div>
  );
});
