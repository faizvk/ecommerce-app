import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchProfileThunk,
  updateProfileThunk,
  clearUserState,
} from "../redux/slice/userSlice";
import Button from "../components/Button";
import "./styles/Form.css";

export default function EditProfile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { profile, loading, error } = useSelector((state) => state.user);

  const [data, setData] = useState({
    name: "",
    age: "",
    address: "",
    contact: "",
  });

  useEffect(() => {
    dispatch(fetchProfileThunk());

    return () => {
      dispatch(clearUserState());
    };
  }, [dispatch]);

  useEffect(() => {
    if (!profile) return;

    setData({
      name: profile.name || "",
      age: profile.age || "",
      address: profile.address || "",
      contact: profile.contact || "",
    });
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await dispatch(updateProfileThunk(data));

    if (updateProfileThunk.fulfilled.match(res)) {
      navigate("/profile");
    }
  };

  if (loading && !profile) {
    return <p className="loading">Loading...</p>;
  }

  return (
    <div className="form-main">
      {/* LEFT PANEL */}
      <div className="form-head">
        <div className="head-content">
          <span className="badge">Profile</span>
          <h1>Edit your profile</h1>
          <p>Update your personal information and keep it up to date.</p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="form-container">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-header-mobile">
            <h2>Edit Profile</h2>
            <p>Update your personal details</p>
          </div>

          {error && <span className="error-text">{error}</span>}

          {/* NAME */}
          <div className="input-group">
            <label>Full Name</label>
            <div className="input-wrapper">
              <input
                type="text"
                className="form-input"
                placeholder="Full Name"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                required
              />
            </div>
          </div>

          {/* AGE */}
          <div className="input-group">
            <label>Age</label>
            <div className="input-wrapper">
              <input
                type="number"
                className="form-input"
                placeholder="Age"
                value={data.age}
                onChange={(e) => setData({ ...data, age: e.target.value })}
              />
            </div>
          </div>

          {/* ADDRESS */}
          <div className="input-group">
            <label>Address</label>
            <div className="input-wrapper">
              <input
                type="text"
                className="form-input"
                placeholder="Address"
                value={data.address}
                onChange={(e) => setData({ ...data, address: e.target.value })}
              />
            </div>
          </div>

          {/* CONTACT */}
          <div className="input-group">
            <label>Contact</label>
            <div className="input-wrapper">
              <input
                type="number"
                className="form-input"
                placeholder="Contact"
                value={data.contact}
                onChange={(e) => setData({ ...data, contact: e.target.value })}
              />
            </div>
          </div>

          <button className="submit-btn" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
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
      </div>
    </div>
  );
}
