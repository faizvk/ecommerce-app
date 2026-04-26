import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import api from "../api/api";
import { fadeIn } from "../animations/fadeIn";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/forgot-password", { email });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-4 py-6 md:py-8">
      <div className="w-full max-w-[480px] mx-auto md:max-w-[1100px]">
        <div className="bg-white border border-black/[0.08] rounded-xl overflow-hidden shadow-card flex flex-col md:flex-row md:min-h-[550px]">

          {/* LEFT PANEL — hidden on mobile */}
          <div
            className="hidden md:flex flex-[1.1] p-12 flex-col justify-center bg-brand-dark text-white"
            {...fadeIn({ direction: "left", distance: 80, duration: 0.9 })}
          >
            <span className="inline-flex items-center px-4 py-2 bg-white/15 border border-white/30 rounded-full text-[0.7rem] font-bold tracking-[0.15em] uppercase mb-6">
              Account Recovery
            </span>
            <h1 className="text-[2.8rem] font-extrabold leading-[1.1] mb-5 tracking-tight">
              Reset your password.
            </h1>
            <p className="text-[1.05rem] leading-relaxed text-white/85 max-w-[420px]">
              Enter your email and we'll send you a link to get back into your account.
            </p>
          </div>

          {/* RIGHT PANEL */}
          <div
            className="flex-1 p-6 sm:p-8 md:p-12 bg-white flex items-center md:border-l md:border-black/[0.06]"
            {...fadeIn({ direction: "up", distance: 80, duration: 0.9 })}
          >
            {submitted ? (
              <div className="w-full flex flex-col items-center gap-5 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl">
                  ✉️
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Check your inbox</h2>
                <p className="text-[0.95rem] text-gray-500 max-w-sm">
                  If an account with <strong>{email}</strong> exists, a password reset link has been sent. Check your spam folder if you don't see it.
                </p>
                <Link
                  to="/login"
                  className="mt-2 flex items-center gap-2 text-brand font-semibold text-[0.9rem] no-underline hover:opacity-70"
                >
                  <ArrowLeft size={16} />
                  Back to Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
                <div className="text-center mb-2 md:hidden">
                  <h2 className="text-2xl font-bold mb-1">Forgot Password?</h2>
                  <p className="text-black/60 text-sm">Enter your email to reset it</p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <span className="text-[0.75rem] font-medium text-red-600">{error}</span>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.85rem] font-semibold text-gray-900">Email Address</label>
                  <div className="relative flex items-center">
                    <Mail size={18} className="absolute left-4 text-black/45" />
                    <input
                      type="email"
                      autoComplete="email"
                      placeholder="name@company.com"
                      required
                      className="w-full py-3.5 px-4 pl-[46px] rounded-xl border border-black/15 bg-[#f9f9fb] text-[0.95rem] outline-none transition-all focus:border-brand focus:bg-white focus:shadow-[0_0_0_3px_rgba(79,70,229,0.15)]"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  className="mt-3 bg-brand text-white py-4 px-4 border-0 rounded-xl text-[0.95rem] font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all hover:bg-brand-dark hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>

                <p className="text-center text-[0.85rem] text-black/60 mt-2">
                  Remember your password?{" "}
                  <Link to="/login" className="text-brand font-bold no-underline">Log in</Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
