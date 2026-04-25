import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { fetchProfileThunk } from "../redux/slice/userSlice";
import { fadeIn } from "../animations/fadeIn";

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
    profile.age && { label: "Age", value: profile.age },
    profile.contact && { label: "Contact", value: profile.contact },
    profile.address && { label: "Address", value: profile.address },
  ].filter(Boolean);

  return (
    <div className="w-full px-4 py-6 md:py-8">
      <div className="w-full max-w-[480px] mx-auto md:max-w-[1100px]">
        <div className="bg-white border border-black/[0.08] rounded-xl overflow-hidden shadow-card flex flex-col md:flex-row md:min-h-[600px]">

          {/* LEFT PANEL — hidden on mobile */}
          <div
            className="hidden md:flex flex-[1.1] p-12 flex-col justify-center bg-brand-dark text-white"
            {...fadeIn({ direction: "left", distance: 80, duration: 0.9 })}
          >
            <span className="inline-flex items-center px-4 py-2 bg-white/15 border border-white/30 rounded-full text-[0.7rem] font-bold tracking-[0.15em] uppercase mb-6">
              Account
            </span>
            <h1 className="text-[2.8rem] font-extrabold leading-[1.1] mb-5 tracking-tight">
              My Profile
            </h1>
            <p className="text-[1.05rem] leading-relaxed text-white/85 max-w-[420px]">
              View and manage your personal information.
            </p>
          </div>

          {/* RIGHT PANEL */}
          <div
            className="flex-1 p-6 sm:p-8 md:p-12 bg-white flex items-center md:border-l md:border-black/[0.06]"
            {...fadeIn({ direction: "up", distance: 80, duration: 0.9 })}
          >
            <div className="w-full flex flex-col gap-4">
              <div className="text-center mb-2 md:hidden">
                <h2 className="text-2xl font-bold mb-1">My Profile</h2>
                <p className="text-black/60 text-sm">Your personal information</p>
              </div>

              {fields.map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-1.5">
                  <label className="text-[0.85rem] font-semibold text-gray-900">{label}</label>
                  <p className="w-full py-3.5 px-4 rounded-xl border border-black/15 bg-[#f9f9fb] text-[0.95rem] text-gray-700">
                    {value}
                  </p>
                </div>
              ))}

              <div className="flex flex-col gap-3 mt-3">
                <button
                  className="bg-brand text-white py-4 px-4 border-0 rounded-xl text-[0.95rem] font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all hover:bg-brand-dark hover:-translate-y-px"
                  onClick={() => navigate("/profile/edit")}
                >
                  Edit Profile
                </button>
                <button
                  className="bg-brand-dark text-white py-4 px-4 border-0 rounded-xl text-[0.95rem] font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:-translate-y-px"
                  onClick={() => navigate("/profile/password")}
                >
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
