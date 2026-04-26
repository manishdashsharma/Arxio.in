"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogoMark } from "./Logo";

export default function ComingSoonModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-200 flex items-center justify-center px-5"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-ink/70 backdrop-blur-md" />

          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 bg-ink" />
            <div className="absolute -top-20 -left-20 w-72 h-72 bg-brand/25 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-brand/15 blur-3xl rounded-full pointer-events-none" />

            <div className="relative px-8 pt-10 pb-9 text-center">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-subtle hover:text-white hover:bg-white/10 transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                </svg>
              </button>

              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="inline-flex mb-6"
              >
                <LogoMark size={56} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.4 }}
              >
                <span className="inline-flex items-center gap-1.5 bg-brand/20 border border-brand/30 text-brand text-[10px] font-bold uppercase tracking-[0.14em] px-3 py-1 rounded-full mb-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                  Launching 2026
                </span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22, duration: 0.45 }}
                className="font-display font-extrabold text-[28px] tracking-[-0.04em] text-white leading-tight mb-3"
              >
                We&apos;re building something
                <br />
                <span className="text-brand">special.</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, duration: 0.4 }}
                className="text-[14px] text-subtle leading-relaxed mb-8 max-w-xs mx-auto"
              >
                Thank you for your interest in Arxio. We are actively developing the most powerful research tool ever built for students. We&apos;ll be live very soon.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.34, duration: 0.4 }}
                className="flex flex-col gap-3"
              >
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5">
                  <div className="w-8 h-8 rounded-xl bg-brand/20 flex items-center justify-center shrink-0">
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                      <path d="M8 1l1.8 3.6L14 5.6l-3 2.9.7 4.1L8 10.5l-3.7 2.1.7-4.1-3-2.9 4.2-.6z" stroke="#2563eb" strokeWidth="1.4" strokeLinejoin="round" fill="#2563eb" fillOpacity="0.3"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-[12px] font-semibold text-white">Upload → 15 slides in 10 minutes</p>
                    <p className="text-[11px] text-muted">PDF Mode — coming soon</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5">
                  <div className="w-8 h-8 rounded-xl bg-brand/20 flex items-center justify-center shrink-0">
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="6.5" stroke="#2563eb" strokeWidth="1.4"/>
                      <path d="M5 8h6M8 5v6" stroke="#2563eb" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-[12px] font-semibold text-white">Type topic → full research doc</p>
                    <p className="text-[11px] text-muted">Research Mode — coming soon</p>
                  </div>
                </div>
              </motion.div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.42, duration: 0.35 }}
                onClick={onClose}
                className="mt-7 w-full py-3 rounded-xl bg-brand hover:bg-brand-dark text-[13px] font-semibold text-white transition-all shadow-lg shadow-brand/30"
              >
                Got it — I&apos;ll check back soon
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
