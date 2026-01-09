import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  updatePasswordThunk,
  clearUserState,
  setPasswordThunk, // <-- make sure this exists in your slice
} from "../redux/slice/userSlice";
import Button from "../components/Button";
import "./styles/Form.css";

export default function ChangePassword() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error, success, profile } = useSelector(
    (state) => state.user
  );

  const [googleOnly, setGoogleOnly] = useState(false);
  const [showSetPassword, setShowSetPassword] = useState(false);

  const [data, setData] = useState({
    oldPassword: "",
    newPassword: "",
  });

  const [localError, setLocalError] = useState("");

  /* Clear redux messages on unmount */
  useEffect(() => {
    return () => {
      dispatch(clearUserState());
    };
  }, [dispatch]);

  /* Detect Google-only accounts */
  useEffect(() => {
    if (profile?.provider === "google") {
      setGoogleOnly(true);
    }
  }, [profile]);

  /* Password strength validation */
  const validatePassword = (pass) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,16}$/;
    return regex.test(pass);
  };

  /* Handle normal password change */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (!validatePassword(data.newPassword)) {
      setLocalError(
        "Password must be 8–16 chars and include uppercase, lowercase, number & symbol."
      );
      return;
    }

    const res = await dispatch(updatePasswordThunk(data));

    if (updatePasswordThunk.rejected.match(res)) {
      if (res.payload === "GOOGLE_ACCOUNT_NO_PASSWORD") {
        setGoogleOnly(true);
        return;
      }
    }

    if (updatePasswordThunk.fulfilled.match(res)) {
      setTimeout(() => navigate("/profile"), 1200);
    }
  };

  /* Handle setting a password for Google users */
  const handleSetPassword = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (!validatePassword(data.newPassword)) {
      setLocalError(
        "Password must be 8–16 chars and include uppercase, lowercase, number & symbol."
      );
      return;
    }

    const res = await dispatch(
      setPasswordThunk({ newPassword: data.newPassword })
    );

    if (setPasswordThunk.fulfilled.match(res)) {
      setTimeout(() => navigate("/profile"), 1200);
    }
  };

  return (
    <div className="form-main">
      {/* LEFT PANEL */}
      <div className="form-head">
        <div className="head-content">
          <span className="badge">Security</span>
          <h1>Update your password</h1>
          <p>
            Keep your account secure by choosing a strong and unique password.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="form-container">
        {googleOnly ? (
          <div className="auth-form">
            <h2>Password Not Available</h2>

            <p className="footer-text">
              This account was created using Google sign-in. You do not have a
              password yet.
            </p>

            {!showSetPassword ? (
              <>
                <p className="footer-text">
                  You can continue using Google, or create a password for email
                  login.
                </p>

                <Button
                  variant="primary"
                  onClick={() => setShowSetPassword(true)}
                  style={{ marginTop: "12px" }}
                >
                  Set a Password
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => navigate("/profile")}
                  style={{ marginTop: "10px" }}
                >
                  Back to Profile
                </Button>
              </>
            ) : (
              <form onSubmit={handleSetPassword} className="auth-form">
                {localError && <span className="error-text">{localError}</span>}
                {error && <span className="error-text">{error}</span>}
                {success && <span className="success-text">{success}</span>}

                <div className="input-group">
                  <label>New Password</label>
                  <div className="input-wrapper">
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Create a password"
                      value={data.newPassword}
                      onChange={(e) =>
                        setData({ ...data, newPassword: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <button className="submit-btn" disabled={loading}>
                  {loading ? "Setting..." : "Set Password"}
                </button>

                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setShowSetPassword(false)}
                  style={{ marginTop: "10px" }}
                >
                  Cancel
                </Button>
              </form>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-header-mobile">
              <h2>Change Password</h2>
              <p>Update your account security</p>
            </div>

            {localError && <span className="error-text">{localError}</span>}
            {error && <span className="error-text">{error}</span>}
            {success && <span className="success-text">{success}</span>}

            {/* OLD PASSWORD */}
            <div className="input-group">
              <label>Old Password</label>
              <div className="input-wrapper">
                <input
                  type="password"
                  placeholder="Enter old password"
                  className="form-input"
                  value={data.oldPassword}
                  onChange={(e) =>
                    setData({ ...data, oldPassword: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* NEW PASSWORD */}
            <div className="input-group">
              <label>New Password</label>
              <div className="input-wrapper">
                <input
                  type="password"
                  placeholder="Enter new password"
                  className="form-input"
                  value={data.newPassword}
                  onChange={(e) =>
                    setData({ ...data, newPassword: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <button className="submit-btn" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </button>

            <Button
              variant="secondary"
              type="button"
              onClick={() => navigate("/profile")}
              style={{ marginTop: "10px" }}
            >
              Cancel
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
