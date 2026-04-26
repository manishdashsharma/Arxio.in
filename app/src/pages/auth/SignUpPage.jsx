import { useState } from "react";
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
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreed: false,
  });

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!form.agreed) {
      setError("Please accept Terms and Privacy Policy.");
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
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="grid min-h-screen lg:grid-cols-2">
        <AuthSidePanel mode="signup" />
        <section className="relative flex items-center justify-center px-5 py-12 sm:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(37,99,235,0.24),transparent_38%)]" />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-black/40 backdrop-blur">
            <div className="mb-8 space-y-2">
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-300">Create account</p>
              <h1 className="text-3xl font-bold tracking-tight text-white">Start your Arxio workspace</h1>
              <p className="text-sm text-slate-400">Join in minutes and start turning papers into presentation-ready outputs.</p>
            </div>

            <form className="space-y-5" onSubmit={onSubmit}>
              {error ? (
                <div
                  className="rounded-xl border border-rose-400/30 bg-gradient-to-r from-rose-500/15 via-rose-400/10 to-amber-400/10 px-4 py-3 text-rose-100 shadow-lg shadow-rose-950/30"
                  role="alert"
                  aria-live="polite"
                >
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full border border-rose-300/30 bg-rose-500/20 text-sm"
                    >
                      !
                    </span>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">{formatAuthError(error).title}</p>
                      <p className="text-xs text-rose-100/90">{formatAuthError(error).detail}</p>
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
              <Input
                id="signup-password"
                label="Password"
                type="password"
                autoComplete="new-password"
                placeholder="Enter your password"
                required
                value={form.password}
                onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
              />
              <Input
                id="signup-confirm-password"
                label="Confirm password"
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter your password"
                required
                value={form.confirmPassword}
                onChange={(e) => setForm((s) => ({ ...s, confirmPassword: e.target.value }))}
              />
              <label className="inline-flex items-start gap-2 text-sm text-slate-400">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-slate-600 bg-slate-900"
                  checked={form.agreed}
                  onChange={(e) => setForm((s) => ({ ...s, agreed: e.target.checked }))}
                />
                I agree to the Terms and Privacy Policy.
              </label>
              <Button type="submit" className="w-full" loading={submitting}>
                Create account
              </Button>
              <Button variant="outline" className="w-full" type="button">
                Continue with Google
              </Button>
            </form>
            <p className="mt-7 text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link to="/signin" className="font-semibold text-blue-300 hover:text-blue-200">
                Sign in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
