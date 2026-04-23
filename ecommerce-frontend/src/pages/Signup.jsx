import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema } from "../utils/signUpSchema";
import { User, Mail, Lock, Phone, MapPin, Calendar, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../api/user.api";
import { fadeIn } from "../animations/fadeIn";

const inputCls = (err) =>
  `w-full py-3.5 px-4 pl-[46px] rounded-xl border bg-[#f9f9fb] text-[0.95rem] outline-none transition-all focus:border-brand focus:bg-white focus:shadow-[0_0_0_3px_rgba(56,89,139,0.15)] ${
    err ? "border-red-500 bg-red-50" : "border-black/15"
  }`;

export default function SignUp() {
  const navigate = useNavigate();
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

  const fields = [
    { label: "Full Name", name: "fullName", type: "text", placeholder: "Name", Icon: User, autoComplete: "name" },
    { label: "Age", name: "age", type: "number", placeholder: "Age", Icon: Calendar },
    { label: "Email Address", name: "email", type: "email", placeholder: "email", Icon: Mail, autoComplete: "email" },
    { label: "Address", name: "address", type: "text", placeholder: "Your address", Icon: MapPin },
    { label: "Contact Number", name: "contact", type: "text", placeholder: "Contact number", Icon: Phone },
    { label: "Password", name: "password", type: "password", placeholder: "••••••••", Icon: Lock, autoComplete: "new-password" },
  ];

  return (
    <div className="flex w-full max-w-[1100px] min-h-[650px] bg-white border border-black/[0.08] rounded-xl mx-auto my-5 overflow-hidden shadow-card md:flex-col md:max-w-[500px] md:min-h-0 md:mx-4 sm:mx-2.5 sm:rounded-lg">
      {/* LEFT PANEL */}
      <div
        className="flex-[1.1] p-12 flex flex-col justify-center bg-brand-dark text-white md:hidden"
        {...fadeIn({ direction: "left", distance: 80, duration: 0.9 })}
      >
        <span className="inline-flex items-center px-4 py-2 bg-white/15 border border-white/30 rounded-full text-[0.7rem] font-bold tracking-[0.15em] uppercase mb-6">
          Platform Access
        </span>
        <h1 className="text-[2.8rem] font-extrabold leading-[1.1] mb-5 tracking-tight">
          Start your journey with us.
        </h1>
        <p className="text-[1.05rem] leading-relaxed text-white/85 max-w-[420px]">
          Experience the most advanced workspace management tool. Join thousands of teams worldwide.
        </p>
      </div>

      {/* RIGHT PANEL */}
      <div
        className="flex-1 p-12 bg-white flex items-center border-l border-black/[0.06] md:border-l-0 md:p-8 sm:p-6"
        {...fadeIn({ direction: "up", distance: 80, duration: 0.9 })}
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full flex flex-col gap-4">
          {/* Mobile header */}
          <div className="hidden md:block text-center mb-4">
            <h2 className="text-2xl font-bold mb-1">Create Account</h2>
            <p className="text-black/60">Enter your details to get started</p>
          </div>

          {errors.root?.message && (
            <span className="text-[0.75rem] font-medium text-red-500">{errors.root.message}</span>
          )}

          {fields.map(({ label, name, type, placeholder, Icon, autoComplete }) => (
            <div key={name} className="flex flex-col gap-2">
              <label className="text-[0.85rem] font-semibold text-gray-900">{label}</label>
              <div className="relative flex items-center">
                <Icon size={18} className="absolute left-4 text-black/45" />
                <input
                  type={type}
                  placeholder={placeholder}
                  autoComplete={autoComplete}
                  className={inputCls(errors[name])}
                  {...fadeIn({ direction: "left", distance: 80, duration: 0.9 })}
                  {...register(name)}
                />
              </div>
              {errors[name] && (
                <span className="text-[0.75rem] font-medium text-red-500">{errors[name].message}</span>
              )}
            </div>
          ))}

          <button
            className="mt-3 bg-brand text-white py-4 px-4 border-0 rounded-xl text-[0.95rem] font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all hover:bg-brand-dark hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Account..." : "Sign Up"}
            {!isSubmitting && <ArrowRight size={18} />}
          </button>

          <p className="text-center text-[0.85rem] text-black/60 mt-3">
            Already have an account?{" "}
            <Link to="/login" className="text-brand font-bold no-underline">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
