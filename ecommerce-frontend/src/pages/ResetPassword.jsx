import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Lock } from "lucide-react";
import api from "../api/api";
import { fadeIn } from "../animations/fadeIn";

const inputCls = "w-full py-3.5 px-4 pl-[46px] rounded-xl border border-black/15 bg-[#f9f9fb] text-[0.95rem] outline-none transition-all focus:border-brand focus:bg-white focus:shadow-[0_0_0_3px_rgba(56,89,139,0.15)]";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validatePassword = (p) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,16}$/.test(p);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validatePassword(password)) {
      setError("Password must be 8–16 chars and include uppercase, lowercase, number & symbol.");
      return;
    }

    setLoading(true);
    try {
      await api.post(`/reset-password/${token}`, { newPassword: password });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full max-w-[1100px] min-h-[520px] bg-white border border-black/[0.08] rounded-xl mx-auto my-5 overflow-hidden shadow-card md:flex-col md:max-w-[500px] md:min-h-0 md:mx-4 sm:mx-2.5 sm:rounded-lg">
      {/* LEFT PANEL */}
      <div
        className="flex-[1.1] p-12 flex flex-col justify-center bg-brand-dark text-white md:hidden"
        {...fadeIn({ direction: "left", distance: 80, duration: 0.9 })}
      >
        <span className="inline-flex items-center px-4 py-2 bg-white/15 border border-white/30 rounded-full text-[0.7rem] font-bold tracking-[0.15em] uppercase mb-6">
          Account Recovery
        </span>
        <h1 className="text-[2.8rem] font-extrabold leading-[1.1] mb-5 tracking-tight">
          Set a new password.
        </h1>
        <p className="text-[1.05rem] leading-relaxed text-white/85 max-w-[420px]">
          Choose a strong password — at least 8 characters with uppercase, lowercase, number and symbol.
        </p>
      </div>

      {/* RIGHT PANEL */}
      <div
        className="flex-1 p-12 bg-white flex items-center border-l border-black/[0.06] md:border-l-0 md:p-8 sm:p-6"
        {...fadeIn({ direction: "up", distance: 80, duration: 0.9 })}
      >
        {success ? (
          <div className="w-full flex flex-col items-center gap-5 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl">✔</div>
            <h2 className="text-2xl font-bold text-gray-900">Password updated!</h2>
            <p className="text-[0.95rem] text-gray-500">Redirecting you to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            <div className="hidden md:block text-center mb-4">
              <h2 className="text-2xl font-bold mb-1">New Password</h2>
              <p className="text-black/60">Choose a strong password</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <span className="text-[0.75rem] font-medium text-red-600">{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.85rem] font-semibold text-gray-900">New Password</label>
              <div className="relative flex items-center">
                <Lock size={18} className="absolute left-4 text-black/45" />
                <input
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  required
                  className={inputCls}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              className="mt-3 bg-brand text-white py-4 px-4 border-0 rounded-xl text-[0.95rem] font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all hover:bg-brand-dark hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            <p className="text-center text-[0.85rem] text-black/60 mt-2">
              <Link to="/login" className="text-brand font-bold no-underline">Back to Login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
