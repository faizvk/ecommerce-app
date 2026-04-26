import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { fetchProfileThunk } from "../redux/slice/userSlice";
import { fadeIn } from "../animations/fadeIn";
import { Mail, Phone, MapPin, Calendar, Pencil, Lock, User } from "lucide-react";

const FIELD_ICONS = {
  Email: Mail,
  Age: Calendar,
  Contact: Phone,
  Address: MapPin,
};

export default function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user: authUser, loading: authLoading } = useSelector((state) => state.auth);
  const { profile, loading: profileLoading, error } = useSelector((state) => state.user);

  if (!authLoading && authUser?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  useEffect(() => {
    if (!authLoading && authUser) {
      dispatch(fetchProfileThunk());
    }
  }, [authLoading, authUser, dispatch]);

  if (authLoading || profileLoading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin w-10 h-10 rounded-full border-4 border-brand-medium border-t-brand" />
      </div>
    );
  }

  if (error) {
    return <p className="text-center py-12 text-red-500 text-base">{error}</p>;
  }

  if (!profile) {
    return <p className="text-center py-12 text-gray-500 text-base">Profile not found</p>;
  }

  const fields = [
    { label: "Email", value: profile.email },
    profile.age && { label: "Age", value: `${profile.age} years` },
    profile.contact && { label: "Contact", value: profile.contact },
    profile.address && { label: "Address", value: profile.address },
  ].filter(Boolean);

  const initials = profile.name
    ? profile.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <div className="w-full px-4 py-6 md:py-8">
      <div className="w-full max-w-[480px] mx-auto md:max-w-[1100px]">
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-card flex flex-col md:flex-row md:min-h-[600px]">

          {/* LEFT PANEL — hidden on mobile */}
          <div
            className="hidden md:flex flex-[1.1] p-12 flex-col justify-center bg-gradient-to-br from-brand-dark via-[#2d2a6e] to-brand-dark text-white"
            {...fadeIn({ direction: "left", distance: 80, duration: 0.9 })}
          >
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center mb-8">
              <span className="text-3xl font-extrabold text-white tracking-tight">{initials}</span>
            </div>

            <span className="inline-flex items-center px-4 py-2 bg-white/15 border border-white/20 rounded-full text-[0.68rem] font-bold tracking-[0.15em] uppercase mb-5 w-fit">
              Account
            </span>
            <h1 className="text-[2.4rem] font-extrabold leading-[1.1] mb-4 tracking-tight">
              My Profile
            </h1>
            <p className="text-[1rem] leading-relaxed text-white/70 max-w-[320px]">
              Manage your personal information, change your password, and keep your account up to date.
            </p>
          </div>

          {/* RIGHT PANEL */}
          <div
            className="flex-1 p-6 sm:p-8 md:p-10 bg-white flex items-start md:border-l md:border-gray-100"
            {...fadeIn({ direction: "up", distance: 80, duration: 0.9 })}
          >
            <div className="w-full flex flex-col gap-5">
              {/* Mobile header */}
              <div className="md:hidden flex items-center gap-4 mb-1">
                <div className="w-14 h-14 rounded-2xl bg-brand-light flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-extrabold text-brand">{initials}</span>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900">{profile.name}</h2>
                  <p className="text-[0.8rem] text-gray-400">Your personal information</p>
                </div>
              </div>

              {/* Name (desktop only label) */}
              <div className="hidden md:block">
                <p className="text-[0.75rem] font-bold text-gray-400 uppercase tracking-wider mb-1">Full Name</p>
                <p className="text-xl font-extrabold text-gray-900">{profile.name}</p>
              </div>

              <div className="h-px bg-gray-100 md:block hidden" />

              {/* FIELDS */}
              <div className="flex flex-col gap-3">
                {fields.map(({ label, value }) => {
                  const Icon = FIELD_ICONS[label] || User;
                  return (
                    <div key={label} className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="w-8 h-8 rounded-lg bg-brand-light flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon size={14} className="text-brand" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[0.72rem] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
                        <p className="text-[0.9rem] text-gray-800 font-medium break-words">{value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ACTIONS */}
              <div className="flex flex-col gap-2.5 pt-1">
                <button
                  className="flex items-center justify-center gap-2 bg-brand text-white py-3.5 px-4 border-0 rounded-xl text-[0.92rem] font-semibold cursor-pointer transition-all hover:bg-brand-dark hover:-translate-y-px shadow-[0_4px_14px_rgba(79,70,229,0.2)]"
                  onClick={() => navigate("/profile/edit")}
                >
                  <Pencil size={16} />
                  Edit Profile
                </button>
                <button
                  className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3.5 px-4 border-0 rounded-xl text-[0.92rem] font-semibold cursor-pointer transition-all hover:bg-gray-200"
                  onClick={() => navigate("/profile/password")}
                >
                  <Lock size={16} />
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
