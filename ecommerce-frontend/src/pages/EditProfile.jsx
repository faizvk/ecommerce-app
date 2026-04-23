import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchProfileThunk,
  updateProfileThunk,
  clearUserState,
} from "../redux/slice/userSlice";

const inputCls = "w-full py-3.5 px-4 rounded-xl border border-black/15 bg-[#f9f9fb] text-[0.95rem] outline-none transition-all focus:border-brand focus:bg-white focus:shadow-[0_0_0_3px_rgba(56,89,139,0.15)]";

export default function EditProfile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { profile, loading, error } = useSelector((state) => state.user);

  const [data, setData] = useState({ name: "", age: "", address: "", contact: "" });

  useEffect(() => {
    dispatch(fetchProfileThunk());
    return () => { dispatch(clearUserState()); };
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
    return <p className="text-center py-12 text-xl text-brand">Loading...</p>;
  }

  const fields = [
    { label: "Full Name", key: "name", type: "text", placeholder: "Full Name" },
    { label: "Age", key: "age", type: "number", placeholder: "Age" },
    { label: "Address", key: "address", type: "text", placeholder: "Address" },
    { label: "Contact", key: "contact", type: "number", placeholder: "Contact" },
  ];

  return (
    <div className="flex w-full max-w-[1100px] min-h-[600px] bg-white border border-black/[0.08] rounded-xl mx-auto my-5 overflow-hidden shadow-card md:flex-col md:max-w-[500px] md:min-h-0 md:mx-4 sm:mx-2.5 sm:rounded-lg">
      {/* LEFT PANEL */}
      <div className="flex-[1.1] p-12 flex flex-col justify-center bg-brand-dark text-white md:hidden">
        <span className="inline-flex items-center px-4 py-2 bg-white/15 border border-white/30 rounded-full text-[0.7rem] font-bold tracking-[0.15em] uppercase mb-6">
          Profile
        </span>
        <h1 className="text-[2.8rem] font-extrabold leading-[1.1] mb-5 tracking-tight">
          Edit your profile
        </h1>
        <p className="text-[1.05rem] leading-relaxed text-white/85 max-w-[420px]">
          Update your personal information and keep it up to date.
        </p>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 p-12 bg-white flex items-center border-l border-black/[0.06] md:border-l-0 md:p-8 sm:p-6">
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          {/* Mobile header */}
          <div className="hidden md:block text-center mb-4">
            <h2 className="text-2xl font-bold mb-1">Edit Profile</h2>
            <p className="text-black/60">Update your personal details</p>
          </div>

          {error && <span className="text-[0.75rem] font-medium text-red-500">{error}</span>}

          {fields.map(({ label, key, type, placeholder }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-[0.85rem] font-semibold text-gray-900">{label}</label>
              <input
                type={type}
                className={inputCls}
                placeholder={placeholder}
                value={data[key]}
                onChange={(e) => setData({ ...data, [key]: e.target.value })}
                required={key === "name"}
              />
            </div>
          ))}

          <button
            className="mt-3 bg-brand text-white py-4 px-4 border-0 rounded-xl text-[0.95rem] font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all hover:bg-brand-dark hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>

          <button
            type="button"
            className="bg-gray-100 text-gray-700 py-4 px-4 border-0 rounded-xl text-[0.95rem] font-semibold cursor-pointer transition-all hover:bg-gray-200"
            onClick={() => navigate("/profile")}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
