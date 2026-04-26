import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchProfileThunk,
  updateProfileThunk,
  clearUserState,
} from "../redux/slice/userSlice";

const inputCls = "w-full py-3.5 px-4 rounded-xl border border-black/15 bg-[#f9f9fb] text-[0.95rem] outline-none transition-all focus:border-brand focus:bg-white focus:shadow-[0_0_0_3px_rgba(79,70,229,0.15)]";

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
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin w-10 h-10 rounded-full border-4 border-brand-medium border-t-brand" />
      </div>
    );
  }

  const fields = [
    { label: "Full Name", key: "name", type: "text", placeholder: "Full Name" },
    { label: "Age", key: "age", type: "number", placeholder: "Age" },
    { label: "Address", key: "address", type: "text", placeholder: "Address" },
    { label: "Contact", key: "contact", type: "number", placeholder: "Contact" },
  ];

  return (
    <div className="w-full px-4 py-6 md:py-8">
      <div className="w-full max-w-[480px] mx-auto md:max-w-[1100px]">
        <div className="bg-white border border-black/[0.08] rounded-xl overflow-hidden shadow-card flex flex-col md:flex-row md:min-h-[600px]">

          {/* LEFT PANEL — hidden on mobile */}
          <div className="hidden md:flex flex-[1.1] p-12 flex-col justify-center bg-brand-dark text-white">
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
          <div className="flex-1 p-6 sm:p-8 md:p-12 bg-white flex items-center md:border-l md:border-black/[0.06]">
            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
              <div className="text-center mb-2 md:hidden">
                <h2 className="text-2xl font-bold mb-1">Edit Profile</h2>
                <p className="text-black/60 text-sm">Update your personal details</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <span className="text-[0.75rem] font-medium text-red-500">{error}</span>
                </div>
              )}

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
      </div>
    </div>
  );
}
