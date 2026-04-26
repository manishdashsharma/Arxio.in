"use client";

import { useState } from "react";
import ComingSoonModal from "./ComingSoonModal";

export default function NavCTAs() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-muted hover:text-ink px-4 py-2 rounded-lg hover:bg-surface transition-all"
      >
        Sign in
      </button>
      <button
        onClick={() => setOpen(true)}
        className="text-sm font-semibold text-white bg-brand hover:bg-brand-dark px-5 py-2 rounded-lg transition-all"
      >
        Try free
      </button>
      <ComingSoonModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
