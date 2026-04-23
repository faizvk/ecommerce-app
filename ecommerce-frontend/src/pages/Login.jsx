import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, LogIn } from "lucide-react";
import { loginSchema } from "../utils/signUpSchema";
import { useNavigate, Link } from "react-router-dom";
import { fadeIn } from "../animations/fadeIn";
import { useDispatch, useSelector } from "react-redux";
import { loginThunk, loginSuccess } from "../redux/slice/authSlice";
import { GoogleLogin } from "@react-oauth/google";
import { googleLogin } from "../api/user.api";
import { useState } from "react";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading } = useSelector((state) => state.auth);
  const [googleOnly, setGoogleOnly] = useState(false);

  const { register, handleSubmit, formState: { errors }, setError } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      const res = await dispatch(loginThunk(data)).unwrap();
      navigate(res.user.role === "admin" ? "/admin" : "/", { replace: true });
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
      navigate(res.data.user.role === "admin" ? "/admin" : "/", { replace: true });
    } catch {
      setError("root", { message: "Google login failed" });
    }
  };

  return (
    <div className="flex w-full max-w-[1100px] min-h-[650px] bg-white border border-black/[0.08] rounded-xl mx-auto my-5 overflow-hidden shadow-card md:flex-col md:max-w-[500px] md:min-h-0 md:mx-4 sm:mx-2.5 sm:rounded-lg">
      {/* LEFT PANEL */}
      <div
        className="flex-[1.1] p-12 flex flex-col justify-center bg-brand-dark text-white md:hidden"
        {...fadeIn({ direction: "left", distance: 80, duration: 0.9 })}
      >
        <span className="inline-flex items-center px-4 py-2 bg-white/15 border border-white/30 rounded-full text-[0.7rem] font-bold tracking-[0.15em] uppercase mb-6 text-white">
          Welcome Back
        </span>
        <h1 className="text-[2.8rem] font-extrabold leading-[1.1] mb-5 tracking-tight">Sign in to continue.</h1>
        <p className="text-[1.05rem] leading-relaxed text-white/85 max-w-[420px]">
          Access your dashboard and manage your workspace efficiently.
        </p>
      </div>

      {/* RIGHT PANEL */}
      <div
        className="flex-1 p-12 bg-white flex items-center border-l border-black/[0.06] md:border-l-0 md:p-8 sm:p-6"
        {...fadeIn({ direction: "up", distance: 80, duration: 0.9 })}
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full flex flex-col gap-4">
          {/* Mobile header */}
          <div className="hidden md:block text-center mb-6">
            <h2 className="text-2xl font-bold mb-1">Login</h2>
            <p className="text-black/60">Enter your credentials to continue</p>
          </div>

          {/* Root error */}
          {errors.root?.message && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <span className="text-[0.75rem] font-medium text-red-600">{errors.root.message}</span>
              {errors.root.message.includes("Google") && (
                <div className="mt-4 text-center">
                  <GoogleLogin
                    onSuccess={(res) => handleGoogleLogin(res.credential)}
                    onError={() => setError("root", { message: "Google login failed" })}
                  />
                </div>
              )}
            </div>
          )}

          {/* EMAIL */}
          <div className="flex flex-col gap-2">
            <label className="text-[0.85rem] font-semibold text-gray-900">Email Address</label>
            <div className="relative flex items-center">
              <Mail size={18} className="absolute left-4 text-black/45 transition-all" />
              <input
                type="email"
                autoComplete="email"
                placeholder="name@company.com"
                className={`w-full py-3.5 px-4 pl-[46px] rounded-xl border bg-[#f9f9fb] text-[0.95rem] outline-none transition-all focus:border-brand focus:bg-white focus:shadow-[0_0_0_3px_rgba(56,89,139,0.15)] ${errors.email ? "border-red-500 bg-red-50" : "border-black/15"}`}
                {...register("email")}
              />
            </div>
            {errors.email && <span className="text-[0.75rem] font-medium text-red-500">{errors.email.message}</span>}
          </div>

          {/* PASSWORD */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[0.85rem] font-semibold text-gray-900">Password</label>
              <Link to="/forgot-password" className="text-[0.8rem] text-brand font-semibold no-underline hover:opacity-70">
                Forgot password?
              </Link>
            </div>
            <div className="relative flex items-center">
              <Lock size={18} className="absolute left-4 text-black/45 transition-all" />
              <input
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className={`w-full py-3.5 px-4 pl-[46px] rounded-xl border bg-[#f9f9fb] text-[0.95rem] outline-none transition-all focus:border-brand focus:bg-white focus:shadow-[0_0_0_3px_rgba(56,89,139,0.15)] ${errors.password ? "border-red-500 bg-red-50" : "border-black/15"}`}
                {...register("password")}
              />
            </div>
            {errors.password && <span className="text-[0.75rem] font-medium text-red-500">{errors.password.message}</span>}
          </div>

          <button
            className="mt-3 bg-brand text-white py-4 px-4 border-0 rounded-xl text-[0.95rem] font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all hover:bg-brand-dark hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
            {!loading && <LogIn size={18} />}
          </button>

          <div className="mt-4 text-center">
            <GoogleLogin
              onSuccess={(res) => handleGoogleLogin(res.credential)}
              onError={() => setError("root", { message: "Google login failed" })}
            />
          </div>

          <p className="text-center text-[0.85rem] text-black/60 mt-3">
            Don't have an account?{" "}
            <Link to="/signup" className="text-brand font-bold no-underline">Sign Up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
