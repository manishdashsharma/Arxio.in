import { Badge } from "../../../common/components";

export function AuthSidePanel({ mode = "signin" }) {
  const isSignIn = mode === "signin";
  const leftTitle = isSignIn ? "Sign in.\nContinue your research flow." : "Create account.\nBuild your prep workspace.";
  const leftDescription = isSignIn
    ? "Upload papers, generate slides, and review Q&A from one workspace built for students, researchers, and scholars."
    : "Join Arxio and turn dense papers into clear outputs: slides, cheat sheets, and confident Q&A prep.";
  const stats = isSignIn
    ? [
        { value: "10 min", label: "avg generation" },
        { value: "15 slides", label: "ready deck" },
        { value: "24/7", label: "study support" },
      ]
    : [
        { value: "3 PDFs", label: "free every month" },
        { value: "No card", label: "to start" },
        { value: "1 setup", label: "for all semesters" },
      ];

  return (
    <section className="relative hidden overflow-hidden border-r border-slate-200 bg-gradient-to-br from-slate-50 via-blue-50/40 to-cyan-50/60 lg:flex">
      <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-blue-300/45 blur-3xl" />
      <div className="absolute -bottom-16 -right-8 h-56 w-56 rounded-full bg-cyan-300/45 blur-3xl" />
      <div className="relative z-10 m-auto flex w-full max-w-xl flex-col gap-8 px-10">
        <Badge variant="accent" className="w-fit">
          Arxio for students
        </Badge>
        <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight text-slate-900 transition-all duration-300">
          {leftTitle.split("\n").map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>
        <p className="max-w-lg text-lg leading-relaxed text-slate-600 transition-all duration-300">{leftDescription}</p>
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Magic moment</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            Student uploads a paper at night, opens a complete summary, slides, and viva prep in minutes, then presents with confidence next morning.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {stats.map((item) => (
            <div key={item.label} className="rounded-xl border border-slate-200 bg-white/85 px-4 py-3 shadow-sm">
              <p className="text-xl font-bold text-slate-900">{item.value}</p>
              <p className="text-xs text-slate-500">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
