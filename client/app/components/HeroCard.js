"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const STEPS = [
  { label: "Reading your paper...", pct: 20 },
  { label: "Extracting text and tables...", pct: 35 },
  { label: "AI is reading the full paper...", pct: 55 },
  { label: "Building your presentation...", pct: 75 },
  { label: "Generating cheat sheet...", pct: 88 },
  { label: "Your workspace is ready", pct: 100 },
];

const OUTPUTS = ["15 Slides", "Cheat Sheet", "Q&A Prep", "Flashcards", "AI Chat", "Script"];

export default function HeroCard() {
  const [phase, setPhase] = useState("processing");
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    if (phase === "processing") {
      if (stepIdx < STEPS.length - 1) {
        const t = setTimeout(() => setStepIdx((i) => i + 1), 950);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setPhase("done"), 1000);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setPhase("processing");
      setStepIdx(0);
    }, 3800);
    return () => clearTimeout(t);
  }, [phase, stepIdx]);

  const current = STEPS[stepIdx];

  return (
    <div className="relative w-full max-w-100 mx-auto">
      <div className="absolute inset-0 bg-brand/15 blur-3xl rounded-3xl scale-90 translate-y-6" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative bg-white rounded-2xl border border-border shadow-2xl shadow-brand/10 p-6 overflow-hidden"
      >
        <div className="flex items-center gap-1.5 mb-5">
          <span className="w-3 h-3 rounded-full bg-[#fc635d]" />
          <span className="w-3 h-3 rounded-full bg-[#fdbc40]" />
          <span className="w-3 h-3 rounded-full bg-[#34c749]" />
          <span className="ml-auto text-[11px] text-subtle font-mono">arxio.in</span>
        </div>

        <div className="flex items-start gap-3 mb-5 p-3 bg-surface rounded-xl border border-border">
          <div className="w-9 h-11 bg-brand-light rounded-lg flex items-center justify-center shrink-0 border border-brand-muted">
            <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
              <path d="M2 2h8l4 4v12a1 1 0 01-1 1H2a1 1 0 01-1-1V3a1 1 0 012-1z" stroke="#2563eb" strokeWidth="1.5" fill="none" />
              <path d="M10 2v4h4" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M4 9h8M4 12h6M4 15h4" stroke="#93c5fd" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-ink truncate">lane_detection_vilds.pdf</p>
            <p className="text-[11px] text-subtle mt-0.5">48 pages · 2.1 MB</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {phase === "processing" ? (
            <motion.div
              key="proc"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[11px] font-medium text-muted">{current.label}</span>
                  <span className="text-[11px] font-bold text-brand">{current.pct}%</span>
                </div>
                <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-brand rounded-full"
                    animate={{ width: `${current.pct}%` }}
                    transition={{ duration: 0.55, ease: "easeOut" }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                {STEPS.slice(0, Math.min(stepIdx + 1, 5)).map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center gap-2"
                  >
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                        i < stepIdx ? "bg-[#dcfce7]" : "bg-brand-light"
                      }`}
                    >
                      {i < stepIdx ? (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2.5 2.5L8 3" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="block w-2.5 h-2.5 border-2 border-brand border-t-transparent rounded-full"
                        />
                      )}
                    </div>
                    <span className={`text-[11px] ${i <= stepIdx ? "text-ink" : "text-subtle"}`}>{s.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-[#dcfce7] rounded-full flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#16a34a" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-ink">Workspace ready</span>
                <span className="text-[11px] text-subtle ml-auto">8m 42s</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {OUTPUTS.map((o, i) => (
                  <motion.div
                    key={o}
                    initial={{ opacity: 0, scale: 0.88 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.06, duration: 0.28 }}
                    className="bg-surface border border-border rounded-lg py-2 px-2 text-center"
                  >
                    <p className="text-[11px] font-semibold text-ink">{o}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.3, duration: 0.45 }}
        className="absolute -right-3 top-6 bg-white border border-border rounded-xl shadow-lg px-3 py-2"
      >
        <p className="text-xs font-semibold text-ink">
          <span className="text-brand">10 min</span> average
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.6, duration: 0.45 }}
        className="absolute -left-3 bottom-10 bg-white border border-border rounded-xl shadow-lg px-3 py-2"
      >
        <p className="text-xs font-semibold text-ink">
          <span className="text-brand">Free</span> to start
        </p>
      </motion.div>
    </div>
  );
}
