import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useParams } from "react-router-dom";
import { Button, Loader, StatusTag } from "../../common/components";
import { downloadWorkspaceExport } from "../../core/api/export-api";
import { getWorkspace } from "../../core/api/pdf-api";
import { PLAN_NUDGES } from "../../core/plan/nudges";
import { usePlan } from "../../core/plan/use-plan";
import { WORKSPACE_STATUS } from "../../core/ui/ui-enums";
import { WorkspaceChatPanel } from "../../features/workspace/components/WorkspaceChatPanel";
import { formatAuthors, formatFileSize } from "../../features/workspace/lib/analysis-utils";
import { useWorkspaceStatus } from "../../features/workspace/hooks/useWorkspaceStatus";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "terms", label: "Key Terms" },
  { id: "slides", label: "Slides" },
  { id: "qa", label: "Q&A Prep" },
  { id: "cheatsheet", label: "Cheat Sheet" },
  { id: "chat", label: "Chat" },
];

function SlideCard({ slide }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-xl border transition-all ${open ? "border-blue-200 bg-blue-50/40" : "border-slate-200 bg-white hover:border-slate-300"}`}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-xs font-black text-blue-700">
          {slide.slideNumber}
        </span>
        <span className="flex-1 text-sm font-semibold text-slate-800">{slide.title}</span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={`shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="border-t border-slate-100 px-4 pb-4 pt-3 pl-15">
          {slide.bullets?.length > 0 && (
            <ul className="space-y-2 mb-4">
              {slide.bullets.map((b, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-700 leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                  {b}
                </li>
              ))}
            </ul>
          )}
          {slide.speakerNote && (
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Speaker note</p>
              <p className="text-xs text-slate-600 leading-relaxed">{slide.speakerNote}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function QACard({ item }) {
  const [open, setOpen] = useState(false);
  const diff = item.difficulty || "medium";
  const diffStyle = diff === "easy" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : diff === "hard" ? "bg-rose-50 text-rose-700 border-rose-200"
    : "bg-amber-50 text-amber-700 border-amber-200";
  return (
    <div className={`rounded-xl border transition-all ${open ? "border-blue-200 bg-blue-50/30" : "border-slate-200 bg-white hover:border-slate-300"}`}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-start gap-3 px-4 py-3.5 text-left"
      >
        <span className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-bold capitalize ${diffStyle}`}>{diff}</span>
        <span className="flex-1 text-sm font-semibold text-slate-800 leading-snug">{item.question}</span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={`shrink-0 mt-0.5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="border-t border-slate-100 px-4 pb-4 pt-3">
          <p className="text-sm text-slate-700 leading-relaxed">{item.answer}</p>
          {item.whyTheyAskThis && (
            <p className="mt-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-600">Why asked: </span>{item.whyTheyAskThis}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function OverviewTab({ analysis }) {
  const cs = analysis?.coreStory;
  return (
    <div className="space-y-5">
      {analysis?.overview && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Summary</p>
          <p className="text-sm text-slate-700 leading-relaxed">{analysis.overview}</p>
        </div>
      )}

      {cs && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Core Story</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "problem", label: "Problem", color: "border-rose-200 bg-rose-50" },
              { key: "solution", label: "Solution", color: "border-blue-200 bg-blue-50" },
              { key: "keyResult", label: "Key Result", color: "border-emerald-200 bg-emerald-50" },
              { key: "soWhat", label: "So What?", color: "border-violet-200 bg-violet-50" },
            ].map(({ key, label, color }) => cs[key] && (
              <div key={key} className={`rounded-xl border p-4 ${color}`}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">{label}</p>
                <p className="text-sm text-slate-700 leading-relaxed">{cs[key]}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {analysis?.methodology?.summary && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Methodology</p>
          <p className="text-sm text-slate-700 leading-relaxed mb-4">{analysis.methodology.summary}</p>
          {analysis.methodology.steps?.length > 0 && (
            <ol className="space-y-2.5">
              {analysis.methodology.steps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-700">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-black text-blue-700">{i + 1}</span>
                  <span className="leading-relaxed pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {analysis?.results?.summary && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Results</p>
          <p className="text-sm text-slate-700 leading-relaxed mb-4">{analysis.results.summary}</p>
          {analysis.results.keyFindings?.length > 0 && (
            <ul className="space-y-2">
              {analysis.results.keyFindings.map((f, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-slate-700">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  <span className="leading-relaxed">{f}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {analysis?.criticalAnalysis && (
        <div className="grid md:grid-cols-2 gap-3">
          {analysis.criticalAnalysis.strengths?.length > 0 && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 mb-3">Strengths</p>
              <ul className="space-y-2">
                {analysis.criticalAnalysis.strengths.map((s, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-700 leading-relaxed">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {analysis.criticalAnalysis.weaknesses?.length > 0 && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-rose-700 mb-3">Limitations</p>
              <ul className="space-y-2">
                {analysis.criticalAnalysis.weaknesses.map((w, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-700 leading-relaxed">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function KeyTermsTab({ analysis }) {
  const terms = analysis?.keyTerms || [];
  if (!terms.length) return <p className="text-sm text-slate-400">No key terms found.</p>;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {terms.map((t, i) => (
        <div key={i} className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-slate-900 mb-1.5">{t.term}</p>
          <p className="text-sm text-slate-600 leading-relaxed">{t.definition}</p>
          {t.analogy && (
            <p className="mt-3 text-xs italic text-slate-400 border-t border-slate-100 pt-3 leading-relaxed">
              {t.analogy}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

const PRES_THEMES = [
  { header: "from-[#1e3a8a] via-[#1d4ed8] to-[#3b82f6]", accent: "#3b82f6" },
  { header: "from-[#312e81] via-[#4338ca] to-[#6366f1]", accent: "#6366f1" },
  { header: "from-[#134e4a] via-[#0f766e] to-[#14b8a6]", accent: "#14b8a6" },
  { header: "from-[#1e1b4b] via-[#3730a3] to-[#818cf8]", accent: "#818cf8" },
  { header: "from-[#4a1942] via-[#7e22ce] to-[#a855f7]", accent: "#a855f7" },
  { header: "from-[#7f1d1d] via-[#b91c1c] to-[#f87171]", accent: "#f87171" },
];

function PresentationModal({ slides, title, onClose }) {
  const [current, setCurrent] = useState(0);
  const [dir, setDir] = useState(1);
  const [animKey, setAnimKey] = useState(0);
  const [notesOpen, setNotesOpen] = useState(false);
  const [showThumbs, setShowThumbs] = useState(true);
  const thumbsRef = useRef(null);
  const total = slides.length;
  const slide = slides[current];
  const theme = PRES_THEMES[current % PRES_THEMES.length];
  const isTitle = current === 0;
  const progress = ((current + 1) / total) * 100;

  function goTo(idx) {
    if (idx === current || idx < 0 || idx >= total) return;
    setDir(idx > current ? 1 : -1);
    setCurrent(idx);
    setAnimKey(k => k + 1);
  }

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") { e.preventDefault(); goTo(current + 1); }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); goTo(current - 1); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, total, onClose]);

  useEffect(() => {
    const el = thumbsRef.current?.querySelector(`[data-slide="${current}"]`);
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [current]);

  if (typeof document === "undefined") return null;

  const animClass = dir >= 0 ? "pres-slide-in" : "pres-slide-in-back";

  return createPortal(
    <div className="fixed inset-0 z-100 flex flex-col" style={{ background: "#090912" }}>

      {/* ── TOP HUD ── */}
      <div className="shrink-0 flex items-center justify-between border-b border-white/6 bg-black/50 px-4 py-2.5 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowThumbs(v => !v)}
            title="Toggle slide panel"
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition ${showThumbs ? "border-blue-500/60 bg-blue-600/20 text-blue-300" : "border-white/10 bg-white/5 text-slate-500 hover:text-white"}`}
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor">
              <rect x="0" y="0" width="4.5" height="3.2" rx="0.6" opacity="0.7"/>
              <rect x="6.5" y="0" width="4.5" height="3.2" rx="0.6" opacity="0.7"/>
              <rect x="0" y="4.2" width="4.5" height="3.2" rx="0.6" opacity="0.7"/>
              <rect x="6.5" y="4.2" width="4.5" height="3.2" rx="0.6" opacity="0.7"/>
              <rect x="0" y="8.4" width="4.5" height="2.6" rx="0.6" opacity="0.4"/>
              <rect x="6.5" y="8.4" width="4.5" height="2.6" rx="0.6" opacity="0.4"/>
            </svg>
            Slides
          </button>
          <p className="hidden sm:block text-[11px] text-slate-500 truncate max-w-65 leading-none">{title}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold tabular-nums text-slate-500">{current + 1}<span className="text-slate-700 mx-0.5">/</span>{total}</span>
          <button
            type="button"
            onClick={() => setNotesOpen(v => !v)}
            className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition ${notesOpen ? "border-blue-500/60 bg-blue-600/20 text-blue-300" : "border-white/10 bg-white/5 text-slate-500 hover:text-white"}`}
          >
            Notes
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-500 transition hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-400"
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M1.5 1.5l8 8M9.5 1.5l-8 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="flex flex-1 min-h-0">

        {/* Thumbnail strip */}
        {showThumbs && (
          <div ref={thumbsRef} className="w-44 shrink-0 overflow-y-auto border-r border-white/6 bg-black/30 py-3 px-2.5 space-y-2">
            {slides.map((s, i) => {
              const t = PRES_THEMES[i % PRES_THEMES.length];
              const active = i === current;
              return (
                <button
                  key={i}
                  type="button"
                  data-slide={i}
                  onClick={() => goTo(i)}
                  className={`w-full rounded-xl overflow-hidden border transition-all text-left ${active ? "border-blue-500 ring-2 ring-blue-500/30 shadow-[0_0_16px_rgba(59,130,246,0.25)]" : "border-white/5 hover:border-white/15"}`}
                >
                  <div className={`relative w-full bg-linear-to-br ${t.header}`} style={{ aspectRatio: "16/9" }}>
                    {i === 0 ? (
                      <div className="absolute inset-0 flex items-center justify-center p-2">
                        <p className="text-[7px] font-black text-white text-center leading-tight line-clamp-3">{s.title}</p>
                      </div>
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute bottom-0 inset-x-0 bg-white/90 p-1.5">
                          <p className="text-[6.5px] font-bold text-slate-800 leading-tight line-clamp-2">{s.title}</p>
                        </div>
                        <p className="absolute top-1 right-1.5 text-[7px] font-black text-white/40">{s.slideNumber ?? i + 1}</p>
                      </>
                    )}
                  </div>
                  <div className="bg-[#13131f] px-2 py-1 flex items-center justify-between">
                    <p className="text-[8px] text-slate-600 truncate flex-1">{s.title}</p>
                    {active && <span className="ml-1 h-1 w-1 shrink-0 rounded-full bg-blue-500" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Slide stage */}
        <div className="flex flex-1 min-w-0 flex-col items-center justify-center px-6 py-5 gap-3">
          <div className="flex w-full max-w-5xl items-center gap-4">

            {/* Prev */}
            <button
              type="button"
              onClick={() => goTo(current - 1)}
              disabled={current === 0}
              className="shrink-0 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white disabled:opacity-10"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 3.5L6 8l4 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Slide card */}
            <div className="flex-1">
              <div
                key={animKey}
                className={`relative w-full overflow-hidden rounded-2xl shadow-[0_48px_120px_rgba(0,0,0,0.8)] ${animClass}`}
                style={{ aspectRatio: "16/9" }}
              >
                {isTitle ? (
                  /* ── TITLE SLIDE ── */
                  <div className={`absolute inset-0 bg-linear-to-br ${theme.header} flex flex-col items-center justify-center px-12 text-center overflow-hidden`}>
                    {/* Decorative orbs */}
                    <div className="absolute -top-16 -left-16 h-56 w-56 rounded-full bg-white/5 blur-3xl" />
                    <div className="absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-white/5 blur-3xl" />
                    <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 34px,rgba(255,255,255,1) 35px),repeating-linear-gradient(90deg,transparent,transparent 34px,rgba(255,255,255,1) 35px)" }} />
                    <div className="relative">
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[clamp(0.5rem,0.9vw,0.7rem)] font-bold uppercase tracking-widest text-white/60 mb-5 backdrop-blur-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
                        Presentation · {total} slides
                      </div>
                      <h1 className="text-[clamp(1.2rem,3.8vw,2.8rem)] font-black tracking-tight text-white leading-[1.1] mb-5">
                        {slide?.title}
                      </h1>
                      {slide?.bullets?.[0] && (
                        <p className="text-[clamp(0.6rem,1.3vw,0.95rem)] text-white/55 max-w-lg leading-relaxed">
                          {slide.bullets[0]}
                        </p>
                      )}
                      <div className="mt-8 flex items-center justify-center gap-2">
                        <div className="h-px w-12 bg-white/20" />
                        <p className="text-[clamp(0.5rem,0.8vw,0.65rem)] font-semibold uppercase tracking-widest text-white/30">{title}</p>
                        <div className="h-px w-12 bg-white/20" />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ── CONTENT SLIDE ── */
                  <div className="absolute inset-0 flex flex-col bg-white">
                    {/* Header band */}
                    <div className={`shrink-0 bg-linear-to-r ${theme.header} px-8 flex items-center justify-between`} style={{ height: "36%" }}>
                      <div className="min-w-0 flex-1">
                        <p className="text-[clamp(0.45rem,0.75vw,0.6rem)] font-semibold uppercase tracking-[0.2em] text-white/40 mb-1.5">{title}</p>
                        <h2 className="text-[clamp(0.85rem,2.6vw,1.8rem)] font-black text-white leading-tight">
                          {slide?.title}
                        </h2>
                      </div>
                      <span className="shrink-0 ml-4 text-[clamp(2rem,5.5vw,4.5rem)] font-black text-white/8 tabular-nums leading-none select-none">
                        {String(slide?.slideNumber ?? current + 1).padStart(2, "0")}
                      </span>
                    </div>
                    {/* Body */}
                    <div className="flex-1 min-h-0 flex items-center px-8 py-3 overflow-hidden">
                      {slide?.bullets?.length > 0 ? (
                        <ul className="w-full space-y-[clamp(5px,1vh,12px)]">
                          {slide.bullets.map((b, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <span
                                className="shrink-0 rounded-full mt-[0.3em]"
                                style={{ width: "clamp(6px,0.55vw,9px)", height: "clamp(6px,0.55vw,9px)", background: theme.accent }}
                              />
                              <span className="text-[clamp(0.65rem,1.45vw,0.95rem)] text-slate-700 leading-snug">{b}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[clamp(0.65rem,1.4vw,0.9rem)] text-slate-400 italic">No content on this slide.</p>
                      )}
                    </div>
                    {/* Footer accent */}
                    <div className="shrink-0 h-1" style={{ background: `linear-gradient(90deg,${theme.accent},transparent)` }} />
                  </div>
                )}
              </div>
            </div>

            {/* Next */}
            <button
              type="button"
              onClick={() => goTo(current + 1)}
              disabled={current === total - 1}
              className="shrink-0 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white disabled:opacity-10"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 3.5l4 4.5-4 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Speaker notes */}
          {notesOpen && (
            <div className="w-full max-w-5xl rounded-xl border border-white/[0.07] bg-white/4 px-5 py-3 backdrop-blur-sm">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 mb-1.5">Speaker note</p>
              <p className="text-[clamp(0.7rem,1.1vw,0.85rem)] text-slate-300 leading-relaxed">
                {slide?.speakerNote || "No speaker note for this slide."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── BOTTOM BAR ── */}
      <div className="shrink-0 flex items-center justify-between border-t border-white/6 bg-black/40 px-5 py-2.5 backdrop-blur-xl">
        {/* Progress */}
        <div className="flex items-center gap-2.5 flex-1 max-w-45">
          <div className="flex-1 h-0.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-[10px] font-semibold text-slate-600 tabular-nums">{Math.round(progress)}%</span>
        </div>

        {/* Dot nav */}
        <div className="flex items-center gap-1 mx-4 flex-wrap justify-center">
          {slides.slice(0, 20).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-200 ${i === current ? "w-5 h-1.5 bg-blue-500" : "w-1.5 h-1.5 bg-white/15 hover:bg-white/35"}`}
            />
          ))}
          {total > 20 && <span className="text-[9px] text-slate-600 ml-1">+{total - 20}</span>}
        </div>

        {/* Keyboard hint */}
        <p className="hidden sm:block text-[10px] text-slate-700 tabular-nums">
          ← → navigate &nbsp;&nbsp; Esc close
        </p>
      </div>
    </div>,
    document.body,
  );
}

function SlidesTab({ analysis, paperTitle }) {
  const [view, setView] = useState("15");
  const [presenting, setPresenting] = useState(false);
  const slides15 = analysis?.slides || [];
  const slides5 = analysis?.quickSlides || [];
  const slides = view === "15" ? slides15 : slides5;
  return (
    <div>
      {presenting && slides.length > 0 && (
        <PresentationModal slides={slides} title={paperTitle || "Presentation"} onClose={() => setPresenting(false)} />
      )}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex gap-2">
          {slides15.length > 0 && (
            <button onClick={() => setView("15")} className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${view === "15" ? "border-blue-300 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"}`}>
              15-Slide Deck
            </button>
          )}
          {slides5.length > 0 && (
            <button onClick={() => setView("5")} className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${view === "5" ? "border-blue-300 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"}`}>
              5-Slide Quick Pitch
            </button>
          )}
        </div>
        {slides.length > 0 && (
          <button
            type="button"
            onClick={() => setPresenting(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:brightness-110"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <polygon points="2,1 12,6.5 2,12" fill="currentColor"/>
            </svg>
            Present
          </button>
        )}
      </div>
      {analysis?.presentationScript?.opening && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-2">Opening script</p>
          <p className="text-sm text-slate-700 leading-relaxed">{analysis.presentationScript.opening}</p>
        </div>
      )}
      <div className="space-y-2">
        {slides.map((slide, i) => <SlideCard key={i} slide={slide} />)}
      </div>
      {analysis?.presentationScript?.closing && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 mt-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Closing script</p>
          <p className="text-sm text-slate-700 leading-relaxed">{analysis.presentationScript.closing}</p>
        </div>
      )}
    </div>
  );
}

function QATab({ analysis }) {
  const items = analysis?.qaPrep || [];
  if (!items.length) return <p className="text-sm text-slate-400">No Q&A found.</p>;
  return (
    <div className="space-y-2">
      {items.map((item, i) => <QACard key={i} item={item} />)}
    </div>
  );
}

function CheatSheetTab({ analysis }) {
  const cs = analysis?.cheatSheet;
  if (!cs) return <p className="text-sm text-slate-400">No cheat sheet found.</p>;
  return (
    <div className="space-y-5">
      {cs.keyTerms?.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Key Terms</p>
          <div className="space-y-2">
            {cs.keyTerms.map((t, i) => (
              <div key={i} className="flex gap-3 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                <span className="text-sm font-semibold text-slate-800 w-40 shrink-0">{t.term}</span>
                <span className="text-sm text-slate-600 leading-relaxed">{t.definition}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {cs.talkingPoints?.length > 0 && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-3">Talking Points</p>
          <ul className="space-y-2">
            {cs.talkingPoints.map((p, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-slate-700 leading-relaxed">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      {cs.fallbackAnswers?.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">If you get stuck — say this</p>
          <div className="space-y-3">
            {cs.fallbackAnswers.map((f, i) => (
              <div key={i} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <p className="text-[11px] font-semibold text-slate-500 mb-1">When asked: "{f.trigger}"</p>
                <p className="text-sm text-slate-700 leading-relaxed">"{f.say}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {cs.keyNumbers?.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Key Numbers to Remember</p>
          <ul className="space-y-2">
            {cs.keyNumbers.map((n, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-slate-700 leading-relaxed">
                <span className="font-bold text-blue-600">#</span>
                {n}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function WorkspacePage() {
  const { workspaceId = "" } = useParams();
  const plan = usePlan();
  const { status, loading: statusLoading, error: statusError } = useWorkspaceStatus(workspaceId);
  const [workspace, setWorkspace] = useState(null);
  const [error, setError] = useState("");
  const [exportBusy, setExportBusy] = useState(null);
  const [exportError, setExportError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!workspaceId) return undefined;
    const normalized = String(status?.status || "").toLowerCase();
    if (normalized !== WORKSPACE_STATUS.COMPLETED && normalized !== WORKSPACE_STATUS.FAILED) return undefined;
    let cancelled = false;
    async function fetchWorkspace() {
      try {
        const data = await getWorkspace(workspaceId);
        if (!cancelled) { setWorkspace(data); setError(""); }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unable to fetch workspace.");
      }
    }
    fetchWorkspace();
    return () => { cancelled = true; };
  }, [workspaceId, status?.status]);

  const analysis = useMemo(() => {
    const raw = workspace?.analysis;
    return raw != null && typeof raw === "object" && !Array.isArray(raw) ? raw : null;
  }, [workspace?.analysis]);

  const fileStem = useMemo(() => {
    const name = workspace?.originalName || "paper";
    return String(name).replace(/\.pdf$/i, "").replace(/[/\\?%*:|"<>]/g, "").slice(0, 80) || "paper";
  }, [workspace?.originalName]);

  const heroTitle = useMemo(() => {
    if (analysis?.paperTitle?.trim()) return analysis.paperTitle.trim();
    return workspace?.originalName || `Workspace ${workspaceId.slice(-8)}`;
  }, [analysis, workspace?.originalName, workspaceId]);

  const heroSubtitle = useMemo(() => {
    if (!analysis) return "";
    const parts = [];
    const authorsLine = formatAuthors(analysis.authors);
    if (authorsLine) parts.push(authorsLine);
    if (analysis.year) parts.push(String(analysis.year));
    if (analysis.venue?.trim()) parts.push(analysis.venue.trim());
    return parts.join(" · ");
  }, [analysis]);

  const runExport = useCallback(async (format) => {
    if (!workspaceId) return;
    setExportBusy(format);
    setExportError("");
    try {
      await downloadWorkspaceExport(workspaceId, format, fileStem);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Export failed.");
    } finally {
      setExportBusy(null);
    }
  }, [workspaceId, fileStem]);

  const progress = useMemo(() => Math.max(0, Math.min(100, Number(status?.percent ?? 0) || 0)), [status?.percent]);
  const normalizedStatus = String(status?.status || "").toLowerCase();
  const isCompleted = normalizedStatus === WORKSPACE_STATUS.COMPLETED;
  const isFailed = normalizedStatus === WORKSPACE_STATUS.FAILED;
  const pptAllowed = plan.allows("ppt");

  function renderTab() {
    if (!isCompleted || !analysis) return null;
    switch (activeTab) {
      case "overview": return <OverviewTab analysis={analysis} />;
      case "terms": return <KeyTermsTab analysis={analysis} />;
      case "slides": return <SlidesTab analysis={analysis} paperTitle={heroTitle} />;
      case "qa": return <QATab analysis={analysis} />;
      case "cheatsheet": return <CheatSheetTab analysis={analysis} />;
      case "chat": return (
        <WorkspaceChatPanel
          workspaceId={workspaceId}
          workspaceReady={isCompleted}
          chatAllowed={Boolean(plan.chatAllowed)}
          onUsageSync={plan.refresh}
        />
      );
      default: return null;
    }
  }

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200/60 bg-slate-50">

      {/* Header */}
      <header className="shrink-0 bg-white border-b border-slate-200">
        <div className="px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <Link to="/workspaces" className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-600 transition-colors">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M7.5 2.5L4.5 6l3 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Library
                </Link>
              </div>
              <h1 className="text-base font-bold tracking-tight text-slate-900 leading-snug">{heroTitle}</h1>
              {heroSubtitle && <p className="mt-0.5 text-xs text-slate-400">{heroSubtitle}</p>}
              {isCompleted && workspace && (
                <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                  {workspace.pageCount != null && <span><span className="font-semibold text-slate-600">{workspace.pageCount}</span> pages</span>}
                  {workspace.wordCount != null && <span><span className="font-semibold text-slate-600">{workspace.wordCount.toLocaleString()}</span> words</span>}
                  {workspace.fileSize != null && <span>{formatFileSize(workspace.fileSize)}</span>}
                  {Array.isArray(analysis?.slides) && <span><span className="font-semibold text-slate-600">{analysis.slides.length}</span> slides</span>}
                </div>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <StatusTag status={status?.status} />
              {isCompleted && workspace && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 rounded-xl border-slate-200 bg-white px-3 text-[11px] font-semibold hover:border-blue-300 hover:text-blue-700"
                    disabled={!pptAllowed || !workspace.hasPptx || exportBusy !== null}
                    loading={exportBusy === "pptx"}
                    title={!pptAllowed ? PLAN_NUDGES.ppt : "Download 15-slide deck"}
                    onClick={() => runExport("pptx")}
                  >
                    ↓ 15-slide PPTX
                  </Button>
                  <Button
                    type="button"
                    className="h-8 rounded-xl px-3 text-[11px] font-semibold"
                    disabled={!pptAllowed || !workspace.hasQuickPptx || exportBusy !== null}
                    loading={exportBusy === "quick_pptx"}
                    title={!pptAllowed ? PLAN_NUDGES.ppt : "Download quick pitch deck"}
                    onClick={() => runExport("quick_pptx")}
                  >
                    ↓ Quick PPTX
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabs — only when completed */}
        {isCompleted && (
          <div className="flex gap-0 border-t border-slate-100 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-700 bg-blue-50/50"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Body */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">

        {/* Errors */}
        {(statusError || error) && (
          <div className="m-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
            {statusError || error}
          </div>
        )}
        {exportError && (
          <div className="mx-5 mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">{exportError}</div>
        )}

        {/* Processing */}
        {!isCompleted && !isFailed && (
          <div className="m-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-3">
              <p className="text-sm font-semibold text-slate-800">
                {statusLoading ? "Syncing…" : (status?.step || "Processing your paper…")}
              </p>
              <span className="text-xs font-bold text-blue-600">{progress}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-blue-500 transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {isFailed && (
          <div className="m-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {status?.errorMessage || "Processing failed. Please try again from the dashboard."}
          </div>
        )}

        {/* Loading analysis */}
        {isCompleted && !workspace && (
          <div className="flex items-center justify-center py-16">
            <Loader label="Loading workspace…" />
          </div>
        )}

        {/* Tab content */}
        {isCompleted && workspace && (
          <div className="px-5 py-5">
            {renderTab()}
          </div>
        )}
      </div>
    </section>
  );
}
