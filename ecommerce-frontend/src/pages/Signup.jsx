import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema } from "../utils/signUpSchema";
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../api/user.api";
import { fadeIn } from "../animations/FadeIn";
import "./styles/Form.css";

export default function SignUp() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
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
      setError("root", {
        message: err.response?.data?.message || "Signup failed. Try again.",
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
          <span className="badge">Platform Access</span>
          <h1>Start your journey with us.</h1>
          <p>
            Experience the most advanced workspace management tool. Join
            thousands of teams worldwide.
          </p>
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
            <h2>Create Account</h2>
            <p>Enter your details to get started</p>
          </div>

          {/* GLOBAL ERROR */}
          {errors.root?.message && (
            <span className="error-text">{errors.root.message}</span>
          )}

          {/* FULL NAME */}
          <div className="input-group">
            <label>Full Name</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input
                type="text"
                placeholder="John Doe"
                autoComplete="name"
                className={
                  errors.fullName ? "input-error form-input" : "form-input"
                }
                {...fadeIn({ direction: "left", distance: 80, duration: 0.9 })}
                {...register("fullName")}
              />
            </div>
            {errors.fullName && (
              <span className="error-text">{errors.fullName.message}</span>
            )}
          </div>

          {/* AGE */}
          <div className="input-group">
            <label>Age</label>
            <div className="input-wrapper">
              <Calendar size={18} className="input-icon" />
              <input
                type="number"
                min="1"
                placeholder="Age"
                className={errors.age ? "input-error form-input" : "form-input"}
                {...fadeIn({ direction: "left", distance: 80, duration: 0.9 })}
                {...register("age")}
              />
            </div>
            {errors.age && (
              <span className="error-text">{errors.age.message}</span>
            )}
          </div>

          {/* EMAIL */}
          <div className="input-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                placeholder="name@company.com"
                autoComplete="email"
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

          {/* ADDRESS */}
          <div className="input-group">
            <label>Address</label>
            <div className="input-wrapper">
              <MapPin size={18} className="input-icon" />
              <input
                type="text"
                placeholder="Your address"
                className={
                  errors.address ? "input-error form-input" : "form-input"
                }
                {...fadeIn({ direction: "left", distance: 80, duration: 0.9 })}
                {...register("address")}
              />
            </div>
            {errors.address && (
              <span className="error-text">{errors.address.message}</span>
            )}
          </div>

          {/* CONTACT */}
          <div className="input-group">
            <label>Contact Number</label>
            <div className="input-wrapper">
              <Phone size={18} className="input-icon" />
              <input
                type="text"
                placeholder="Contact number"
                className={
                  errors.contact ? "input-error form-input" : "form-input"
                }
                {...fadeIn({ direction: "left", distance: 80, duration: 0.9 })}
                {...register("contact")}
              />
            </div>
            {errors.contact && (
              <span className="error-text">{errors.contact.message}</span>
            )}
          </div>

          {/* PASSWORD */}
          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
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

          {/* SUBMIT */}
          <button className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? "Creating Account..." : "Sign Up"}
            {!isSubmitting && <ArrowRight size={18} />}
          </button>

          <p className="footer-text">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
