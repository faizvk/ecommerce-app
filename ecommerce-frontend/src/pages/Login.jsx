import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { GoogleLogin } from "@react-oauth/google";
import {
  Mail, Lock, Eye, EyeOff, ShoppingBag, Check, Sparkles, ArrowRight,
} from "lucide-react";

import { loginSchema } from "../utils/signUpSchema";
import { fadeIn } from "../animations/fadeIn";
import { loginThunk, loginSuccess } from "../redux/slice/authSlice";
import { googleLogin } from "../api/user.api";

const inputCls = (err) =>
  `w-full py-3 px-4 pl-12 rounded-xl border bg-gray-50 text-[0.92rem] outline-none transition-all focus:border-brand focus:bg-white focus:shadow-[0_0_0_3px_rgba(79,70,229,0.15)] ${
    err ? "border-red-300 bg-red-50/40" : "border-gray-200 hover:border-gray-300"
  }`;

const PERKS = [
  "Track every order in real-time",
  "Save favourites to your wishlist",
  "Exclusive member-only deals",
  "Express checkout in one click",
];

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading } = useSelector((state) => state.auth);
  const intended = location.state?.from || null;

  const [googleOnly, setGoogleOnly] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors }, setError } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      const res = await dispatch(loginThunk(data)).unwrap();
      const dest = res.user.role === "admin" ? "/admin" : (intended || "/");
      navigate(dest, { replace: true });
    } catch (err) {
      if (err === "ACCOUNT_HAS_NO_PASSWORD") {
        setGoogleOnly(true);
        setError("root", { message: "This account does not have a password. Please sign in with Google." });
      } else {
        setGoogleOnly(false);
        setError("root", { message: err || "Invalid email or password" });
      }
    }
  };

  const handleGoogleLogin = async (credential) => {
    try {
      const res = await googleLogin(credential);
      dispatch(loginSuccess(res.data));
      const dest = res.data.user.role === "admin" ? "/admin" : (intended || "/");
      navigate(dest, { replace: true });
    } catch {
      setError("root", { message: "Google login failed" });
    }
  };

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
              <Sparkles size={11} />
              Welcome back
            </span>
            <h1 className="text-3xl lg:text-[2.5rem] font-extrabold leading-[1.1] tracking-tight mb-3">
              Pick up where<br />you left off.
            </h1>
            <p className="text-white/75 text-[0.95rem] leading-relaxed max-w-sm mb-8">
              Sign in to access your cart, orders, and personalised recommendations.
            </p>

            <ul className="space-y-2.5">
              {PERKS.map((perk) => (
                <li key={perk} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-white/15 border border-white/25 flex items-center justify-center flex-shrink-0">
                    <Check size={11} strokeWidth={3} />
                  </div>
                  <span className="text-[0.86rem] text-white/85">{perk}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="relative text-[0.72rem] text-white/45">
            © {new Date().getFullYear()} NexKart · Shop Smart, Live Better
          </p>
        </aside>

        {/* RIGHT FORM */}
        <div className="p-6 sm:p-8 md:p-10 lg:p-12 flex items-center">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full flex flex-col gap-5">
            <div>
              <h2 className="text-2xl md:text-[1.75rem] font-extrabold text-gray-900 leading-tight">Sign in</h2>
              <p className="text-[0.88rem] text-gray-500 mt-1">
                New to NexKart?{" "}
                <Link to="/signup" className="text-brand font-bold no-underline hover:underline">
                  Create an account
                </Link>
              </p>
            </div>

            {errors.root?.message && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3.5">
                <p className="text-[0.82rem] font-medium text-red-700">{errors.root.message}</p>
                {googleOnly && (
                  <div className="mt-3 flex justify-center">
                    <GoogleLogin
                      onSuccess={(res) => handleGoogleLogin(res.credential)}
                      onError={() => setError("root", { message: "Google login failed" })}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.82rem] font-bold text-gray-700">Email address</label>
              <div className="relative">
                <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={inputCls(errors.email)}
                  {...register("email")}
                />
              </div>
              {errors.email && <span className="text-[0.75rem] font-medium text-red-500">{errors.email.message}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[0.82rem] font-bold text-gray-700">Password</label>
                <Link to="/forgot-password" className="text-[0.78rem] text-brand font-semibold no-underline hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`${inputCls(errors.password)} pr-12`}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full text-gray-400 hover:text-brand hover:bg-gray-100 transition-colors flex items-center justify-center bg-transparent border-0 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <span className="text-[0.75rem] font-medium text-red-500">{errors.password.message}</span>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 flex items-center justify-center gap-2 bg-gradient-to-r from-brand to-[#7c3aed] text-white py-3.5 rounded-xl text-[0.95rem] font-bold cursor-pointer transition-all hover:opacity-90 hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_8px_24px_rgba(79,70,229,0.25)] border-0"
            >
              {loading ? "Signing in..." : <>Sign In <ArrowRight size={16} /></>}
            </button>

            <div className="relative flex items-center">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="px-3 text-[0.7rem] text-gray-400 font-semibold uppercase tracking-wider">or continue with</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={(res) => handleGoogleLogin(res.credential)}
                onError={() => setError("root", { message: "Google login failed" })}
              />
            </div>

            <p className="text-center text-[0.76rem] text-gray-400 mt-1">
              By signing in you agree to our <span className="text-gray-500 font-medium">Terms</span> and <span className="text-gray-500 font-medium">Privacy Policy</span>.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
