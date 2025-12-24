import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { fetchProfileThunk } from "../redux/slice/userSlice";
import { fadeIn } from "../animations/FadeIn";
import "./styles/Profile.css";

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
    return <p className="loading-text error-text">{error}</p>;
  }

  if (!profile) {
    return <p className="loading-text">Profile not found</p>;
  }

  return (
    <div className="profile-container">
      <h1 className="profile-title">My Profile</h1>

      <div className="profile-card">
        <div
          className="profile-left"
          {...fadeIn({ direction: "right", distance: 80, duration: 0.9 })}
        >
          <div className="profile-avatar-circle">
            {profile.name?.charAt(0)?.toUpperCase()}
          </div>

          <span className="profile-role-badge">{profile.name}</span>
        </div>

        <div
          className="profile-right"
          {...fadeIn({ direction: "up", distance: 80, duration: 0.9 })}
        >
          <div className="profile-field">
            <label>Email</label>
            <p>{profile.email}</p>
          </div>

          {profile.age && (
            <div className="profile-field">
              <label>Age</label>
              <p>{profile.age}</p>
            </div>
          )}

          {profile.contact && (
            <div className="profile-field">
              <label>Contact</label>
              <p>{profile.contact}</p>
            </div>
          )}

          {profile.address && (
            <div className="profile-field">
              <label>Address</label>
              <p>{profile.address}</p>
            </div>
          )}

          <div
            className="profile-actions"
            {...fadeIn({ direction: "left", distance: 80, duration: 0.9 })}
          >
            <button
              className="profile-btn edit"
              onClick={() => navigate("/profile/edit")}
            >
              Edit Profile
            </button>

            <button
              className="profile-btn password"
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
