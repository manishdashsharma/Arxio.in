import Link from "next/link";
import { LogoWordmark } from "./Logo";
import NavCTAs from "./NavCTAs";

export default function LegalLayout({ title, subtitle, lastUpdated, children }) {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-border bg-white/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <Link href="/"><LogoWordmark size={30} /></Link>
          <div className="flex items-center gap-2">
            <NavCTAs />
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-5 md:px-8 py-16">
        <div className="mb-12">
          <p className="text-[10px] font-bold text-brand uppercase tracking-[0.14em] mb-3">Legal</p>
          <h1 className="font-display font-extrabold text-[38px] md:text-[46px] tracking-[-0.04em] text-ink leading-tight mb-3">
            {title}
          </h1>
          {subtitle && <p className="text-[16px] text-muted mb-4">{subtitle}</p>}
          <div className="flex items-center gap-4 text-[12px] text-subtle">
            <span>Last updated: {lastUpdated}</span>
            <span>·</span>
            <span>arxio.in</span>
          </div>
          <div className="mt-6 h-px bg-border" />
        </div>

        <div className="prose-arxio">
          {children}
        </div>
      </main>

      <footer className="border-t border-border py-8 px-5 md:px-8 mt-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted">
          <Link href="/"><LogoWordmark size={26} /></Link>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="/terms" className="hover:text-ink transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-ink transition-colors">Privacy</Link>
            <Link href="/refund" className="hover:text-ink transition-colors">Refunds</Link>
            <Link href="/pricing" className="hover:text-ink transition-colors">Pricing</Link>
          </div>
          <p className="text-[11px] text-subtle">© 2026 Arxio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
