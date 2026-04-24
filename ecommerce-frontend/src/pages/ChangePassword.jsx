import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  updatePasswordThunk,
  clearUserState,
  setPasswordThunk,
} from "../redux/slice/userSlice";

const inputCls = "w-full py-3.5 px-4 rounded-xl border border-black/15 bg-[#f9f9fb] text-[0.95rem] outline-none transition-all focus:border-brand focus:bg-white focus:shadow-[0_0_0_3px_rgba(56,89,139,0.15)]";

export default function ChangePassword() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error, success, profile } = useSelector((state) => state.user);

  const [googleOnly, setGoogleOnly] = useState(false);
  const [showSetPassword, setShowSetPassword] = useState(false);
  const [data, setData] = useState({ oldPassword: "", newPassword: "" });
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    return () => { dispatch(clearUserState()); };
  }, [dispatch]);

  useEffect(() => {
    if (profile?.provider === "google") setGoogleOnly(true);
  }, [profile]);

  const validatePassword = (pass) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,16}$/.test(pass);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    if (!validatePassword(data.newPassword)) {
      setLocalError("Password must be 8–16 chars and include uppercase, lowercase, number & symbol.");
      return;
    }
    const res = await dispatch(updatePasswordThunk(data));
    if (updatePasswordThunk.rejected.match(res) && res.payload === "GOOGLE_ACCOUNT_NO_PASSWORD") {
      setGoogleOnly(true);
      return;
    }
    if (updatePasswordThunk.fulfilled.match(res)) {
      setTimeout(() => navigate("/profile"), 1200);
    }
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setLocalError("");
    if (!validatePassword(data.newPassword)) {
      setLocalError("Password must be 8–16 chars and include uppercase, lowercase, number & symbol.");
      return;
    }
    const res = await dispatch(setPasswordThunk({ newPassword: data.newPassword }));
    if (setPasswordThunk.fulfilled.match(res)) {
      setTimeout(() => navigate("/profile"), 1200);
    }
  };

  return (
    <div className="flex w-full max-w-[1100px] min-h-[600px] bg-white border border-black/[0.08] rounded-xl mx-auto my-5 overflow-hidden shadow-card md:flex-col md:max-w-[500px] md:min-h-0 md:mx-4 sm:mx-2.5 sm:rounded-lg">
      {/* LEFT PANEL */}
      <div className="flex-[1.1] p-12 flex flex-col justify-center bg-brand-dark text-white md:hidden">
        <span className="inline-flex items-center px-4 py-2 bg-white/15 border border-white/30 rounded-full text-[0.7rem] font-bold tracking-[0.15em] uppercase mb-6">
          Security
        </span>
        <h1 className="text-[2.8rem] font-extrabold leading-[1.1] mb-5 tracking-tight">
          Update your password
        </h1>
        <p className="text-[1.05rem] leading-relaxed text-white/85 max-w-[420px]">
          Keep your account secure by choosing a strong and unique password.
        </p>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 p-12 bg-white flex items-center border-l border-black/[0.06] md:border-l-0 md:p-8 sm:p-6">
        {googleOnly ? (
          <div className="w-full flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-gray-900">Password Not Available</h2>
            <p className="text-[0.9rem] text-black/60">
              This account was created using Google sign-in. You do not have a password yet.
            </p>

            {!showSetPassword ? (
              <>
                <p className="text-[0.9rem] text-black/60">
                  You can continue using Google, or create a password for email login.
                </p>
                <button
                  className="bg-brand text-white py-4 px-4 border-0 rounded-xl text-[0.95rem] font-semibold cursor-pointer transition-all hover:bg-brand-dark hover:-translate-y-px"
                  onClick={() => setShowSetPassword(true)}
                >
                  Set a Password
                </button>
                <button
                  className="bg-gray-100 text-gray-700 py-4 px-4 border-0 rounded-xl text-[0.95rem] font-semibold cursor-pointer transition-all hover:bg-gray-200"
                  onClick={() => navigate("/profile")}
                >
                  Back to Profile
                </button>
              </>
            ) : (
              <form onSubmit={handleSetPassword} className="flex flex-col gap-4">
                {(localError || error) && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <span className="text-[0.75rem] font-medium text-red-600">{localError || error}</span>
                  </div>
                )}
                {success && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <span className="text-[0.75rem] font-medium text-green-700">{success}</span>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.85rem] font-semibold text-gray-900">New Password</label>
                  <input
                    type="password"
                    className={inputCls}
                    placeholder="Create a password"
                    value={data.newPassword}
                    onChange={(e) => setData({ ...data, newPassword: e.target.value })}
                    required
                  />
                </div>

                <button
                  className="mt-1 bg-brand text-white py-4 px-4 border-0 rounded-xl text-[0.95rem] font-semibold cursor-pointer transition-all hover:bg-brand-dark hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? "Setting..." : "Set Password"}
                </button>
                <button
                  type="button"
                  className="bg-gray-100 text-gray-700 py-4 px-4 border-0 rounded-xl text-[0.95rem] font-semibold cursor-pointer transition-all hover:bg-gray-200"
                  onClick={() => setShowSetPassword(false)}
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            {/* Mobile header */}
            <div className="hidden md:block text-center mb-4">
              <h2 className="text-2xl font-bold mb-1">Change Password</h2>
              <p className="text-black/60">Update your account security</p>
            </div>

            {(localError || error) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <span className="text-[0.75rem] font-medium text-red-600">{localError || error}</span>
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <span className="text-[0.75rem] font-medium text-green-700">{success}</span>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.85rem] font-semibold text-gray-900">Old Password</label>
              <input
                type="password"
                className={inputCls}
                placeholder="Enter old password"
                value={data.oldPassword}
                onChange={(e) => setData({ ...data, oldPassword: e.target.value })}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.85rem] font-semibold text-gray-900">New Password</label>
              <input
                type="password"
                className={inputCls}
                placeholder="Enter new password"
                value={data.newPassword}
                onChange={(e) => setData({ ...data, newPassword: e.target.value })}
                required
              />
            </div>

            <button
              className="mt-3 bg-brand text-white py-4 px-4 border-0 rounded-xl text-[0.95rem] font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all hover:bg-brand-dark hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
            <button
              type="button"
              className="bg-gray-100 text-gray-700 py-4 px-4 border-0 rounded-xl text-[0.95rem] font-semibold cursor-pointer transition-all hover:bg-gray-200"
              onClick={() => navigate("/profile")}
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
