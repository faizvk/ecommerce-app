import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { fetchProfileThunk } from "../redux/slice/userSlice";
import { fadeIn } from "../animations/fadeIn";
import "./styles/Form.css";

export default function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user: authUser, loading: authLoading } = useSelector(
    (state) => state.auth
  );

  const {
    profile,
    loading: profileLoading,
    error,
  } = useSelector((state) => state.user);

  if (!authLoading && authUser?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  useEffect(() => {
    if (!authLoading && authUser) {
      dispatch(fetchProfileThunk());
    }
  }, [authLoading, authUser, dispatch]);

  if (authLoading || profileLoading) {
    return <p className="loading">Loading profile...</p>;
  }

  if (error) {
    return <p className="error-text">{error}</p>;
  }

  if (!profile) {
    return <p className="loading-text">Profile not found</p>;
  }

  return (
    <div className="form-main">
      {/* LEFT PANEL */}
      <div className="form-head">
        <div
          className="head-content"
          {...fadeIn({ direction: "right", distance: 80, duration: 0.9 })}
        >
          <span className="badge">Account</span>
          <h1>My Profile</h1>
          <p>View and manage your personal information.</p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="form-container">
        <div
          className="auth-form"
          {...fadeIn({ direction: "up", distance: 80, duration: 0.9 })}
        >
          {/* PROFILE FIELDS */}
          <div className="input-group">
            <label>Email</label>
            <p className="form-input" style={{ paddingLeft: "16px" }}>
              {profile.email}
            </p>
          </div>

          {profile.age && (
            <div className="input-group">
              <label>Age</label>
              <p className="form-input" style={{ paddingLeft: "16px" }}>
                {profile.age}
              </p>
            </div>
          )}

          {profile.contact && (
            <div className="input-group">
              <label>Contact</label>
              <p className="form-input" style={{ paddingLeft: "16px" }}>
                {profile.contact}
              </p>
            </div>
          )}

          {profile.address && (
            <div className="input-group">
              <label>Address</label>
              <p className="form-input" style={{ paddingLeft: "16px" }}>
                {profile.address}
              </p>
            </div>
          )}

          {/* ACTIONS */}
          <div style={{ marginTop: "20px" }}>
            <button
              className="submit-btn"
              onClick={() => navigate("/profile/edit")}
            >
              Edit Profile
            </button>

            <button
              className="submit-btn"
              style={{ background: "var(--color-fourth)" }}
              onClick={() => navigate("/profile/password")}
            >
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
