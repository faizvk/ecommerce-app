import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import {
  User, Mail, Lock, Phone, MapPin, Calendar, ArrowRight,
  ShoppingBag, Truck, RefreshCcw, Sparkles, Eye, EyeOff,
} from "lucide-react";

import { signUpSchema } from "../utils/signUpSchema";
import { signup } from "../api/user.api";
import { fadeIn } from "../animations/fadeIn";

const inputCls = (err) =>
  `w-full py-3 px-4 pl-12 rounded-xl border bg-gray-50 text-[0.92rem] outline-none transition-all focus:border-brand focus:bg-white focus:shadow-[0_0_0_3px_rgba(79,70,229,0.15)] ${
    err ? "border-red-300 bg-red-50/40" : "border-gray-200 hover:border-gray-300"
  }`;

const BENEFITS = [
  { icon: Truck, label: "Free delivery on orders above ₹499" },
  { icon: RefreshCcw, label: "7-day no-questions return policy" },
  { icon: Sparkles, label: "Member-exclusive deals & early access" },
];

const FIELDS = [
  { label: "Full Name",      name: "fullName", type: "text",     placeholder: "Your name",        Icon: User,     autoComplete: "name",     half: true },
  { label: "Age",            name: "age",      type: "number",   placeholder: "e.g. 28",          Icon: Calendar, half: true },
  { label: "Email Address",  name: "email",    type: "email",    placeholder: "you@example.com",  Icon: Mail,     autoComplete: "email" },
  { label: "Address",        name: "address",  type: "text",     placeholder: "Street, city",     Icon: MapPin },
  { label: "Contact Number", name: "contact",  type: "tel",      placeholder: "10-digit mobile",  Icon: Phone,    half: true },
];

export default function SignUp() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data) => {
    try {
      await signup({
        name: data.fullName.trim(),
        age: data.age,
        email: data.email,
        address: data.address.trim(),
        contact: data.contact,
        password: data.password,
      });
      navigate("/login");
    } catch (err) {
      setError("root", { message: err.response?.data?.message || "Signup failed. Try again." });
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
              Join NexKart
            </span>
            <h1 className="text-3xl lg:text-[2.5rem] font-extrabold leading-[1.1] tracking-tight mb-3">
              Start saving<br />from your first order.
            </h1>
            <p className="text-white/75 text-[0.95rem] leading-relaxed max-w-sm mb-8">
              Create a free account to unlock member pricing, faster checkout and personalised picks.
            </p>

            <ul className="space-y-3.5">
              {BENEFITS.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0">
                    <Icon size={16} />
                  </div>
                  <span className="text-[0.88rem] text-white/90">{label}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="relative text-[0.72rem] text-white/45">
            Already a member?{" "}
            <Link to="/login" className="text-white font-bold no-underline hover:underline">
              Sign in →
            </Link>
          </p>
        </aside>

        {/* RIGHT FORM */}
        <div className="p-6 sm:p-8 md:p-10 lg:p-12 flex items-center">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full flex flex-col gap-4">
            <div className="mb-1">
              <h2 className="text-2xl md:text-[1.75rem] font-extrabold text-gray-900 leading-tight">Create account</h2>
              <p className="text-[0.88rem] text-gray-500 mt-1 md:hidden">
                Already have one?{" "}
                <Link to="/login" className="text-brand font-bold no-underline hover:underline">Sign in</Link>
              </p>
              <p className="text-[0.88rem] text-gray-500 mt-1 hidden md:block">
                Just a few details and you're in.
              </p>
            </div>

            {errors.root?.message && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3.5">
                <span className="text-[0.82rem] font-medium text-red-700">{errors.root.message}</span>
              </div>
            )}

            {/* Two-column grid for shorter fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FIELDS.filter((f) => f.half).map(({ label, name, type, placeholder, Icon, autoComplete }) => (
                <div key={name} className="flex flex-col gap-1.5">
                  <label className="text-[0.78rem] font-bold text-gray-700">{label}</label>
                  <div className="relative">
                    <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={type}
                      placeholder={placeholder}
                      autoComplete={autoComplete}
                      className={inputCls(errors[name])}
                      {...register(name)}
                    />
                  </div>
                  {errors[name] && <span className="text-[0.72rem] font-medium text-red-500">{errors[name].message}</span>}
                </div>
              ))}
            </div>

            {/* Full-width fields */}
            {FIELDS.filter((f) => !f.half).map(({ label, name, type, placeholder, Icon, autoComplete }) => (
              <div key={name} className="flex flex-col gap-1.5">
                <label className="text-[0.78rem] font-bold text-gray-700">{label}</label>
                <div className="relative">
                  <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={type}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    className={inputCls(errors[name])}
                    {...register(name)}
                  />
                </div>
                {errors[name] && <span className="text-[0.72rem] font-medium text-red-500">{errors[name].message}</span>}
              </div>
            ))}

            {/* Password with toggle */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.78rem] font-bold text-gray-700">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
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
              {errors.password && <span className="text-[0.72rem] font-medium text-red-500">{errors.password.message}</span>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 flex items-center justify-center gap-2 bg-gradient-to-r from-brand to-[#7c3aed] text-white py-3.5 rounded-xl text-[0.95rem] font-bold cursor-pointer transition-all hover:opacity-90 hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_8px_24px_rgba(79,70,229,0.25)] border-0"
            >
              {isSubmitting ? "Creating account..." : <>Create Account <ArrowRight size={16} /></>}
            </button>

            <p className="text-center text-[0.76rem] text-gray-400 mt-1">
              By signing up you agree to our <span className="text-gray-500 font-medium">Terms</span> and <span className="text-gray-500 font-medium">Privacy Policy</span>.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
