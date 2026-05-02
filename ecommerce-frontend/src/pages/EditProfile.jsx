import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  fetchProfileThunk,
  updateProfileThunk,
} from "../redux/slice/userSlice";
import { notify } from "../utils/notify";
import { fadeIn } from "../animations/fadeIn";
import {
  User as UserIcon, Calendar, MapPin, Phone, ShoppingBag,
  ArrowLeft, Save, Sparkles,
} from "lucide-react";

const inputCls = (err) =>
  `w-full py-3 px-4 pl-12 rounded-xl border bg-gray-50 text-[0.92rem] outline-none transition-all focus:border-brand focus:bg-white focus:shadow-[0_0_0_3px_rgba(79,70,229,0.15)] ${
    err ? "border-red-300 bg-red-50/40" : "border-gray-200 hover:border-gray-300"
  }`;

const FIELDS = [
  { label: "Full Name",      key: "name",    type: "text",   placeholder: "Your name",        Icon: UserIcon, required: true },
  { label: "Age",            key: "age",     type: "number", placeholder: "e.g. 28",          Icon: Calendar },
  { label: "Address",        key: "address", type: "text",   placeholder: "Street, city",     Icon: MapPin },
  { label: "Contact Number", key: "contact", type: "tel",    placeholder: "10-digit mobile",  Icon: Phone, pattern: "[0-9]{10}" },
];

export default function EditProfile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { profile, loading, error } = useSelector((state) => state.user);

  const [data, setData] = useState({ name: "", age: "", address: "", contact: "" });
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    dispatch(fetchProfileThunk());
    // Note: we intentionally do NOT clear state on unmount — Profile page
    // should re-use the fresh data and show the updated values immediately.
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

  const validate = () => {
    const errs = {};
    if (!data.name.trim()) errs.name = "Name is required";
    if (data.age && (Number(data.age) < 10 || Number(data.age) > 120)) errs.age = "Enter a valid age";
    if (data.contact && !/^\d{10}$/.test(String(data.contact))) errs.contact = "Must be 10 digits";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      notify.warn("Please fix the highlighted fields");
      return;
    }
    setSaving(true);
    try {
      const res = await dispatch(updateProfileThunk(data));
      if (updateProfileThunk.fulfilled.match(res)) {
        notify.success({ title: "Profile updated", desc: "Your changes have been saved" });
        navigate("/profile");
      } else {
        notify.error(res.payload || "Failed to update profile");
      }
    } finally {
      setSaving(false);
    }
  };

  // Initial profile fetch
  if (loading && !profile) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin w-10 h-10 rounded-full border-4 border-brand-medium border-t-brand" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-65px)] flex items-center justify-center px-4 py-8 md:py-12">
      <div
        className="w-full max-w-[1100px] grid md:grid-cols-2 bg-white rounded-3xl shadow-[0_24px_60px_rgba(79,70,229,0.15)] overflow-hidden border border-gray-100"
        {...fadeIn({ direction: "up", distance: 30, duration: 0.5 })}
      >
        {/* LEFT HERO */}
        <aside className="hidden md:flex flex-col justify-between p-10 lg:p-12 bg-gradient-to-br from-brand-dark via-brand to-[#7c3aed] text-white relative overflow-hidden">
          <div className="absolute -top-20 -right-16 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-16 w-80 h-80 bg-white/5 rounded-full blur-3xl" />

          <Link to="/" className="relative no-underline flex items-center gap-2.5 w-fit">
            <div className="w-10 h-10 bg-white/15 border border-white/25 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <ShoppingBag size={20} className="text-white" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight leading-none">
              <span className="text-white">Nex</span>
              <span className="text-brand-medium">Kart</span>
            </span>
          </Link>

          <div className="relative">
            <span className="inline-flex items-center gap-1.5 mb-5 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-[0.65rem] font-bold uppercase tracking-[0.18em]">
              <Sparkles size={11} />
              Account settings
            </span>
            <h1 className="text-3xl lg:text-[2.4rem] font-extrabold leading-[1.1] tracking-tight mb-3">
              Update your profile.
            </h1>
            <p className="text-white/75 text-[0.95rem] leading-relaxed max-w-sm">
              Keep your contact info and address current so we can deliver to the right place — quickly.
            </p>
          </div>

          <Link
            to="/profile"
            className="relative inline-flex items-center gap-1.5 text-[0.82rem] font-semibold text-white/70 hover:text-white no-underline transition-colors w-fit"
          >
            <ArrowLeft size={14} />
            Back to profile
          </Link>
        </aside>

        {/* RIGHT FORM */}
        <div className="p-6 sm:p-8 md:p-10 lg:p-12 flex items-center">
          <form onSubmit={handleSubmit} noValidate className="w-full flex flex-col gap-4">
            <div>
              <h2 className="text-2xl md:text-[1.65rem] font-extrabold text-gray-900 leading-tight">Edit profile</h2>
              <p className="text-[0.85rem] text-gray-500 mt-1">Make changes and save when you're done.</p>
            </div>

            {error && !Object.keys(fieldErrors).length && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3.5">
                <p className="text-[0.82rem] font-medium text-red-700">{error}</p>
              </div>
            )}

            {FIELDS.map(({ label, key, type, placeholder, Icon, required, pattern }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label className="text-[0.82rem] font-bold text-gray-700">
                  {label} {required && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={type}
                    pattern={pattern}
                    placeholder={placeholder}
                    className={inputCls(fieldErrors[key])}
                    value={data[key]}
                    onChange={(e) => setData((d) => ({ ...d, [key]: e.target.value }))}
                    required={required}
                  />
                </div>
                {fieldErrors[key] && (
                  <span className="text-[0.72rem] font-medium text-red-500">{fieldErrors[key]}</span>
                )}
              </div>
            ))}

            <div className="flex flex-col-reverse sm:flex-row gap-2 mt-3">
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="flex-1 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl text-[0.92rem] font-semibold cursor-pointer transition-all hover:bg-gray-50 hover:border-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-brand to-[#7c3aed] text-white py-3 rounded-xl text-[0.92rem] font-bold cursor-pointer transition-all hover:opacity-90 hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_8px_24px_rgba(79,70,229,0.25)] border-0"
              >
                <Save size={15} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
