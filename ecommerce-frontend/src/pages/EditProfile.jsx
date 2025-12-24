import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchProfileThunk,
  updateProfileThunk,
  clearUserState,
} from "../redux/slice/userSlice";
import Button from "../components/Button";
import "./styles/EditProfile.css";

export default function EditProfile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  /* =========================
     REDUX STATE
  ========================= */
  const { profile, loading, error } = useSelector((state) => state.user);

  /* =========================
     LOCAL FORM STATE
  ========================= */
  const [data, setData] = useState({
    name: "",
    age: "",
    address: "",
    contact: "",
  });

  /* =========================
     LOAD PROFILE
  ========================= */
  useEffect(() => {
    dispatch(fetchProfileThunk());

    return () => {
      dispatch(clearUserState());
    };
  }, [dispatch]);

  /* =========================
     SYNC REDUX → FORM
  ========================= */
  useEffect(() => {
    if (!profile) return;

    setData({
      name: profile.name || "",
      age: profile.age || "",
      address: profile.address || "",
      contact: profile.contact || "",
    });
  }, [profile]);

  /* =========================
     SUBMIT UPDATE
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await dispatch(updateProfileThunk(data));

    if (updateProfileThunk.fulfilled.match(res)) {
      navigate("/profile");
    }
  };

  /* =========================
     LOADING
  ========================= */
  if (loading && !profile) {
    return <p className="loading">Loading...</p>;
  }

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="edit-profile-wrapper">
      <h2 className="edit-profile-title">Edit Profile</h2>

      {error && <p className="edit-error">{error}</p>}

      <form className="edit-profile-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Full Name"
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
          required
        />

        <input
          type="number"
          placeholder="Age"
          value={data.age}
          onChange={(e) => setData({ ...data, age: e.target.value })}
        />

        <input
          type="text"
          placeholder="Address"
          value={data.address}
          onChange={(e) => setData({ ...data, address: e.target.value })}
        />

        <input
          type="number"
          placeholder="Contact"
          value={data.contact}
          onChange={(e) => setData({ ...data, contact: e.target.value })}
        />

        <Button variant="primary">Save Changes</Button>

        <button
          type="button"
          className="edit-cancel-btn"
          onClick={() => navigate("/profile")}
        >
          Cancel
        </button>
      </form>
    </div>
  );
}
