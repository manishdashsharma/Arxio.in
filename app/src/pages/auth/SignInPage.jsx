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
  if (normalized.includes("unauthorized") || normalized.includes("invalid") || normalized.includes("credential")) {
    return {
      title: "Credentials did not match",
      detail: "Double-check your email and password, then try again.",
    };
  }
  return {
    title: "Sign in not completed",
    detail: message || "Something interrupted the request. Please try again.",
  };
}

export function SignInPage() {
  const { signIn } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      saveAuthFlash({
        type: "signin",
        title: "Welcome back",
        detail: "You are signed in. Taking you to your dashboard...",
        ts: Date.now(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/30 text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-2">
        <AuthSidePanel mode="signin" />
        <section className="relative flex items-center justify-center px-5 py-12 sm:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(37,99,235,0.16),transparent_38%)]" />
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_20px_48px_rgba(15,23,42,0.12)]">
            <div className="mb-8 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Welcome back</p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Sign in to Arxio</h1>
              <p className="text-sm text-slate-600">Access your dashboard, library, and generated workspaces.</p>
              <div className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700">
                Trusted by student presenters
              </div>
            </div>

            <form className="space-y-5" onSubmit={onSubmit}>
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
                id="signin-email"
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                id="signin-password"
                label="Password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="flex items-center justify-between text-sm">
                <label className="inline-flex items-center gap-2 text-slate-500">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300 bg-white" />
                  Remember me
                </label>
                <button type="button" className="font-semibold text-blue-700 hover:text-blue-600">
                  Forgot password?
                </button>
              </div>
              <Button type="submit" className="w-full" loading={submitting}>
                Sign in
              </Button>
              <Button variant="outline" className="w-full border-slate-300" type="button">
                Continue with Google
              </Button>
            </form>
            <p className="mt-7 text-center text-sm text-slate-600">
              New to Arxio?{" "}
              <Link to="/signup" className="font-semibold text-blue-700 hover:text-blue-600">
                Create account
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
