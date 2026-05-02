import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { fetchProfileThunk } from "../redux/slice/userSlice";
import { fetchOrdersThunk } from "../redux/slice/orderSlice";
import { fadeIn } from "../animations/fadeIn";
import { useWishlist } from "../hooks/useWishlist";
import {
  Mail, Phone, MapPin, Calendar, Pencil, Lock, User as UserIcon,
  ShoppingBag, Sparkles, ClipboardList, Heart, ChevronRight,
} from "lucide-react";

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
  const { orders = [] } = useSelector((state) => state.order);
  const { count: wishlistCount } = useWishlist();

  if (!authLoading && authUser?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  useEffect(() => {
    if (!authLoading && authUser) {
      dispatch(fetchProfileThunk());
      dispatch(fetchOrdersThunk());
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

  const memberSince = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : "—";

  const orderCount = orders.length;
  const activeCount = orders.filter((o) => o.status === "pending" || o.status === "processing" || o.status === "shipped").length;

  return (
    <div className="w-full px-4 py-6 md:py-10">
      <div
        className="w-full max-w-[1100px] mx-auto grid md:grid-cols-[380px_1fr] bg-white rounded-3xl shadow-[0_24px_60px_rgba(79,70,229,0.12)] overflow-hidden border border-gray-100"
        {...fadeIn({ direction: "up", distance: 30, duration: 0.5 })}
      >
        {/* LEFT — User card */}
        <aside className="relative overflow-hidden bg-gradient-to-br from-brand-dark via-brand to-[#7c3aed] text-white p-7 md:p-9 flex flex-col gap-6">
          <div className="absolute -top-16 -right-12 w-56 h-56 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />

          {/* Brand */}
          <div className="relative flex items-center gap-2">
            <div className="w-8 h-8 bg-white/15 border border-white/25 rounded-xl flex items-center justify-center">
              <ShoppingBag size={15} />
            </div>
            <span className="text-sm font-extrabold tracking-tight">
              <span className="text-white">Nex</span><span className="text-brand-medium">Kart</span>
            </span>
            <span className="ml-auto text-[0.62rem] font-bold uppercase tracking-[0.18em] text-white/60">My Account</span>
          </div>

          {/* Avatar + name */}
          <div className="relative">
            <div className="w-20 h-20 md:w-[88px] md:h-[88px] rounded-2xl bg-white/15 border border-white/25 backdrop-blur-sm flex items-center justify-center mb-4 shadow-md">
              <span className="text-3xl md:text-[2.1rem] font-extrabold tracking-tight">{initials}</span>
            </div>

            <h1 className="text-xl md:text-[1.6rem] font-extrabold leading-tight tracking-tight">{profile.name}</h1>
            <p className="text-white/70 text-[0.85rem] mt-0.5 truncate">{profile.email}</p>

            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 border border-white/25 rounded-full text-[0.68rem] font-bold uppercase tracking-[0.14em]">
              <Sparkles size={11} />
              Member since {memberSince}
            </div>
          </div>

          {/* Stats */}
          <div className="relative grid grid-cols-3 gap-2">
            <div className="bg-white/10 border border-white/15 rounded-xl p-3 backdrop-blur-sm">
              <p className="text-xl font-extrabold leading-none">{orderCount}</p>
              <p className="text-[0.62rem] text-white/70 uppercase tracking-wider mt-1 font-bold">Orders</p>
            </div>
            <div className="bg-white/10 border border-white/15 rounded-xl p-3 backdrop-blur-sm">
              <p className="text-xl font-extrabold leading-none">{activeCount}</p>
              <p className="text-[0.62rem] text-white/70 uppercase tracking-wider mt-1 font-bold">Active</p>
            </div>
            <div className="bg-white/10 border border-white/15 rounded-xl p-3 backdrop-blur-sm">
              <p className="text-xl font-extrabold leading-none">{wishlistCount}</p>
              <p className="text-[0.62rem] text-white/70 uppercase tracking-wider mt-1 font-bold">Saved</p>
            </div>
          </div>

          {/* Quick links */}
          <div className="relative mt-auto flex flex-col gap-1.5">
            <Link
              to="/orders"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl no-underline text-white bg-white/5 hover:bg-white/15 transition-colors border border-white/10"
            >
              <ClipboardList size={15} className="text-white/80" />
              <span className="text-[0.85rem] font-semibold">My Orders</span>
              <ChevronRight size={14} className="ml-auto text-white/50" />
            </Link>
            <Link
              to="/wishlist"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl no-underline text-white bg-white/5 hover:bg-white/15 transition-colors border border-white/10"
            >
              <Heart size={15} className="text-white/80" />
              <span className="text-[0.85rem] font-semibold">Wishlist</span>
              <ChevronRight size={14} className="ml-auto text-white/50" />
            </Link>
          </div>
        </aside>

        {/* RIGHT — Information */}
        <div className="p-6 sm:p-8 md:p-10 flex flex-col gap-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-xl md:text-[1.6rem] font-extrabold text-gray-900 leading-tight">
                Personal Information
              </h2>
              <p className="text-[0.85rem] text-gray-400 mt-0.5">Your account details and preferences</p>
            </div>
            <button
              onClick={() => navigate("/profile/edit")}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-light text-brand border border-brand/25 rounded-xl text-[0.82rem] font-bold cursor-pointer hover:bg-brand hover:text-white transition-all"
            >
              <Pencil size={13} />
              Edit
            </button>
          </div>

          {/* Name field */}
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 border border-gray-100">
              <UserIcon size={16} className="text-brand" />
            </div>
            <div className="min-w-0">
              <p className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Full Name</p>
              <p className="text-[0.95rem] text-gray-900 font-semibold break-words">{profile.name}</p>
            </div>
          </div>

          {/* Other fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fields.map(({ label, value }) => {
              const Icon = FIELD_ICONS[label] || UserIcon;
              return (
                <div key={label} className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 border border-gray-100">
                    <Icon size={16} className="text-brand" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
                    <p className="text-[0.92rem] text-gray-900 font-semibold break-words">{value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Security section */}
          <div className="border-t border-gray-100 pt-5">
            <h3 className="text-[0.78rem] font-bold uppercase tracking-[0.14em] text-gray-400 mb-3">Security</h3>
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 border border-gray-100">
                <Lock size={16} className="text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[0.92rem] font-bold text-gray-900">Password</p>
                <p className="text-[0.78rem] text-gray-500">Last updated: change anytime</p>
              </div>
              <button
                onClick={() => navigate("/profile/password")}
                className="px-3.5 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl text-[0.78rem] font-bold cursor-pointer hover:border-brand hover:text-brand transition-all whitespace-nowrap"
              >
                Change
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
