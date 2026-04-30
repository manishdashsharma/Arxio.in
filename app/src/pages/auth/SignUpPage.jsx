import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Input } from "../../common/components";
import { AuthSidePanel } from "../../features/auth/components/AuthSidePanel";
import { useAuth } from "../../core/auth/use-auth";

const AUTH_FLASH_KEY = "arxio-auth-flash";

function saveAuthFlash(payload) {
  try {
    sessionStorage.setItem(AUTH_FLASH_KEY, JSON.stringify(payload));
  } catch {
    // no-op when storage is unavailable
  }
}

function formatAuthError(message) {
  const normalized = (message || "").toLowerCase();
  if (normalized.includes("cannot reach api") || normalized.includes("bad gateway") || normalized.includes("econnrefused")) {
    return {
      title: "Server is waking up",
      detail: "We could not reach the backend. Please make sure the API is running on port 8000.",
    };
  }
  if (normalized.includes("already") || normalized.includes("exists")) {
    return {
      title: "Account already exists",
      detail: "Try signing in with this email or use another email address.",
    };
  }
  return {
    title: "Sign up not completed",
    detail: message || "Something interrupted account creation. Please try again.",
  };
}

export function SignUpPage() {
  const { signUp } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const checks = useMemo(() => {
    const name = form.name.trim();
    const email = form.email.trim();
    const password = form.password;
    const hasName = name.length >= 2;
    const hasEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const minLen = password.length >= 8;
    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const score = [minLen, hasLetter, hasNumber].filter(Boolean).length;
    const label = score === 3 ? "Strong" : score === 2 ? "Okay" : score === 1 ? "Weak" : "Too short";
    const color = score === 3 ? "bg-emerald-500" : score === 2 ? "bg-amber-400" : "bg-rose-500";
    return {
      hasName,
      hasEmail,
      minLen,
      hasLetter,
      hasNumber,
      canSubmit: hasName && hasEmail && minLen,
      score,
      label,
      color,
    };
  }, [form.name, form.email, form.password]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!checks.hasName) {
      setError("Please enter your name.");
      return;
    }
    if (!checks.hasEmail) {
      setError("Please enter a valid email.");
      return;
    }
    if (!checks.minLen) {
      setError("Password should be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    try {
      await signUp(form.name.trim(), form.email.trim(), form.password);
      saveAuthFlash({
        type: "signup",
        title: "Account created",
        detail: "Your workspace is ready. Taking you to your dashboard...",
        ts: Date.now(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-blue-50/30 text-slate-900">
      <div className="grid h-full lg:grid-cols-2">
        <AuthSidePanel mode="signup" />
        <section className="relative flex items-center justify-center px-5 py-6 sm:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(37,99,235,0.16),transparent_38%)]" />
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_48px_rgba(15,23,42,0.12)]">
            <div className="mb-5 space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Create account</p>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Start your Arxio workspace</h1>
              <p className="text-xs text-slate-600">
                Backend requires only your name, email, and password. We will send an email verification OTP after signup.
              </p>
              <div className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700">
                Free tier available instantly
              </div>
            </div>

            <form className="space-y-3.5" onSubmit={onSubmit}>
              {error ? (
                <div
                  className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-rose-700"
                  role="alert"
                  aria-live="polite"
                >
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full border border-rose-300 bg-rose-100 text-sm"
                    >
                      !
                    </span>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">{formatAuthError(error).title}</p>
                      <p className="text-xs text-rose-700/90">{formatAuthError(error).detail}</p>
                    </div>
                  </div>
                </div>
              ) : null}
              <Input
                id="signup-name"
                label="Full name"
                type="text"
                autoComplete="name"
                placeholder="Your name"
                required
                value={form.name}
                onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              />
              <Input
                id="signup-email"
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                value={form.email}
                onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              />
              <div className="space-y-2">
                <label htmlFor="signup-password" className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Enter your password"
                    required
                    value={form.password}
                    onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-20 text-base text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-blue-700 hover:text-blue-600"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <p className="text-xs text-slate-500">Minimum 8 chars.</p>
              </div>
              <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Password strength</span>
                  <span className="font-semibold text-slate-700">{checks.label}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full ${checks.color} transition-all duration-300`}
                    style={{ width: `${Math.max((checks.score / 3) * 100, form.password ? 25 : 0)}%` }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-1 text-[10px] text-slate-500">
                  <span className={checks.minLen ? "text-emerald-700" : ""}>8+ chars</span>
                  <span className={checks.hasLetter ? "text-emerald-700" : ""}>letter</span>
                  <span className={checks.hasNumber ? "text-emerald-700" : ""}>number</span>
                </div>
              </div>
              {checks.canSubmit ? (
                <p className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-[11px] text-emerald-700">
                  Looks good. You can create your account.
                </p>
              ) : null}
              <Button type="submit" className="w-full" loading={submitting} disabled={!checks.canSubmit}>
                Create account
              </Button>
            </form>
            <p className="mt-5 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link to="/signin" className="font-semibold text-blue-700 hover:text-blue-600">
                Sign in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
