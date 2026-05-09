import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../../common/components";
import { AuthSidePanel } from "../../features/auth/components/AuthSidePanel";
import { useAuth } from "../../core/auth/use-auth";
import { resendVerification } from "../../core/api/auth-api";

export function VerifyEmailPage() {
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const email = params.get("email") || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState("");
  const inputs = useRef([]);

  useEffect(() => {
    if (!email) navigate("/signup", { replace: true });
  }, [email, navigate]);

  function handleChange(i, val) {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[i] = digit;
    setOtp(next);
    setError("");
    if (digit && i < 5) inputs.current[i + 1]?.focus();
  }

  function handleKeyDown(i, e) {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...otp];
    for (let i = 0; i < 6; i++) next[i] = pasted[i] || "";
    setOtp(next);
    inputs.current[Math.min(pasted.length, 5)]?.focus();
  }

  async function onSubmit(e) {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) { setError("Enter the full 6-digit code."); return; }
    setSubmitting(true);
    setError("");
    try {
      await verifyEmail(email, code);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired code.");
      setOtp(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } finally {
      setSubmitting(false);
    }
  }

  async function onResend() {
    setResending(true);
    setResendMsg("");
    setError("");
    try {
      await resendVerification({ email });
      setResendMsg("A new code has been sent to your email.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend code.");
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="h-screen overflow-hidden bg-linear-to-b from-slate-50 via-white to-blue-50/30 text-slate-900">
      <div className="grid h-full lg:grid-cols-2">
        <AuthSidePanel mode="signup" />
        <section className="relative flex items-center justify-center px-5 py-6 sm:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(37,99,235,0.16),transparent_38%)]" />
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_48px_rgba(15,23,42,0.12)]">
            <div className="mb-6 space-y-1.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 mb-4">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <rect x="2" y="5" width="18" height="13" rx="2" stroke="#2563eb" strokeWidth="1.6"/>
                  <path d="M2 8l9 6 9-6" stroke="#2563eb" strokeWidth="1.6" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Verify your email</p>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Check your inbox</h1>
              <p className="text-sm text-slate-500 leading-relaxed">
                We sent a 6-digit code to{" "}
                <span className="font-semibold text-slate-700">{email}</span>.
                Enter it below to activate your account.
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}
              {resendMsg && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {resendMsg}
                </div>
              )}

              <div className="flex justify-center gap-2" onPaste={handlePaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="h-14 w-12 rounded-xl border border-slate-300 bg-white text-center text-xl font-bold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                  />
                ))}
              </div>

              <Button type="submit" className="w-full" loading={submitting} disabled={otp.join("").length < 6}>
                Verify and sign in
              </Button>
            </form>

            <div className="mt-5 flex flex-col items-center gap-3 text-sm text-slate-500">
              <span>
                Didn&apos;t receive it?{" "}
                <button
                  type="button"
                  onClick={onResend}
                  disabled={resending}
                  className="font-semibold text-blue-700 hover:text-blue-600 disabled:opacity-50"
                >
                  {resending ? "Sending..." : "Resend code"}
                </button>
              </span>
              <Link to="/signup" className="text-xs text-slate-400 hover:text-slate-600">
                Back to sign up
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
