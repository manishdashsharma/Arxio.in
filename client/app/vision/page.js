import Link from "next/link";
import Image from "next/image";
import { LogoWordmark } from "../components/Logo";
import NavCTAs from "../components/NavCTAs";
import CTAButton from "../components/CTAButton";

export const metadata = {
  title: "Our Vision — Arxio",
  description: "Why we built Arxio. The problem, the magic moment, and where we are going.",
};

function Section({ label, children }) {
  return (
    <div className="mb-16">
      <p className="text-[10px] font-bold text-brand uppercase tracking-[0.14em] mb-6">{label}</p>
      {children}
    </div>
  );
}

function Timeline({ items }) {
  return (
    <div className="space-y-0">
      {items.map((item, i) => (
        <div key={i} className="flex gap-4 group">
          <div className="flex flex-col items-center">
            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${item.accent ? "bg-brand" : "bg-border"}`} />
            {i < items.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
          </div>
          <div className={`pb-5 ${item.accent ? "" : "opacity-60"}`}>
            <p className="text-[11px] font-mono text-subtle mb-0.5">{item.time}</p>
            <p className={`text-[14px] font-medium leading-snug ${item.accent ? "text-ink" : "text-muted"}`}>{item.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function CompareRow({ tool, what, why }) {
  return (
    <div className="grid grid-cols-3 gap-4 py-3.5 border-b border-border last:border-0">
      <p className="text-[13px] font-semibold text-ink">{tool}</p>
      <p className="text-[13px] text-muted">{what}</p>
      <p className="text-[13px] text-muted">{why}</p>
    </div>
  );
}

function UserRow({ user, pain, gives }) {
  return (
    <div className="grid grid-cols-3 gap-4 py-3.5 border-b border-border last:border-0">
      <p className="text-[13px] font-semibold text-ink">{user}</p>
      <p className="text-[13px] text-muted">{pain}</p>
      <p className="text-[13px] text-muted">{gives}</p>
    </div>
  );
}

const BEFORE = [
  { time: "10:00 PM", text: "Gets the research paper assignment", accent: false },
  { time: "10:05 PM", text: "Opens the 50-page IEEE paper. Overwhelmed.", accent: false },
  { time: "10:30 PM", text: "Still on page 8. Doesn't understand half the terms.", accent: false },
  { time: "11:00 PM", text: "Pastes sections into ChatGPT. Gets generic answers.", accent: false },
  { time: "12:00 AM", text: "Opens PowerPoint manually. Starts from scratch.", accent: false },
  { time: "01:30 AM", text: "Has 6 slides. Doesn't know what sir will ask.", accent: false },
  { time: "02:00 AM", text: "Sleeps stressed. Unprepared.", accent: false },
  { time: "09:00 AM", text: "Presentation. It shows.", accent: false },
];

const AFTER = [
  { time: "11:00 PM", text: "Opens Arxio. Uploads IEEE paper.", accent: true },
  { time: "11:03 PM", text: "Arxio finishes. Full workspace ready.", accent: true },
  { time: "11:04 PM", text: "Downloads the presentation. 15 slides. Perfect.", accent: true },
  { time: "11:06 PM", text: "Reads the cheat sheet. Knows every key term.", accent: true },
  { time: "11:08 PM", text: "Reads Q&A prep. Knows what sir will ask.", accent: true },
  { time: "11:10 PM", text: "Closes laptop. Sleeps confidently.", accent: true },
  { time: "09:00 AM", text: "Presentation. Nails it.", accent: true },
  { time: "09:30 AM", text: "Tells 5 friends about Arxio.", accent: true },
];

export default function VisionPage() {
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

        <div className="mb-16">
          <p className="text-[10px] font-bold text-brand uppercase tracking-[0.14em] mb-3">Our Vision</p>
          <h1 className="font-display font-extrabold text-[38px] md:text-[52px] tracking-[-0.04em] text-ink leading-tight mb-5">
            Drishti.
            <br />
            <span className="text-muted font-bold text-[28px] md:text-[36px]">दृष्टि — Vision. Clarity. Insight.</span>
          </h1>
          <p className="text-[17px] text-muted leading-relaxed max-w-xl">
            Research is one of the most important things humans do. We built Arxio because the tools available to students and researchers have not kept up with that importance.
          </p>
          <div className="mt-6 h-px bg-border" />
        </div>

        <Section label="The Problem">
          <p className="text-[15px] text-muted leading-relaxed mb-6">
            Students and researchers are losing hours every day to tasks that should take minutes. Reading a 50-page paper to understand one concept. Building a presentation from a paper they barely had time to read. Searching across five tabs to find one citation. Repeating this every week, every semester, for years.
          </p>
          <p className="text-[15px] text-muted leading-relaxed mb-8">
            The tools that exist — ChatGPT, Gamma, ChatPDF, Notion AI, Perplexity — each solve one piece of the problem. None of them solve it completely. Students are still doing the connective work themselves, by hand, at 2 AM.
          </p>

          <div className="rounded-2xl border border-border overflow-hidden mb-4">
            <div className="grid grid-cols-3 gap-4 px-5 py-3 bg-surface border-b border-border">
              <p className="text-[10px] font-bold text-subtle uppercase tracking-widest">Tool</p>
              <p className="text-[10px] font-bold text-subtle uppercase tracking-widest">What It Does</p>
              <p className="text-[10px] font-bold text-subtle uppercase tracking-widest">Why It Fails</p>
            </div>
            <div className="px-5">
              <CompareRow tool="ChatGPT / Claude" what="Answers questions" why="No structure, no files, no memory" />
              <CompareRow tool="Gamma" what="Makes PPTs" why="Confusing UI, no PDF understanding" />
              <CompareRow tool="ChatPDF" what="Chats with PDF" why="Only chat — no documents, no downloads" />
              <CompareRow tool="Notion AI" what="Writes docs" why="Complex setup, no PDF analysis, no PPT" />
              <CompareRow tool="Perplexity" what="Searches web" why="No document generation, no PDF mode" />
            </div>
          </div>
          <p className="text-[13px] font-semibold text-brand">Nobody has built the complete solution. Until Arxio.</p>
        </Section>

        <Section label="The Magic Moment">
          <p className="text-[15px] text-muted leading-relaxed mb-8">
            Every product has a magic moment — the instant a user understands exactly why it exists and tells someone else. For Arxio, it is ten minutes that change a student's night.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-[11px] font-bold text-muted uppercase tracking-widest mb-4">Before Arxio</p>
              <Timeline items={BEFORE} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-brand uppercase tracking-widest mb-4">With Arxio</p>
              <Timeline items={AFTER} />
            </div>
          </div>

          <div className="bg-brand-light border border-brand-muted rounded-2xl p-5">
            <p className="text-[14px] font-semibold text-brand leading-relaxed">
              That moment at 09:30 AM — "tells 5 friends about Arxio" — is the entire growth engine. When Arxio works, it works so well that users cannot help but share it.
            </p>
          </div>
        </Section>

        <Section label="What Arxio Is">
          <p className="text-[15px] text-muted leading-relaxed mb-5">
            Arxio is not a summariser. Not a chatbot. Not a file generator.
          </p>
          <p className="font-display font-bold text-[22px] text-ink tracking-tight leading-snug mb-5">
            Arxio is a personal research brain — a product so good that students will never want to open a research paper without it.
          </p>
          <p className="text-[15px] text-muted leading-relaxed mb-8">
            Every paper uploaded. Every topic researched. Saved forever. Searchable. Chatatable. Shareable. Your entire academic career, organised and always on.
          </p>

          <div className="space-y-3">
            {[
              { title: "Upload any PDF", desc: "Research paper, book, report, thesis — Arxio reads it completely and builds a full workspace: summaries, concept explainers, methodology breakdowns, Q&A prep, cheat sheets, and downloadable files in every format." },
              { title: "Type any topic", desc: "Arxio searches the web and academic databases, synthesises everything it finds, and generates professional documents with real citations — ready in under 2 minutes." },
              { title: "Your library, forever", desc: "Every paper and every research session is saved permanently. Search across everything. Ask questions across your entire reading history. Come back anytime." },
            ].map((f) => (
              <div key={f.title} className="flex gap-4 p-4 rounded-xl border border-border hover:border-brand-muted hover:bg-brand-light/30 transition-all">
                <div className="w-1.5 rounded-full bg-brand shrink-0 mt-1" style={{ minHeight: "1rem" }} />
                <div>
                  <p className="text-[14px] font-semibold text-ink mb-1">{f.title}</p>
                  <p className="text-[13px] text-muted leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section label="Who It Is For">
          <p className="text-[15px] text-muted leading-relaxed mb-6">
            The core user is a university student — price-sensitive, tech-savvy, and the fastest growth channel because they talk to each other constantly. One student who loves Arxio tells their entire class.
          </p>

          <div className="rounded-2xl border border-border overflow-hidden">
            <div className="grid grid-cols-3 gap-4 px-5 py-3 bg-surface border-b border-border">
              <p className="text-[10px] font-bold text-subtle uppercase tracking-widest">Who</p>
              <p className="text-[10px] font-bold text-subtle uppercase tracking-widest">Their Pain</p>
              <p className="text-[10px] font-bold text-subtle uppercase tracking-widest">What Arxio Gives Them</p>
            </div>
            <div className="px-5">
              <UserRow user="University Students" pain="Can't understand papers; presentations are stressful" gives="Full workspace in minutes, walk in confident" />
              <UserRow user="PhD Researchers" pain="Literature reviews take weeks" gives="Type topic → AI reads 20 papers → full report with citations" />
              <UserRow user="Master's Students" pain="Present papers they barely understand" gives="Complete presentation script + anticipated Q&A" />
              <UserRow user="Professionals" pain="Need to brief teams on complex reports fast" gives="Upload report → executive summary + PPT ready" />
              <UserRow user="Academics" pain="Students arrive unprepared for office hours" gives="Students arrive better prepared; deeper discussions" />
            </div>
          </div>
        </Section>

        <Section label="The Principles We Build By">
          <div className="space-y-4">
            {[
              { n: "01", title: "One action per screen", desc: "The user should never wonder what to do next. Every screen has exactly one primary action." },
              { n: "02", title: "Progress always visible", desc: "The user should never stare at a blank screen wondering if it is working. Every step of generation is shown in real time." },
              { n: "03", title: "Mobile first", desc: "Students are on their phones at 11 PM. If it does not work perfectly on a 390px screen, it does not ship." },
              { n: "04", title: "The user should never need the original paper", desc: "Every output from Arxio must be complete, accurate, and immediately usable without going back to the source." },
              { n: "05", title: "No feature that does not serve the magic moment", desc: "If a feature does not make the workflow faster, simpler, or more impressive, it does not belong in v1." },
            ].map((p) => (
              <div key={p.n} className="flex gap-5 p-5 rounded-xl border border-border">
                <span className="font-mono text-[11px] text-brand font-bold shrink-0 mt-0.5">{p.n}</span>
                <div>
                  <p className="text-[14px] font-semibold text-ink mb-1">{p.title}</p>
                  <p className="text-[13px] text-muted leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section label="Where We Are Going">
          <p className="text-[15px] text-muted leading-relaxed mb-8">
            Version 1 is the complete research workflow for a single student with a single paper. Every subsequent phase expands the scope of what Arxio can do for you — deeper research, smarter memory, collaborative tools, and eventually an AI that knows your entire academic history and can help you connect ideas across years of work.
          </p>
          <div className="space-y-2">
            {[
              { phase: "Phase 1", label: "Foundation", desc: "Auth, infrastructure, core architecture" },
              { phase: "Phase 2", label: "PDF Mode MVP", desc: "Upload → AI analysis → downloadable documents" },
              { phase: "Phase 3", label: "Presentations", desc: "PPT generation + in-browser presentation mode" },
              { phase: "Phase 4", label: "Research Mode", desc: "Web search → full research documents with citations" },
              { phase: "Phase 5", label: "Chat", desc: "Context-aware conversation with every paper" },
              { phase: "Phase 6", label: "Library + Polish", desc: "Persistent library, search, mobile polish" },
              { phase: "Phase 7", label: "Payments + Beta", desc: "Stripe subscriptions, usage limits, real users" },
              { phase: "Phase 8", label: "RAG + Scholar", desc: "Chat across your entire paper library, academic mode" },
              { phase: "Phase 9", label: "Launch", desc: "Product Hunt, university communities, growth" },
            ].map((r, i) => (
              <div key={r.phase} className="flex items-center gap-4 py-3 border-b border-border last:border-0">
                <span className="text-[11px] font-mono text-subtle w-16 shrink-0">{r.phase}</span>
                <span className="text-[13px] font-semibold text-ink w-40 shrink-0">{r.label}</span>
                <span className="text-[13px] text-muted">{r.desc}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section label="Built by">
          <div className="flex items-start gap-5 p-6 rounded-2xl border border-border">
            <Image
              src="https://avatars.githubusercontent.com/u/60460877?v=4"
              alt="Manish Dash Sharma"
              width={72}
              height={72}
              className="rounded-full border border-border shrink-0"
            />
            <div className="min-w-0">
              <p className="font-display font-bold text-[18px] text-ink tracking-tight leading-tight">Manish Dash Sharma</p>
              <p className="text-[12px] font-semibold text-brand mt-0.5 mb-2">Senior Software Engineer</p>
              <p className="text-[13px] text-muted leading-relaxed mb-4">
                Architecting AI-powered systems that scale. From GenAI integrations to full-stack solutions — turning complex problems into elegant code.
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <a
                  href="https://www.manishdashsharma.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted hover:text-ink border border-border hover:border-ink rounded-lg px-3 py-1.5 transition-all"
                >
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3"/><path d="M8 1.5C6.5 3.5 5.5 5.7 5.5 8s1 4.5 2.5 6.5M8 1.5c1.5 2 2.5 4.2 2.5 6.5s-1 4.5-2.5 6.5M1.5 8h13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                  Website
                </a>
                <a
                  href="https://github.com/manishdashsharma"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted hover:text-ink border border-border hover:border-ink rounded-lg px-3 py-1.5 transition-all"
                >
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
                  GitHub
                </a>
                <a
                  href="https://www.linkedin.com/in/manish-dash-sharma-0082b8185/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted hover:text-ink border border-border hover:border-ink rounded-lg px-3 py-1.5 transition-all"
                >
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/></svg>
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </Section>

        <div className="bg-ink rounded-3xl p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-brand/20 blur-3xl rounded-full pointer-events-none" />
          <div className="relative">
            <p className="font-display font-extrabold text-[28px] md:text-[36px] tracking-[-0.04em] text-white mb-3 leading-tight">
              Upload tonight.
              <br />
              Present in the morning.
            </p>
            <p className="text-[#94a3b8] text-[14px] mb-7 max-w-xs mx-auto">
              Start free. No card required. Your first 3 papers are on us.
            </p>
            <CTAButton className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold text-sm px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-brand/30">
              Try free — no card needed
            </CTAButton>
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-8 px-5 md:px-8 mt-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted">
          <Link href="/" className="font-display font-bold text-[16px] text-ink tracking-tight">Arxio</Link>
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
