import { Badge } from "../../../common/components";

export function AuthSidePanel({ mode = "signin" }) {
  const isSignIn = mode === "signin";
  const leftTitle = isSignIn ? "Sign in.\nContinue your research flow." : "Create account.\nStart your first workspace.";
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
    <section className="relative hidden overflow-hidden border-r border-slate-800 lg:flex">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.25),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(56,189,248,0.18),transparent_35%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,rgba(15,23,42,0.4),rgba(2,6,23,0.9))]" />
      <div className="relative z-10 m-auto flex w-full max-w-xl flex-col gap-8 px-10">
        <Badge variant="accent" className="w-fit">
          Arxio workspace
        </Badge>
        <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight text-white transition-all duration-300">
          {leftTitle.split("\n").map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>
        <p className="max-w-lg text-lg leading-relaxed text-slate-300 transition-all duration-300">{leftDescription}</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {stats.map((item) => (
            <div key={item.label} className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3">
              <p className="text-xl font-bold text-white">{item.value}</p>
              <p className="text-xs text-slate-400">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
