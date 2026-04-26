import Link from "next/link";
import { LogoWordmark } from "./components/Logo";
import { PLANS_DATA } from "./lib/data";

const JOURNEY_STEPS = [
  {
    title: "Upload the paper",
    description: "Drop your PDF. Arxio reads every section, table, and key finding.",
  },
  {
    title: "Get a complete workspace",
    description: "Overview, key terms, methodology, results, critical analysis, and chat-ready context.",
  },
  {
    title: "Present with confidence",
    description: "Download slides, revise the cheat sheet, practice with Q&A prep, and walk in prepared.",
  },
];

const OUTPUTS = [
  "15-slide presentation",
  "5-slide quick pitch",
  "Cheat sheet",
  "Q&A prep",
  "Presentation script",
  "Flashcards",
];

const PROOF = [
  { value: "10 min", label: "average generation" },
  { value: "15 slides", label: "ready-to-present deck" },
  { value: "3 clicks", label: "upload to workspace" },
];

const USERS = [
  {
    role: "Students",
    pain: "Night-before presentation panic",
    gain: "Upload at 11 PM, present at 9 AM with confidence.",
  },
  {
    role: "Researchers",
    pain: "Long papers with fragmented notes",
    gain: "One structured workspace with summaries and critical insights.",
  },
  {
    role: "Scholars",
    pain: "Citation-heavy, high-stakes work",
    gain: "Scholar plan unlocks deeper research workflows and RAG-ready direction.",
  },
];

const NIGHT_BEFORE = [
  { time: "10:00 PM", without: "Open 50-page paper, feel overwhelmed", withArxio: "Upload the paper to Arxio" },
  { time: "10:30 PM", without: "Still decoding jargon and equations", withArxio: "AI extracts key concepts and methodology" },
  { time: "11:15 PM", without: "Random notes, no structure", withArxio: "Slides, cheat sheet, and Q&A are ready" },
  { time: "12:00 AM", without: "Still building slides manually", withArxio: "Rehearse with script and flashcards" },
  { time: "09:00 AM", without: "Present with uncertainty", withArxio: "Present with confidence" },
];

const FIRST_LOOK = [
  {
    title: "Upload screen clarity",
    subtitle: "One action. Zero confusion.",
    bullets: ["Large drop zone", "File checks in 1 second", "Single generate button"],
    tone: "from-brand/20 to-brand/5",
  },
  {
    title: "Live progress experience",
    subtitle: "No blank waiting state.",
    bullets: ["Step-by-step status", "Visible progress bar", "Clear finish signal"],
    tone: "from-[#16a34a]/20 to-[#16a34a]/5",
  },
  {
    title: "Workspace confidence",
    subtitle: "Everything in one place.",
    bullets: ["Outputs sidebar", "Inline preview pane", "Chat + download controls"],
    tone: "from-[#7c3aed]/20 to-[#7c3aed]/5",
  },
];

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 7h10M8.5 3.5 12 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-white">
      <div className="absolute inset-0 hero-grid opacity-40" />
      <div className="absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-brand/15 blur-3xl" />
      <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-5 pb-20 pt-28 md:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="mb-4 inline-flex items-center rounded-full border border-brand-muted bg-brand-light px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand">
            Research, simplified
          </p>
          <h1 className="font-display text-5xl font-extrabold leading-[1.05] tracking-[-0.04em] text-ink md:text-6xl">
            Upload tonight.
            <br />
            Present tomorrow.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Arxio turns dense papers into a full presentation workspace in minutes, so students, researchers, and scholars spend less time stressing and more time learning.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition hover:-translate-y-0.5 hover:bg-brand-dark"
            >
              Start free
              <ArrowIcon />
            </Link>
            <a
              href="#journey"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:border-brand-muted hover:bg-surface"
            >
              See user journey
            </a>
          </div>
          <div className="mt-9 grid max-w-lg grid-cols-3 gap-6 border-t border-border pt-6">
            {PROOF.map((item) => (
              <div key={item.label}>
                <p className="font-display text-2xl font-bold tracking-tight text-ink">{item.value}</p>
                <p className="mt-1 text-xs text-subtle">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-white p-6 shadow-xl shadow-brand/10">
          <div className="mb-5 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#fc635d]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#fdbc40]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#34c749]" />
            <span className="ml-auto text-xs text-subtle">arxio.in</span>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-xs font-semibold text-subtle">Uploaded</p>
            <p className="mt-1 text-sm font-semibold text-ink">lane_detection_vilds.pdf</p>
            <p className="mt-1 text-xs text-muted">48 pages • 2.1 MB</p>
          </div>
          <div className="mt-4 rounded-2xl border border-brand-muted bg-brand-light p-4">
            <p className="text-xs font-semibold text-brand">Workspace ready</p>
            <ul className="mt-3 grid grid-cols-2 gap-2 text-xs font-medium text-ink">
              {OUTPUTS.slice(0, 4).map((item) => (
                <li key={item} className="rounded-lg border border-brand-muted bg-white px-2.5 py-2">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-4 text-xs text-muted">From upload to complete workspace, typically under 10 minutes.</p>
        </div>
      </div>
    </section>
  );
}

function UserJourney() {
  return (
    <section id="journey" className="mx-auto w-full max-w-6xl px-5 py-20 md:px-8">
      <div className="mb-12 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-brand">Product journey</p>
        <h2 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.03em] text-ink md:text-5xl">
          Built for real deadlines.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted">
          The flow is intentionally simple: one clear action per screen, visible progress, and outputs that are immediately usable.
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {JOURNEY_STEPS.map((step, idx) => (
          <article key={step.title} className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <p className="font-display text-4xl font-bold text-brand-muted">{String(idx + 1).padStart(2, "0")}</p>
            <h3 className="mt-4 font-display text-xl font-bold text-ink">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{step.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function NightBeforeComparison() {
  return (
    <section className="border-y border-border bg-white py-20">
      <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
        <div className="mb-10 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-brand">Reality check</p>
          <h2 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.03em] text-ink md:text-5xl">
            The night before.
            <br />
            With and without Arxio.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted">
            This is the exact user journey we optimize for: less panic, more preparedness, better outcomes.
          </p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="grid grid-cols-[120px_1fr_1fr] bg-white text-xs font-semibold uppercase tracking-wider text-subtle">
            <div className="border-r border-border px-4 py-3">Time</div>
            <div className="border-r border-border px-4 py-3">Without Arxio</div>
            <div className="px-4 py-3 text-brand">With Arxio</div>
          </div>
          {NIGHT_BEFORE.map((row, idx) => (
            <div key={row.time} className={`grid grid-cols-[120px_1fr_1fr] ${idx % 2 === 0 ? "bg-surface" : "bg-white"}`}>
              <div className="border-r border-t border-border px-4 py-4 text-xs font-semibold text-ink">{row.time}</div>
              <div className="border-r border-t border-border px-4 py-4 text-sm text-muted">{row.without}</div>
              <div className="border-t border-border px-4 py-4 text-sm font-medium text-ink">{row.withArxio}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OutputsSection() {
  return (
    <section className="border-y border-border bg-surface py-20">
      <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-brand">Output quality</p>
            <h2 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.03em] text-ink">
              Not a summary.
              <br />
              A full preparation kit.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
              Arxio creates practical outputs for presentation day, viva prep, and revision. Everything is saved in your library and ready when you return.
            </p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {OUTPUTS.map((item) => (
              <li key={item} className="flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-3 text-sm font-semibold text-ink">
                <span className="text-brand">
                  <CheckIcon />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function FirstImpressionSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-20 md:px-8">
      <div className="mb-10 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-brand">What users notice first</p>
        <h2 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.03em] text-ink md:text-5xl">
          Eye-catching, but purposeful.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted">
          The interface is designed to immediately answer three questions: What do I do now? Is it working? Am I ready?
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {FIRST_LOOK.map((item) => (
          <article key={item.title} className="relative overflow-hidden rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div className={`pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-linear-to-br ${item.tone} blur-2xl`} />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-subtle">First 30 seconds</p>
              <h3 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink">{item.title}</h3>
              <p className="mt-1 text-sm text-muted">{item.subtitle}</p>
              <ul className="mt-4 space-y-2">
                {item.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-sm font-medium text-ink">
                    <span className="text-brand">
                      <CheckIcon />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function VisualBreak() {
  return (
    <section className="border-y border-border bg-ink py-14">
      <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
        <div className="grid items-center gap-8 md:grid-cols-[1fr_auto_1fr]">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-subtle">Before</p>
            <p className="mt-2 font-display text-2xl font-bold text-white">Scattered notes, uncertain slides, last-minute stress</p>
          </div>
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-brand text-white shadow-lg shadow-brand/40">
            <ArrowIcon />
          </div>
          <div className="rounded-2xl border border-brand/40 bg-brand/15 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-100">After</p>
            <p className="mt-2 font-display text-2xl font-bold text-white">Structured workspace, polished deck, confident delivery</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhoItsFor() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-20 md:px-8">
      <div className="mb-10 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-brand">Who it serves</p>
        <h2 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.03em] text-ink md:text-5xl">
          Different users.
          <br />
          One calm workflow.
        </h2>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {USERS.map((user) => (
          <article key={user.role} className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <h3 className="font-display text-xl font-bold text-ink">{user.role}</h3>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-subtle">Today&apos;s pain</p>
            <p className="mt-1 text-sm text-muted">{user.pain}</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-brand">What Arxio gives</p>
            <p className="mt-1 text-sm text-ink">{user.gain}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function PricingPreview() {
  const plans = PLANS_DATA.map((p) => ({
    name: p.name,
    price: p.price,
    tagline: p.tagline,
    highlight: p.highlight,
  }));

  return (
    <section id="pricing" className="border-y border-border bg-surface py-20">
      <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
        <div className="mb-10 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-brand">Pricing</p>
          <h2 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.03em] text-ink md:text-5xl">
            Start free. Scale as you grow.
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`rounded-2xl border p-5 ${
                plan.highlight
                  ? "border-brand bg-brand text-white shadow-xl shadow-brand/30"
                  : "border-border bg-white text-ink"
              }`}
            >
              <p className={`text-[11px] font-semibold uppercase tracking-wider ${plan.highlight ? "text-blue-100" : "text-subtle"}`}>
                {plan.name}
              </p>
              <p className="mt-2 font-display text-4xl font-extrabold tracking-[-0.03em]">
                {plan.price === 0 ? "Free" : `$${plan.price}`}
                {plan.price > 0 ? <span className="ml-1 text-sm font-semibold">/mo</span> : null}
              </p>
              <p className={`mt-3 text-xs leading-relaxed ${plan.highlight ? "text-blue-100" : "text-muted"}`}>{plan.tagline}</p>
            </article>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/pricing" className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:border-brand-muted hover:bg-brand-light hover:text-brand">
            Compare all features
            <ArrowIcon />
          </Link>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-20 md:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-ink px-8 py-14 text-center md:px-14">
        <div className="pointer-events-none absolute -left-12 top-0 h-56 w-56 rounded-full bg-brand/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 right-0 h-56 w-56 rounded-full bg-brand/20 blur-3xl" />
        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-brand">Ready to begin</p>
          <h2 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.03em] text-white md:text-5xl">
            Break the panic loop.
            <br />
            Prepare smarter with Arxio.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-subtle">
            Your paper should not take your entire night. Let the workflow run for you, so your energy goes into understanding and presenting.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/pricing" className="rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark">
              Start free now
            </Link>
            <Link href="/vision" className="rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              Read the vision
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-white py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-5 px-5 text-sm text-muted md:flex-row md:px-8">
        <LogoWordmark size={26} />
        <nav className="flex flex-wrap items-center justify-center gap-5">
          <Link href="/pricing" className="transition hover:text-ink">Pricing</Link>
          <Link href="/vision" className="transition hover:text-ink">Vision</Link>
          <Link href="/terms" className="transition hover:text-ink">Terms</Link>
          <Link href="/privacy" className="transition hover:text-ink">Privacy</Link>
          <Link href="/refund" className="transition hover:text-ink">Refund</Link>
        </nav>
        <p className="text-xs text-subtle">© 2026 Arxio</p>
      </div>
    </footer>
  );
}

export default function Page() {
  return (
    <main>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-border/70 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 md:px-8">
          <LogoWordmark size={28} />
          <div className="flex items-center gap-2">
            <Link href="/pricing" className="rounded-lg px-4 py-2 text-sm font-medium text-muted transition hover:bg-surface hover:text-ink">
              Pricing
            </Link>
            <Link href="/vision" className="rounded-lg px-4 py-2 text-sm font-medium text-muted transition hover:bg-surface hover:text-ink">
              Vision
            </Link>
            <Link href="/pricing" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark">
              Try free
            </Link>
          </div>
        </div>
      </header>
      <Hero />
      <NightBeforeComparison />
      <UserJourney />
      <FirstImpressionSection />
      <VisualBreak />
      <OutputsSection />
      <WhoItsFor />
      <PricingPreview />
      <FinalCta />
      <Footer />
    </main>
  );
}
