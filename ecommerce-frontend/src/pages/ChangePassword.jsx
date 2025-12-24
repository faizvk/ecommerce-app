import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { updatePasswordThunk, clearUserState } from "../redux/slice/userSlice";
import Button from "../components/Button";
import "./styles/Form.css";

export default function ChangePassword() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  /* =========================
     REDUX STATE
  ========================= */
  const { loading, error, success } = useSelector((state) => state.user);

  /* =========================
     LOCAL FORM STATE
  ========================= */
  const [data, setData] = useState({
    oldPassword: "",
    newPassword: "",
  });

  const [localError, setLocalError] = useState("");

  /* =========================
     CLEANUP ON UNMOUNT
  ========================= */
  useEffect(() => {
    return () => {
      dispatch(clearUserState());
    };
  }, [dispatch]);

  /* =========================
     PASSWORD VALIDATION
  ========================= */
  const validatePassword = (pass) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,16}$/;
    return regex.test(pass);
  };

  /* =========================
     SUBMIT
  ========================= */
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

    if (updatePasswordThunk.fulfilled.match(res)) {
      setTimeout(() => navigate("/profile"), 1200);
    }
  };

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="form-container">
      <h2>Change Password</h2>

      {localError && <p className="error">{localError}</p>}
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Old Password"
          value={data.oldPassword}
          onChange={(e) => setData({ ...data, oldPassword: e.target.value })}
          required
        />

        <input
          type="password"
          placeholder="New Password"
          value={data.newPassword}
          onChange={(e) => setData({ ...data, newPassword: e.target.value })}
          required
        />

        <Button variant="primary" disabled={loading}>
          {loading ? "Updating..." : "Update Password"}
        </Button>

        <Button
          variant="secondary"
          type="button"
          onClick={() => navigate("/profile")}
          style={{ marginTop: "10px" }}
        >
          Cancel
        </Button>
      </form>
    </div>
  );
}
