"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect, createContext, useContext } from "react";
import Link from "next/link";
import { PLANS_DATA } from "./lib/data";
import { LogoWordmark } from "./components/Logo";
import ComingSoonModal from "./components/ComingSoonModal";

const ModalCtx = createContext(() => {});

function CTAButton({ children, className }) {
  const open = useContext(ModalCtx);
  return <button onClick={open} className={className}>{children}</button>;
}

function IconCheck({ size = 16, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconArrow({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function FadeIn({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const STEPS = [
  { label: "Reading your paper...", pct: 20 },
  { label: "Extracting text and tables...", pct: 35 },
  { label: "AI is reading the full paper...", pct: 55 },
  { label: "Building your presentation...", pct: 75 },
  { label: "Generating cheat sheet...", pct: 88 },
  { label: "Your workspace is ready", pct: 100 },
];

const OUTPUTS = ["15 Slides", "Cheat Sheet", "Q&A Prep", "Flashcards", "AI Chat", "Script"];

function HeroCard() {
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
                        i < stepIdx
                          ? "bg-[#dcfce7] text-[#16a34a]"
                          : "bg-brand-light"
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

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled || open ? "bg-white/95 backdrop-blur-xl border-b border-border shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
        <Link href="/"><LogoWordmark size={30} /></Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm font-medium text-muted hover:text-ink transition-colors">
            How it works
          </a>
          <Link href="/pricing" className="text-sm font-medium text-muted hover:text-ink transition-colors">
            Pricing
          </Link>
          <Link href="/vision" className="text-sm font-medium text-muted hover:text-ink transition-colors">
            Vision
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <CTAButton className="text-sm font-medium text-muted hover:text-ink px-4 py-2 rounded-lg hover:bg-surface transition-all">
            Sign in
          </CTAButton>
          <CTAButton className="text-sm font-semibold text-white bg-brand hover:bg-brand-dark px-5 py-2 rounded-lg transition-all shadow-sm">
            Try free
          </CTAButton>
        </div>

        <button className="md:hidden text-muted p-1.5" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <IconClose /> : <IconMenu />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-border overflow-hidden"
          >
            <div className="px-6 py-5 flex flex-col gap-4">
              <a href="#how-it-works" onClick={() => setOpen(false)} className="text-sm font-medium text-muted">How it works</a>
              <a href="#pricing" onClick={() => setOpen(false)} className="text-sm font-medium text-muted">Pricing</a>
              <div className="h-px bg-border" />
              <CTAButton className="text-sm font-medium text-muted text-left">Sign in</CTAButton>
              <CTAButton className="text-sm font-semibold text-white bg-brand py-3 rounded-xl text-center w-full">
                Try free — no card needed
              </CTAButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      <div className="absolute inset-0 hero-grid opacity-50" />
      <div className="absolute inset-0 bg-linear-to-br from-white via-white/95 to-brand-light/50" />

      <div className="relative max-w-6xl mx-auto px-5 md:px-8 py-20 md:py-28 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-brand-light border border-brand-muted text-brand text-xs font-semibold px-3 py-1.5 rounded-full mb-6"
            >
              <span className="w-1.5 h-1.5 bg-brand rounded-full" />
              AI Research Assistant
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="font-display font-extrabold text-[48px] md:text-[58px] leading-[1.08] tracking-[-0.04em] text-ink mb-5"
            >
              Upload tonight.
              <br />
              Present in the
              <br />
              <span className="text-brand">morning.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-[17px] leading-relaxed text-muted mb-8 max-w-107.5"
            >
              Upload any research paper and Arxio generates a complete 15-slide presentation,
              cheat sheet, Q&A prep, and flashcards — in under 10 minutes.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-wrap gap-3 mb-10"
            >
              <CTAButton className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all shadow-lg shadow-brand/20 hover:shadow-brand/35 hover:-translate-y-0.5">
                Try free — no card needed
              </CTAButton>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 text-ink font-semibold text-sm px-6 py-3 rounded-xl border border-border hover:border-[#c7d6e8] bg-white hover:bg-surface transition-all"
              >
                See how it works
                <IconArrow />
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              className="flex items-center gap-7 pt-8 border-t border-border"
            >
              {[
                { value: "10 min", label: "average processing" },
                { value: "15", label: "slides generated" },
                { value: "Free", label: "to get started" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-display font-bold text-[22px] text-ink tracking-tight leading-none mb-1">{s.value}</p>
                  <p className="text-[11px] text-subtle">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <HeroCard />
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  const unis = ["IIT Delhi", "IIT Bombay", "BITS Pilani", "Delhi University", "VIT", "IIT Madras", "NIT Trichy", "Manipal", "IIIT Hyderabad", "Amity University"];

  const Chip = ({ name }) => (
    <div className="flex items-center gap-2.5 bg-white border border-border rounded-full px-4 py-2 shadow-sm shrink-0">
      <div className="w-1.5 h-1.5 rounded-full bg-brand/40 shrink-0" />
      <span className="text-[13px] font-semibold text-ink whitespace-nowrap">{name}</span>
    </div>
  );

  return (
    <div className="border-y border-border bg-surface py-6 overflow-hidden">
      <p className="text-center text-[10px] font-bold text-subtle uppercase tracking-[0.12em] mb-5">
        Used by students at
      </p>
      <div className="relative overflow-hidden mask-[linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="flex gap-3 w-max animate-[marquee_28s_linear_infinite]">
          {[...unis, ...unis].map((u, i) => <Chip key={i} name={u} />)}
        </div>
      </div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Upload your PDF",
      desc: "Drop any research paper — IEEE articles, journals, thesis documents. Up to 50 pages, 50 MB.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M4 15v2a2 2 0 002 2h10a2 2 0 002-2v-2M15 7l-4-4-4 4M11 3v11" stroke="#2563eb" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      n: "02",
      title: "AI analyses everything",
      desc: "The AI reads the full paper — methodology, results, key findings, limitations. Nothing skipped.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M11 2L12.8 8.2L19 10L12.8 11.8L11 18L9.2 11.8L3 10L9.2 8.2L11 2Z" stroke="#2563eb" strokeWidth="1.75" strokeLinejoin="round" />
          <path d="M18 14l1 3 1-3 3-1-3-1-1-3-1 3-3 1 3 1z" stroke="#93c5fd" strokeWidth="1.25" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      n: "03",
      title: "Download and present",
      desc: "Your workspace is ready in under 10 minutes — slides, cheat sheet, Q&A prep, flashcards, and more.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M4 15v2a2 2 0 002 2h10a2 2 0 002-2v-2M7 11l4 4 4-4M11 7v8" stroke="#2563eb" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-5 md:px-8">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="text-center mb-14">
          <p className="text-[10px] font-bold text-brand uppercase tracking-[0.12em] mb-3">How it works</p>
          <h2 className="font-display font-extrabold text-[38px] md:text-[44px] tracking-[-0.03em] text-ink leading-tight">
            Three steps. Ten minutes.
          </h2>
          <p className="text-[16px] text-muted mt-4 max-w-sm mx-auto">
            No setup. No learning curve. Upload your paper and walk away.
          </p>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-6 relative">
          <div className="hidden md:block absolute top-9 left-[calc(33.33%-20px)] right-[calc(33.33%-20px)] h-px bg-linear-to-r from-border via-brand/20 to-border" />

          {steps.map((s, i) => (
            <FadeIn key={s.n} delay={i * 0.1} className="h-full">
              <div className="relative bg-white border border-border rounded-2xl p-7 hover:border-brand-muted hover:shadow-xl hover:shadow-brand/5 transition-all duration-300 h-full">
                <div className="flex items-start justify-between mb-5">
                  <div className="w-11 h-11 bg-brand-light rounded-xl flex items-center justify-center">{s.icon}</div>
                  <span className="font-display font-extrabold text-[34px] text-border leading-none">{s.n}</span>
                </div>
                <h3 className="font-display font-bold text-[17px] text-ink mb-2 tracking-[-0.02em]">{s.title}</h3>
                <p className="text-[13.5px] text-muted leading-relaxed">{s.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function Outputs() {
  const items = [
    {
      title: "15-Slide Presentation",
      desc: "A complete deck with title, agenda, methodology, results, and Q&A slide — speaker notes included for every slide.",
      tag: "Most used",
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect x="2" y="4" width="18" height="12" rx="2" stroke="#2563eb" strokeWidth="1.75" />
          <path d="M8 20h6M11 16v4" stroke="#2563eb" strokeWidth="1.75" strokeLinecap="round" />
          <path d="M5.5 8.5h11M5.5 11.5h8" stroke="#93c5fd" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      title: "Cheat Sheet",
      desc: "One dense page with key terms, core results, methodology in three lines, talking points, and fallback answers.",
      tag: "",
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect x="4" y="2" width="14" height="18" rx="2" stroke="#2563eb" strokeWidth="1.75" />
          <path d="M7.5 7h7M7.5 11h7M7.5 15h5" stroke="#93c5fd" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      title: "Q&A Preparation",
      desc: "10 real questions a professor would ask — 2 easy, 5 medium, 3 hard — with complete, professor-proof answers.",
      tag: "",
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="11" r="8" stroke="#2563eb" strokeWidth="1.75" />
          <path d="M9 9c0-1.1.9-2 2-2s2 .9 2 2c0 1.5-2 2-2 3" stroke="#2563eb" strokeWidth="1.75" strokeLinecap="round" />
          <circle cx="11" cy="16" r="0.8" fill="#2563eb" />
        </svg>
      ),
    },
    {
      title: "Flashcards",
      desc: "15 flip cards for self-testing — key definitions, exact results with numbers, algorithm names, and methodology steps.",
      tag: "",
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect x="5" y="6" width="14" height="10" rx="2" stroke="#93c5fd" strokeWidth="1.5" />
          <rect x="3" y="4" width="14" height="10" rx="2" stroke="#2563eb" strokeWidth="1.75" />
          <path d="M6.5 9h7M6.5 12h5" stroke="#93c5fd" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      title: "AI Chat",
      desc: "Ask anything about the paper. The AI knows every section, every result, every number. Available for 10 minutes on free.",
      tag: "Interactive",
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M4 4h14a2 2 0 012 2v8a2 2 0 01-2 2H8l-4 3V6a2 2 0 012-2z" stroke="#2563eb" strokeWidth="1.75" strokeLinejoin="round" />
          <path d="M7.5 9h7M7.5 12h5" stroke="#93c5fd" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      title: "Research Mode",
      desc: "Type any topic. Arxio searches the web, synthesises sources, and generates a full research document and 15-slide deck.",
      tag: "No PDF needed",
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="9.5" cy="9.5" r="6" stroke="#2563eb" strokeWidth="1.75" />
          <path d="M14 14l5 5" stroke="#2563eb" strokeWidth="1.75" strokeLinecap="round" />
          <path d="M7 9.5h5M9.5 7v5" stroke="#93c5fd" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-24 px-5 md:px-8 bg-surface">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="text-center mb-14">
          <p className="text-[10px] font-bold text-brand uppercase tracking-[0.12em] mb-3">What you get</p>
          <h2 className="font-display font-extrabold text-[38px] md:text-[44px] tracking-[-0.03em] text-ink leading-tight">
            Everything for your presentation.
            <br />
            Nothing unnecessary.
          </h2>
        </FadeIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.07}>
              <div className="bg-white rounded-2xl border border-border p-6 h-full hover:border-brand-muted hover:shadow-xl hover:shadow-brand/5 transition-all duration-300 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 bg-brand-light rounded-xl flex items-center justify-center">{f.icon}</div>
                  {f.tag && (
                    <span className="text-[10px] font-bold text-brand bg-brand-light border border-brand-muted px-2 py-0.5 rounded-full uppercase tracking-wide whitespace-nowrap">
                      {f.tag}
                    </span>
                  )}
                </div>
                <h3 className="font-display font-bold text-[15px] text-ink mb-2 tracking-[-0.02em]">{f.title}</h3>
                <p className="text-[13px] text-muted leading-relaxed">{f.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

const CTA_MAP = {
  free: "Get started free",
  student: "Start free trial",
  pro: "Start free trial",
  scholar: "Start free trial",
};


function Pricing() {
  const [plans, setPlans] = useState(PLANS_DATA);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/subscription/plans`)
      .then((r) => r.json())
      .then((res) => { if (res.success) setPlans(res.data.plans); })
      .catch(() => {});
  }, []);

  return (
    <section id="pricing" className="py-24 px-5 md:px-8">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="text-center mb-14">
          <p className="text-[10px] font-bold text-brand uppercase tracking-[0.12em] mb-3">Pricing</p>
          <h2 className="font-display font-extrabold text-[38px] md:text-[44px] tracking-[-0.03em] text-ink leading-tight">
            Start free. Upgrade when ready.
          </h2>
          <p className="text-[16px] text-muted mt-4">No card required. Cancel anytime.</p>
        </FadeIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
            {plans.map((p, i) => (
              <FadeIn key={p.tier} delay={i * 0.08} className="h-full">
                <div
                  className={`relative rounded-2xl p-6 flex flex-col h-full ${
                    p.highlight
                      ? "bg-brand border-2 border-brand shadow-2xl shadow-brand/25"
                      : "bg-white border border-border"
                  }`}
                >
                  {p.highlight && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-white text-brand text-[10px] font-bold px-3 py-1 rounded-full shadow-md border border-brand-muted uppercase tracking-widest whitespace-nowrap">
                      Most Popular
                    </div>
                  )}

                  <div className="mb-6">
                    <p className={`font-display font-bold text-[12px] tracking-widest uppercase mb-1.5 ${p.highlight ? "text-blue-200" : "text-muted"}`}>
                      {p.name}
                    </p>
                    <div className="flex items-baseline gap-0.5 mb-2">
                      <span className={`font-display font-extrabold text-[38px] tracking-[-0.04em] leading-none ${p.highlight ? "text-white" : "text-ink"}`}>
                        {p.price === 0 ? "Free" : `$${p.price}`}
                      </span>
                      {p.price > 0 && (
                        <span className={`text-sm ml-0.5 ${p.highlight ? "text-blue-200" : "text-subtle"}`}>/mo</span>
                      )}
                    </div>
                    <p className={`text-[12px] leading-relaxed ${p.highlight ? "text-blue-200" : "text-subtle"}`}>{p.tagline}</p>
                  </div>

                  <ul className="space-y-2.5 mb-6 flex-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <span className={`mt-0.5 shrink-0 ${p.highlight ? "text-blue-200" : "text-brand"}`}>
                          <IconCheck size={14} />
                        </span>
                        <span className={`text-[13px] leading-snug ${p.highlight ? "text-blue-50" : "text-muted"}`}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <CTAButton
                    className={`w-full py-2.5 rounded-xl text-[13px] font-semibold text-center transition-all ${
                      p.highlight
                        ? "bg-white text-brand hover:bg-brand-light"
                        : "bg-surface text-ink hover:bg-brand-light hover:text-brand border border-border"
                    }`}
                  >
                    {CTA_MAP[p.tier] ?? "Get started"}
                  </CTAButton>
                </div>
              </FadeIn>
            ))}
          </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-20 px-5 md:px-8">
      <FadeIn>
        <div className="max-w-3xl mx-auto bg-ink rounded-3xl p-14 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-brand/25 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-brand/10 blur-3xl rounded-full pointer-events-none" />

          <div className="relative">
            <p className="text-[10px] font-bold text-brand uppercase tracking-[0.14em] mb-4">Start tonight</p>
            <h2 className="font-display font-extrabold text-[36px] md:text-[44px] leading-[1.1] tracking-[-0.04em] text-white mb-5">
              Your next presentation
              <br />
              is already written.
            </h2>
            <p className="text-subtle text-[15px] mb-8 max-w-sm mx-auto">
              Upload your paper now. Be done before midnight.
            </p>
            <CTAButton className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold text-sm px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-brand/30 hover:-translate-y-0.5">
              Try free — no card needed
              <IconArrow />
            </CTAButton>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border py-10 px-5 md:px-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <p className="font-display font-bold text-[18px] text-ink tracking-[-0.03em]">Arxio</p>
          <p className="text-[11px] text-subtle mt-0.5">Vision. Clarity. Insight.</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-sm text-muted">
          <a href="#how-it-works" className="hover:text-ink transition-colors">How it works</a>
          <Link href="/pricing" className="hover:text-ink transition-colors">Pricing</Link>
          <Link href="/vision" className="hover:text-ink transition-colors">Vision</Link>
          <Link href="/terms" className="hover:text-ink transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-ink transition-colors">Privacy</Link>
          <Link href="/refund" className="hover:text-ink transition-colors">Refunds</Link>
          <CTAButton className="hover:text-ink transition-colors">Sign in</CTAButton>
        </div>

        <p className="text-[11px] text-subtle">© 2026 Arxio. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default function Page() {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <ModalCtx.Provider value={() => setModalOpen(true)}>
      <main>
        <Navbar />
        <Hero />
        <TrustStrip />
        <HowItWorks />
        <Outputs />
        <Pricing />
        <FinalCTA />
        <Footer />
      </main>
      <ComingSoonModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </ModalCtx.Provider>
  );
}
