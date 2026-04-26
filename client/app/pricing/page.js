"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PLANS_DATA } from "../lib/data";
import { LogoWordmark } from "../components/Logo";
import ComingSoonModal from "../components/ComingSoonModal";

function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" fill="#eff6ff" />
      <path d="M5 8l2.5 2.5L11 5.5" stroke="#2563eb" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconMinus() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M5 8h6" stroke="#cbd5e1" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

const FEATURE_GROUPS = [
  {
    label: "Usage",
    rows: [
      {
        label: "PDFs per month",
        key: "pdfs_per_month",
        format: (v) => (v === -1 ? "Unlimited" : v),
      },
      {
        label: "Research topics per month",
        key: "research_per_month",
        format: (v) => (v === -1 ? "Unlimited" : v),
      },
      {
        label: "Chat messages per month",
        key: "chat_messages",
        format: (v) => (v === -1 ? "Unlimited" : v),
      },
      {
        label: "History",
        key: "history_days",
        format: (v) => (v === -1 ? "Forever" : `${v} days`),
      },
    ],
  },
  {
    label: "Exports & Presentation",
    rows: [
      { label: "PPT export (15-slide & 5-slide)", key: "ppt", format: "bool" },
      { label: "In-browser presentation mode", key: "presentation_mode", format: "bool" },
      { label: "Share workspace links", key: "share_links", format: "bool" },
    ],
  },
  {
    label: "Advanced Features",
    rows: [
      { label: "Paper comparison mode", key: "comparison", format: "bool" },
      { label: "Smart semantic search (RAG)", key: "rag", format: "bool" },
      { label: "Academic mode", key: "academic_mode", format: "bool" },
      { label: "GPT-4o — full model", key: "priority_ai", format: "bool" },
    ],
  },
];

function CellValue({ value, format, highlight }) {
  if (format === "bool") {
    return value ? (
      <span className="flex justify-center"><IconCheck /></span>
    ) : (
      <span className="flex justify-center"><IconMinus /></span>
    );
  }
  const text = typeof format === "function" ? format(value) : value;
  return (
    <span className={`text-sm font-semibold ${
      text === "Unlimited" || text === "Forever"
        ? highlight ? "text-white" : "text-brand"
        : highlight ? "text-white" : "text-ink"
    }`}>
      {text}
    </span>
  );
}

function Skeleton() {
  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-16 animate-pulse">
      <div className="h-10 w-64 bg-surface rounded-xl mx-auto mb-4" />
      <div className="h-5 w-48 bg-surface rounded-lg mx-auto mb-12" />
      <div className="h-96 bg-surface rounded-2xl" />
    </div>
  );
}

export default function PricingPage() {
  const [plans, setPlans] = useState(PLANS_DATA);
  const [loading, setLoading] = useState(false);
  const [annual, setAnnual] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = () => setModalOpen(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/subscription/plans`)
      .then((r) => r.json())
      .then((res) => { if (res.success) setPlans(res.data.plans); })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-border bg-white/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <Link href="/"><LogoWordmark size={30} /></Link>
          <div className="flex items-center gap-2">
            <button onClick={openModal} className="text-sm font-medium text-muted hover:text-ink px-4 py-2 rounded-lg hover:bg-surface transition-all">
              Sign in
            </button>
            <button onClick={openModal} className="text-sm font-semibold text-white bg-brand hover:bg-brand-dark px-5 py-2 rounded-lg transition-all">
              Try free
            </button>
          </div>
        </div>
      </nav>

      {loading ? <Skeleton /> : (
        <main className="max-w-6xl mx-auto px-5 md:px-8 py-16">
          <div className="text-center mb-14">
            <p className="text-[10px] font-bold text-brand uppercase tracking-[0.14em] mb-3">Pricing</p>
            <h1 className="font-display font-extrabold text-[42px] md:text-[52px] tracking-[-0.04em] text-ink leading-tight mb-4">
              Simple, transparent pricing.
            </h1>
            <p className="text-[16px] text-muted max-w-md mx-auto">
              Start free. No card required. Upgrade only when you need more.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {plans.map((p) => (
              <div
                key={p.tier}
                className={`relative rounded-2xl p-5 text-center ${
                  p.highlight
                    ? "bg-brand border-2 border-brand shadow-xl shadow-brand/20"
                    : "bg-white border border-border"
                }`}
              >
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-brand text-[9px] font-bold px-2.5 py-0.5 rounded-full border border-brand-muted uppercase tracking-widest whitespace-nowrap shadow-sm">
                    Most Popular
                  </div>
                )}
                <p className={`text-[11px] font-bold uppercase tracking-widest mb-2 ${p.highlight ? "text-blue-200" : "text-muted"}`}>
                  {p.name}
                </p>
                <div className="flex items-baseline justify-center gap-0.5 mb-1">
                  <span className={`font-display font-extrabold text-[32px] tracking-[-0.04em] leading-none ${p.highlight ? "text-white" : "text-ink"}`}>
                    {p.price === 0 ? "Free" : `$${p.price}`}
                  </span>
                  {p.price > 0 && (
                    <span className={`text-xs mb-1 ${p.highlight ? "text-blue-200" : "text-subtle"}`}>/mo</span>
                  )}
                </div>
                <p className={`text-[11px] leading-relaxed mb-4 ${p.highlight ? "text-blue-200" : "text-subtle"}`}>
                  {p.tagline}
                </p>
                <button
                  onClick={openModal}
                  className={`block w-full py-2 rounded-xl text-[12px] font-semibold text-center transition-all ${
                    p.highlight
                      ? "bg-white text-brand hover:bg-brand-light"
                      : "bg-surface text-ink hover:bg-brand-light hover:text-brand border border-border"
                  }`}
                >
                  {p.price === 0 ? "Get started free" : "Start free trial"}
                </button>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border overflow-hidden">
            <div className="grid grid-cols-5 bg-surface border-b border-border">
              <div className="col-span-1 px-5 py-4">
                <p className="text-[11px] font-bold text-subtle uppercase tracking-widest">Features</p>
              </div>
              {plans.map((p) => (
                <div
                  key={p.tier}
                  className={`px-4 py-4 text-center ${p.highlight ? "bg-brand" : ""}`}
                >
                  <p className={`text-[12px] font-bold uppercase tracking-widest ${p.highlight ? "text-white" : "text-ink"}`}>
                    {p.name}
                  </p>
                </div>
              ))}
            </div>

            {FEATURE_GROUPS.map((group, gi) => (
              <div key={group.label}>
                <div className="grid grid-cols-5 bg-[#fafbfc] border-b border-border">
                  <div className="col-span-5 px-5 py-2.5">
                    <p className="text-[10px] font-bold text-brand uppercase tracking-widest">{group.label}</p>
                  </div>
                </div>

                {group.rows.map((row, ri) => {
                  const isLast = gi === FEATURE_GROUPS.length - 1 && ri === group.rows.length - 1;
                  return (
                    <div
                      key={row.key}
                      className={`grid grid-cols-5 hover:bg-[#fafbfc] transition-colors ${!isLast ? "border-b border-border" : ""}`}
                    >
                      <div className="col-span-1 px-5 py-4 flex items-center">
                        <p className="text-[13px] font-medium text-ink leading-snug">{row.label}</p>
                      </div>
                      {plans.map((p) => (
                        <div
                          key={p.tier}
                          className={`px-4 py-4 flex items-center justify-center ${p.highlight ? "bg-brand/5" : ""}`}
                        >
                          <CellValue
                            value={p.limits[row.key]}
                            format={row.format}
                            highlight={p.highlight}
                          />
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="mt-16 text-center bg-ink rounded-3xl p-14 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-brand/20 blur-3xl rounded-full pointer-events-none" />
            <div className="relative">
              <p className="text-[10px] font-bold text-brand uppercase tracking-[0.14em] mb-3">Get started</p>
              <h2 className="font-display font-extrabold text-[34px] tracking-[-0.04em] text-white mb-4">
                Start free. Upgrade anytime.
              </h2>
              <p className="text-subtle mb-7 max-w-sm mx-auto text-[15px]">
                No credit card required. Your first 3 papers are on us.
              </p>
              <button
                onClick={openModal}
                className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold text-sm px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-brand/30"
              >
                Try free — no card needed
              </button>
            </div>
          </div>
        </main>
      )}

      <footer className="border-t border-border py-8 px-5 md:px-8 mt-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/"><LogoWordmark size={26} /></Link>
          <p className="text-[11px] text-subtle">© 2026 Arxio. All rights reserved.</p>
          <Link href="/" className="text-sm text-muted hover:text-ink transition-colors">← Back to home</Link>
        </div>
      </footer>
      <ComingSoonModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
