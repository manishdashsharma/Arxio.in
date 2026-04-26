"use client";

import { useState } from "react";
import ComingSoonModal from "./ComingSoonModal";

export default function CTAButton({ children, className }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      <ComingSoonModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
