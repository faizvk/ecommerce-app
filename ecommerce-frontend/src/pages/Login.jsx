import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, LogIn } from "lucide-react";
import { loginSchema } from "../utils/signUpSchema";
import { useNavigate, Link } from "react-router-dom";
import { fadeIn } from "../animations/FadeIn";
import { useDispatch, useSelector } from "react-redux";
import { loginThunk } from "../redux/slice/authSlice";
import "./styles/Form.css";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      const res = await dispatch(loginThunk(data)).unwrap();

      navigate(res.user.role === "admin" ? "/admin" : "/", {
        replace: true,
      });
    } catch (err) {
      setError("root", {
        message: err || "Invalid email or password",
      });
    }
  };

  return (
    <div className="form-main">
      {/* LEFT PANEL */}
      <div className="form-head">
        <div
          className="head-content"
          {...fadeIn({ direction: "left", distance: 80, duration: 0.9 })}
        >
          <span className="badge">Welcome Back</span>
          <h1>Sign in to continue.</h1>
          <p>Access your dashboard and manage your workspace efficiently.</p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div
        className="form-container"
        {...fadeIn({ direction: "up", distance: 80, duration: 0.9 })}
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="auth-form"
        >
          {/* MOBILE HEADER */}
          <div className="form-header-mobile">
            <h2>Login</h2>
            <p>Enter your credentials to continue</p>
          </div>

          {errors.root?.message && (
            <span className="error-text">{errors.root.message}</span>
          )}

          {/* EMAIL */}
          <div className="input-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                autoComplete="email"
                placeholder="name@company.com"
                className={
                  errors.email ? "input-error form-input" : "form-input"
                }
                {...fadeIn({ direction: "left", distance: 80, duration: 0.9 })}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <span className="error-text">{errors.email.message}</span>
            )}
          </div>

          {/* PASSWORD */}
          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className={
                  errors.password ? "input-error form-input" : "form-input"
                }
                {...fadeIn({ direction: "left", distance: 80, duration: 0.9 })}
                {...register("password")}
              />
            </div>
            {errors.password && (
              <span className="error-text">{errors.password.message}</span>
            )}
          </div>

          <button className="submit-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
            {!loading && <LogIn size={18} />}
          </button>

          <p className="footer-text">
            Don’t have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
