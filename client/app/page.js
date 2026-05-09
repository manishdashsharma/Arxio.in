import Link from "next/link";
import { LogoWordmark } from "./components/Logo";
import { PLANS_DATA } from "./lib/data";

const APP_BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
const DEFAULT_APP_ORIGIN = process.env.NODE_ENV === "development" ? "http://localhost:5173" : "";
const APP_ORIGIN = APP_BASE_URL || DEFAULT_APP_ORIGIN;
const APP_SIGNIN_PATH = process.env.NEXT_PUBLIC_APP_SIGNIN_PATH || "/signin";
const APP_SIGNUP_PATH = process.env.NEXT_PUBLIC_APP_SIGNUP_PATH || "/signup";

function resolveAppUrl(path) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return APP_ORIGIN ? `${APP_ORIGIN}${normalized}` : normalized;
}

const APP_SIGNIN_URL = resolveAppUrl(APP_SIGNIN_PATH);
const APP_SIGNUP_URL = resolveAppUrl(APP_SIGNUP_PATH);

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

const TRUST_STRIP = [
  "Trusted by student labs",
  "Built for researchers",
  "Enterprise-ready security model",
  "Outputs in minutes, not hours",
  "Presentation-first workflow",
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
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-white to-slate-50/60">
      <div className="absolute inset-0 hero-grid opacity-30" />
      <div className="hero-aurora absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-brand/20 blur-3xl" />
      <div className="hero-aurora absolute -right-20 top-10 h-72 w-72 rounded-full bg-indigo-200/30 blur-3xl" />
      <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 pb-16 pt-24 sm:px-5 md:px-8 md:pb-20 md:pt-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="wow-rise">
          <p className="mb-4 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-700">
            Student-first research workflow
          </p>
          <h1 className="font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] text-ink sm:text-5xl md:text-6xl">
            Upload in minutes.
            <br />
            Present like a pro.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Arxio turns dense papers into a complete preparation workspace with slides, Q&A, notes, and script, all in one elegant flow.
          </p>
          <div className="mt-8 flex flex-wrap gap-2.5 sm:gap-3">
            <Link
              href={APP_SIGNUP_URL}
              className="cta-magnetic cta-primary inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/25 sm:px-6"
            >
              Start free
              <ArrowIcon />
            </Link>
            <Link
              href={APP_SIGNIN_URL}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:border-blue-200 hover:bg-blue-50 sm:px-6"
            >
              Sign in
            </Link>
          </div>
          <div className="mt-8 grid max-w-lg grid-cols-3 gap-3 border-t border-border pt-5 sm:mt-9 sm:gap-6 sm:pt-6">
            {PROOF.map((item) => (
              <div key={item.label}>
                <p className="font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">{item.value}</p>
                <p className="mt-1 text-xs text-subtle">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-card-float wow-rise-delay-1 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_45px_rgba(15,23,42,0.1)]">
          <div className="mb-5 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#fc635d]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#fdbc40]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#34c749]" />
            <span className="ml-auto text-xs text-subtle">arxio.in</span>
          </div>
          <div className="workflow-card rounded-2xl border border-slate-200 bg-surface p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-600">Live workflow</p>
              <span className="rounded-full border border-blue-300 bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                Simulation
              </span>
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-900">lane_detection_vilds.pdf</p>
            <p className="mt-1 text-xs text-slate-500">48 pages • 2.1 MB • CVPR style paper</p>
            <div className="workflow-progress mt-3 overflow-hidden rounded-full bg-surface-container-high">
              <div className="workflow-progress-fill h-1.5 rounded-full bg-linear-to-r from-brand to-[#60a5fa]" />
            </div>
            <ul className="mt-3 space-y-2 text-xs">
              <li className="workflow-stage workflow-stage-1 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                <span className="font-medium text-slate-700">Upload complete</span>
                <span className="workflow-chip rounded-full border px-2 py-0.5 text-[10px] font-bold">Done</span>
              </li>
              <li className="workflow-stage workflow-stage-2 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                <span className="font-medium text-slate-700">Parsing sections & tables</span>
                <span className="workflow-chip rounded-full border px-2 py-0.5 text-[10px] font-bold">Running</span>
              </li>
              <li className="workflow-stage workflow-stage-3 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                <span className="font-medium text-slate-700">Generating deck + Q&A</span>
                <span className="workflow-chip rounded-full border px-2 py-0.5 text-[10px] font-bold">Queued</span>
              </li>
              <li className="workflow-stage workflow-stage-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                <span className="font-medium text-slate-700">Workspace ready</span>
                <span className="workflow-chip rounded-full border px-2 py-0.5 text-[10px] font-bold">Ready</span>
              </li>
            </ul>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Sections</p>
              <p className="mt-1 text-xs font-semibold text-slate-900">12 extracted</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Slides</p>
              <p className="mt-1 text-xs font-semibold text-slate-900">15 + quick 5</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">ETA</p>
              <p className="mt-1 text-xs font-semibold text-slate-900">&lt; 10 min</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  return (
    <section className="border-y border-border bg-white py-4">
      <div className="marquee-wrap">
        <div className="marquee-track">
          {[...TRUST_STRIP, ...TRUST_STRIP].map((item, idx) => (
            <div key={`${item}-${idx}`} className="inline-flex items-center gap-3 px-6 text-xs uppercase tracking-wider text-subtle">
              <span className="h-1.5 w-1.5 rounded-full bg-brand/80" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function UserJourney() {
  return (
    <section id="journey" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-5 sm:py-20 md:px-8 wow-rise">
      <div className="mb-12 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-brand">Product journey</p>
        <h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.03em] text-ink sm:text-4xl md:text-5xl">
          Built for real deadlines.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted">
          The flow is intentionally simple: one clear action per screen, visible progress, and outputs that are immediately usable.
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {JOURNEY_STEPS.map((step, idx) => (
          <article key={step.title} className={`rounded-2xl border border-border bg-surface-container p-6 shadow-sm wow-rise-delay-${(idx % 3) + 1}`}>
            <p className="font-display text-3xl font-bold text-brand-muted sm:text-4xl">{String(idx + 1).padStart(2, "0")}</p>
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
    <section className="border-y border-border bg-white py-16 sm:py-20 wow-rise">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-5 md:px-8">
        <div className="mb-10 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-brand">Reality check</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.03em] text-ink sm:text-4xl md:text-5xl">
            The night before.
            <br />
            With and without Arxio.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted">
            This is the exact user journey we optimize for: less panic, more preparedness, better outcomes.
          </p>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <div className="min-w-[680px]">
            <div className="grid grid-cols-[120px_1fr_1fr] bg-surface-container text-xs font-semibold uppercase tracking-wider text-subtle">
              <div className="border-r border-border px-4 py-3">Time</div>
              <div className="border-r border-border px-4 py-3">Without Arxio</div>
              <div className="px-4 py-3 text-brand">With Arxio</div>
            </div>
            {NIGHT_BEFORE.map((row, idx) => (
              <div key={row.time} className={`grid grid-cols-[120px_1fr_1fr] ${idx % 2 === 0 ? "bg-surface" : "bg-surface-container"}`}>
                <div className="border-r border-t border-border px-4 py-4 text-xs font-semibold text-ink">{row.time}</div>
                <div className="border-r border-t border-border px-4 py-4 text-sm text-muted">{row.without}</div>
                <div className="border-t border-border px-4 py-4 text-sm font-medium text-ink">{row.withArxio}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function OutputsSection() {
  return (
    <section className="border-y border-border bg-gradient-to-b from-white to-slate-50/55 py-16 sm:py-20 wow-rise">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-5 md:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-brand">Output quality</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.03em] text-ink sm:text-4xl">
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
              <li key={item} className="flex items-center gap-2 rounded-xl border border-border bg-surface-container px-4 py-3 text-sm font-semibold text-ink">
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
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-5 sm:py-20 md:px-8 wow-rise">
      <div className="mb-10 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-brand">What users notice first</p>
        <h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.03em] text-ink sm:text-4xl md:text-5xl">
          Eye-catching, but purposeful.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted">
          The interface is designed to immediately answer three questions: What do I do now? Is it working? Am I ready?
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {FIRST_LOOK.map((item) => (
          <article key={item.title} className="relative overflow-hidden rounded-2xl border border-border bg-surface-container p-6 shadow-sm wow-rise-delay-1">
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
    <section className="border-y border-border bg-white py-14 wow-rise">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-5 md:px-8">
        <div className="grid items-center gap-8 md:grid-cols-[1fr_auto_1fr]">
          <div className="rounded-2xl border border-border bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-subtle">Before</p>
            <p className="mt-2 font-display text-2xl font-bold text-ink">Scattered notes, uncertain slides, last-minute stress</p>
          </div>
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-brand text-white shadow-lg shadow-brand/40">
            <ArrowIcon />
          </div>
          <div className="rounded-2xl border border-brand/30 bg-blue-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted">After</p>
            <p className="mt-2 font-display text-2xl font-bold text-ink">Structured workspace, polished deck, confident delivery</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhoItsFor() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-5 sm:py-20 md:px-8 wow-rise">
      <div className="mb-10 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-brand">Who it serves</p>
        <h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.03em] text-ink sm:text-4xl md:text-5xl">
          Different users.
          <br />
          One calm workflow.
        </h2>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {USERS.map((user) => (
          <article key={user.role} className="rounded-2xl border border-border bg-surface-container p-6 shadow-sm wow-rise-delay-2">
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
    <section id="pricing" className="border-y border-border bg-gradient-to-b from-white to-slate-50/55 py-16 sm:py-20 wow-rise">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-5 md:px-8">
        <div className="mb-10 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-brand">Pricing</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.03em] text-ink sm:text-4xl md:text-5xl">
            Start free. Scale as you grow.
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`rounded-2xl border p-5 ${
                plan.highlight
                  ? "border-blue-500 bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-xl shadow-blue-500/30"
                  : "border-border bg-white text-ink"
              } wow-rise-delay-3`}
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
          <Link href="/pricing" className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-container px-5 py-3 text-sm font-semibold text-ink transition hover:border-brand-muted hover:bg-brand-light hover:text-brand">
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
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-5 sm:py-20 md:px-8 wow-rise">
      <div className="relative overflow-hidden rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-5 py-10 text-center sm:px-8 sm:py-14 md:px-14">
        <div className="hero-aurora pointer-events-none absolute -left-12 top-0 h-56 w-56 rounded-full bg-brand/30 blur-3xl" />
        <div className="hero-aurora pointer-events-none absolute -bottom-10 right-0 h-56 w-56 rounded-full bg-brand/20 blur-3xl" />
        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-700">Ready to begin</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.03em] text-ink sm:text-4xl md:text-5xl">
            Break the panic loop.
            <br />
            Prepare smarter with Arxio.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-600">
            Your paper should not take your entire night. Let the workflow run for you, so your energy goes into understanding and presenting.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href={APP_SIGNUP_URL} className="rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark">
              Start free now
            </Link>
            <Link href="/pricing" className="rounded-xl border border-border bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:bg-surface-container">
              Compare plans
            </Link>
            <Link href="/vision" className="rounded-xl border border-border bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:bg-surface-container">
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
    <footer className="border-t border-border bg-surface py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-5 px-5 text-sm text-muted md:flex-row md:px-8">
        <LogoWordmark size={26} tone="dark" />
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
      <header className="fixed inset-x-0 top-0 z-40 border-b border-border/80 bg-white/92 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 md:px-8">
          <LogoWordmark size={28} tone="dark" />
          <div className="flex items-center gap-2">
            <Link href="/pricing" className="hidden rounded-lg px-4 py-2 text-sm font-medium text-muted transition hover:bg-surface hover:text-ink sm:inline-flex">
              Pricing
            </Link>
            <Link href="/vision" className="hidden rounded-lg px-4 py-2 text-sm font-medium text-muted transition hover:bg-surface hover:text-ink md:inline-flex">
              Vision
            </Link>
            <Link href={APP_SIGNIN_URL} className="rounded-lg px-3 py-2 text-xs font-medium text-muted transition hover:bg-slate-100 hover:text-ink sm:px-4 sm:text-sm">
              Sign in
            </Link>
            <Link href={APP_SIGNUP_URL} className="cta-magnetic cta-primary rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white sm:px-4 sm:text-sm">
              Try free
            </Link>
          </div>
        </div>
      </header>
      <Hero />
      <TrustStrip />
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
