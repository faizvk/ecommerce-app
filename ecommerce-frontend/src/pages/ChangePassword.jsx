import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  fetchProfileThunk,
  updatePasswordThunk,
  setPasswordThunk,
} from "../redux/slice/userSlice";
import { notify } from "../utils/notify";
import { fadeIn } from "../animations/fadeIn";
import {
  Lock, ShieldCheck, Eye, EyeOff, ShoppingBag, Sparkles,
  ArrowLeft, ShieldAlert, Check, X as XIcon,
} from "lucide-react";

const inputCls = (err) =>
  `w-full py-3 px-4 pl-12 pr-12 rounded-xl border bg-gray-50 text-[0.92rem] outline-none transition-all focus:border-brand focus:bg-white focus:shadow-[0_0_0_3px_rgba(79,70,229,0.15)] ${
    err ? "border-red-300 bg-red-50/40" : "border-gray-200 hover:border-gray-300"
  }`;

// Password requirement checks
const checks = [
  { test: (p) => p.length >= 8 && p.length <= 16, label: "8–16 characters" },
  { test: (p) => /[a-z]/.test(p),                  label: "Lowercase letter" },
  { test: (p) => /[A-Z]/.test(p),                  label: "Uppercase letter" },
  { test: (p) => /\d/.test(p),                     label: "Number" },
  { test: (p) => /[\W_]/.test(p),                  label: "Symbol (!@#…)" },
];

function PasswordStrength({ password }) {
  if (!password) return null;
  const passed = checks.filter((c) => c.test(password)).length;
  const pct = (passed / checks.length) * 100;
  const tone =
    passed <= 2 ? "bg-red-400" :
    passed <= 3 ? "bg-amber-400" :
    passed <= 4 ? "bg-blue-400" : "bg-emerald-500";
  const label =
    passed <= 2 ? "Weak" :
    passed <= 3 ? "Fair" :
    passed <= 4 ? "Good" : "Strong";

  return (
    <div className="flex flex-col gap-2 mt-1">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
          <div className={`h-full transition-all duration-300 ${tone}`} style={{ width: `${pct}%` }} />
        </div>
        <span className={`text-[0.72rem] font-bold ${
          passed <= 2 ? "text-red-500" :
          passed <= 3 ? "text-amber-600" :
          passed <= 4 ? "text-blue-600" : "text-emerald-600"
        }`}>{label}</span>
      </div>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
        {checks.map((c, i) => {
          const ok = c.test(password);
          return (
            <li key={i} className={`flex items-center gap-1.5 text-[0.7rem] font-medium ${ok ? "text-emerald-600" : "text-gray-400"}`}>
              {ok ? <Check size={11} strokeWidth={3} /> : <XIcon size={11} />}
              {c.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PasswordField({ label, value, onChange, placeholder, autoComplete, error, show, onToggleShow }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[0.82rem] font-bold text-gray-700">{label}</label>
      <div className="relative">
        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={inputCls(error)}
          value={value}
          onChange={onChange}
          required
        />
        <button
          type="button"
          onClick={onToggleShow}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full text-gray-400 hover:text-brand hover:bg-gray-100 transition-colors flex items-center justify-center bg-transparent border-0 cursor-pointer"
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {error && <span className="text-[0.72rem] font-medium text-red-500">{error}</span>}
    </div>
  );
}

export default function ChangePassword() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, profile } = useSelector((state) => state.user);

  const [data, setData] = useState({ oldPassword: "", newPassword: "" });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [localError, setLocalError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch profile so we can detect if this is a Google-only account up-front
  useEffect(() => {
    if (!profile) dispatch(fetchProfileThunk());
  }, [dispatch, profile]);

  const isGoogleOnly = useMemo(() => profile?.provider === "google", [profile]);

  const isValidPassword = (pass) => checks.every((c) => c.test(pass));

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLocalError("");
    if (!isValidPassword(data.newPassword)) {
      setLocalError("Password doesn't meet all requirements");
      return;
    }
    setSubmitting(true);
    try {
      const res = await dispatch(updatePasswordThunk(data));
      if (updatePasswordThunk.rejected.match(res)) {
        if (res.payload === "GOOGLE_ACCOUNT_NO_PASSWORD") {
          notify.info({ title: "Use Set Password", desc: "This account is linked to Google" });
          // Profile likely needs refetch to update provider
          dispatch(fetchProfileThunk());
          return;
        }
        notify.error(res.payload || "Couldn't update password");
        return;
      }
      notify.success({ title: "Password updated", desc: "You can sign in with your new password" });
      setTimeout(() => navigate("/profile"), 800);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSet = async (e) => {
    e.preventDefault();
    setLocalError("");
    if (!isValidPassword(data.newPassword)) {
      setLocalError("Password doesn't meet all requirements");
      return;
    }
    setSubmitting(true);
    try {
      const res = await dispatch(setPasswordThunk({ newPassword: data.newPassword }));
      if (setPasswordThunk.fulfilled.match(res)) {
        notify.success({ title: "Password set", desc: "You can now sign in with email + password" });
        setTimeout(() => navigate("/profile"), 800);
      } else {
        notify.error(res.payload || "Couldn't set password");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Profile not loaded yet
  if (loading && !profile) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin w-10 h-10 rounded-full border-4 border-brand-medium border-t-brand" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-65px)] flex items-center justify-center px-4 py-8 md:py-12">
      <div
        className="w-full max-w-[1100px] grid md:grid-cols-2 bg-white rounded-3xl shadow-[0_24px_60px_rgba(79,70,229,0.15)] overflow-hidden border border-gray-100"
        {...fadeIn({ direction: "up", distance: 30, duration: 0.5 })}
      >
        {/* LEFT HERO */}
        <aside className="hidden md:flex flex-col justify-between p-10 lg:p-12 bg-gradient-to-br from-brand-dark via-brand to-[#7c3aed] text-white relative overflow-hidden">
          <div className="absolute -top-20 -right-16 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-16 w-80 h-80 bg-white/5 rounded-full blur-3xl" />

          <Link to="/" className="relative no-underline flex items-center gap-2.5 w-fit">
            <div className="w-10 h-10 bg-white/15 border border-white/25 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <ShoppingBag size={20} className="text-white" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight leading-none">
              <span className="text-white">Nex</span>
              <span className="text-brand-medium">Kart</span>
            </span>
          </Link>

          <div className="relative">
            <span className="inline-flex items-center gap-1.5 mb-5 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-[0.65rem] font-bold uppercase tracking-[0.18em]">
              <ShieldCheck size={11} />
              Security
            </span>
            <h1 className="text-3xl lg:text-[2.4rem] font-extrabold leading-[1.1] tracking-tight mb-3">
              {isGoogleOnly ? <>Set a<br />password.</> : <>Change your<br />password.</>}
            </h1>
            <p className="text-white/75 text-[0.95rem] leading-relaxed max-w-sm mb-7">
              {isGoogleOnly
                ? "Create a password so you can also sign in with email — keep using Google any time."
                : "Pick a strong password — unique, hard to guess, and at least 8 characters."}
            </p>

            <ul className="space-y-2 text-[0.85rem] text-white/80">
              <li className="flex items-center gap-2"><Sparkles size={12} className="opacity-70" /> Mix of upper, lower, numbers</li>
              <li className="flex items-center gap-2"><Sparkles size={12} className="opacity-70" /> Avoid your email or name</li>
              <li className="flex items-center gap-2"><Sparkles size={12} className="opacity-70" /> Don't reuse old passwords</li>
            </ul>
          </div>

          <Link
            to="/profile"
            className="relative inline-flex items-center gap-1.5 text-[0.82rem] font-semibold text-white/70 hover:text-white no-underline transition-colors w-fit"
          >
            <ArrowLeft size={14} />
            Back to profile
          </Link>
        </aside>

        {/* RIGHT FORM */}
        <div className="p-6 sm:p-8 md:p-10 lg:p-12 flex items-center">
          {isGoogleOnly ? (
            // ── Google account: set initial password ──
            <form onSubmit={handleSet} className="w-full flex flex-col gap-4">
              <div className="flex items-start gap-3 p-3.5 bg-blue-50 border border-blue-200 rounded-xl">
                <ShieldAlert size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[0.85rem] font-bold text-blue-900">No password yet</p>
                  <p className="text-[0.78rem] text-blue-700/90 mt-0.5">This account uses Google sign-in. Set a password to also log in via email.</p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl md:text-[1.65rem] font-extrabold text-gray-900 leading-tight">Set password</h2>
                <p className="text-[0.85rem] text-gray-500 mt-1">Make it strong and unique.</p>
              </div>

              {localError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3.5">
                  <p className="text-[0.82rem] font-medium text-red-700">{localError}</p>
                </div>
              )}

              <PasswordField
                label="New Password"
                value={data.newPassword}
                onChange={(e) => setData((d) => ({ ...d, newPassword: e.target.value }))}
                placeholder="Create a password"
                autoComplete="new-password"
                error={localError && !isValidPassword(data.newPassword) ? "" : ""}
                show={showNew}
                onToggleShow={() => setShowNew((v) => !v)}
              />

              <PasswordStrength password={data.newPassword} />

              <div className="flex flex-col-reverse sm:flex-row gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => navigate("/profile")}
                  className="flex-1 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl text-[0.92rem] font-semibold cursor-pointer transition-all hover:bg-gray-50 hover:border-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-brand to-[#7c3aed] text-white py-3 rounded-xl text-[0.92rem] font-bold cursor-pointer transition-all hover:opacity-90 hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_8px_24px_rgba(79,70,229,0.25)] border-0"
                >
                  <ShieldCheck size={15} />
                  {submitting ? "Setting..." : "Set Password"}
                </button>
              </div>
            </form>
          ) : (
            // ── Regular account: change existing password ──
            <form onSubmit={handleUpdate} className="w-full flex flex-col gap-4">
              <div>
                <h2 className="text-2xl md:text-[1.65rem] font-extrabold text-gray-900 leading-tight">Change password</h2>
                <p className="text-[0.85rem] text-gray-500 mt-1">Enter your current password to confirm.</p>
              </div>

              {localError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3.5">
                  <p className="text-[0.82rem] font-medium text-red-700">{localError}</p>
                </div>
              )}

              <PasswordField
                label="Current Password"
                value={data.oldPassword}
                onChange={(e) => setData((d) => ({ ...d, oldPassword: e.target.value }))}
                placeholder="Enter current password"
                autoComplete="current-password"
                show={showOld}
                onToggleShow={() => setShowOld((v) => !v)}
              />

              <PasswordField
                label="New Password"
                value={data.newPassword}
                onChange={(e) => setData((d) => ({ ...d, newPassword: e.target.value }))}
                placeholder="Choose a strong new password"
                autoComplete="new-password"
                show={showNew}
                onToggleShow={() => setShowNew((v) => !v)}
              />

              <PasswordStrength password={data.newPassword} />

              <div className="flex flex-col-reverse sm:flex-row gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => navigate("/profile")}
                  className="flex-1 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl text-[0.92rem] font-semibold cursor-pointer transition-all hover:bg-gray-50 hover:border-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-brand to-[#7c3aed] text-white py-3 rounded-xl text-[0.92rem] font-bold cursor-pointer transition-all hover:opacity-90 hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_8px_24px_rgba(79,70,229,0.25)] border-0"
                >
                  <ShieldCheck size={15} />
                  {submitting ? "Updating..." : "Update Password"}
                </button>
              </div>

              <p className="text-center text-[0.78rem] text-gray-400 mt-1">
                Forgot your current password?{" "}
                <Link to="/forgot-password" className="text-brand font-bold no-underline hover:underline">
                  Reset it
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
