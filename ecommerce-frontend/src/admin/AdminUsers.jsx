import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { notify } from "../utils/notify";
import { Users as UsersIcon, Shield, User as UserIcon } from "lucide-react";
import {
  fetchAllUsersThunk,
  updateUserRoleThunk,
} from "../redux/slice/userSlice";
import PageHeader from "./components/PageHeader";
import AdminLoader from "./components/AdminLoader";
import EmptyState from "./components/EmptyState";
import ConfirmDialog from "./components/ConfirmDialog";

const ROLE_FILTERS = [
  { value: "all", label: "All Users", icon: UsersIcon },
  { value: "user", label: "Customers", icon: UserIcon },
  { value: "admin", label: "Admins", icon: Shield },
];

export default function AdminUsers() {
  const dispatch = useDispatch();
  const { users, loading } = useSelector((state) => state.user);
  const { user: currentUser } = useSelector((state) => state.auth);

  const [roleFilter, setRoleFilter] = useState("all");
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    dispatch(fetchAllUsersThunk());
  }, [dispatch]);

  const filteredUsers = useMemo(() => {
    if (roleFilter === "all") return users;
    return users.filter((u) => u.role === roleFilter);
  }, [users, roleFilter]);

  const counts = useMemo(() => ({
    all: users.length,
    user: users.filter((u) => u.role === "user").length,
    admin: users.filter((u) => u.role === "admin").length,
  }), [users]);

  const handleConfirmRole = async () => {
    if (!confirmTarget) return;
    setUpdatingId(confirmTarget._id);
    try {
      await dispatch(updateUserRoleThunk({ id: confirmTarget._id, role: confirmTarget.newRole })).unwrap();
      notify.success(`${confirmTarget.name} is now ${confirmTarget.newRole === "admin" ? "an Admin" : "a User"}`);
      setConfirmTarget(null);
    } catch (err) {
      notify.error(err || "Failed to update role");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="User Management"
        subtitle={`${users.length} registered users`}
      />

      {/* ROLE TABS */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {ROLE_FILTERS.map(({ value, label, icon: Icon }) => {
          const isActive = roleFilter === value;
          return (
            <button
              key={value}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border cursor-pointer whitespace-nowrap transition-all ${
                isActive
                  ? "bg-brand text-white border-brand shadow-md"
                  : "bg-white text-gray-600 border-gray-200 hover:border-brand/30 hover:text-brand"
              }`}
              onClick={() => setRoleFilter(value)}
            >
              <Icon size={14} />
              {label}
              <span className={`text-[0.65rem] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
                isActive ? "bg-white/25 text-white" : "bg-gray-100 text-gray-600"
              }`}>
                {counts[value]}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <AdminLoader />
      ) : filteredUsers.length === 0 ? (
        <EmptyState icon={UsersIcon} title="No users found" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-card bg-white">
          <table className="w-full text-[0.875rem]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-600">User</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 hidden md:table-cell">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 hidden lg:table-cell">Contact</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Role</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 w-44">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => {
                const isSelf = currentUser?._id === user._id;
                const isUpdating = updatingId === user._id;
                const initials = user.name?.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() || "?";

                return (
                  <tr key={user._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-light flex items-center justify-center text-brand font-bold text-[0.78rem] flex-shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                          <p className="text-[0.78rem] text-gray-400 md:hidden truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 hidden md:table-cell">{user.email}</td>
                    <td className="py-3 px-4 text-gray-500 hidden lg:table-cell">{user.contact || "—"}</td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 text-[0.72rem] font-bold px-2.5 py-1 rounded-full ${
                        user.role === "admin"
                          ? "bg-brand-light text-brand border border-brand/20"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {user.role === "admin" ? <Shield size={10} /> : <UserIcon size={10} />}
                        {user.role}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {isSelf ? (
                        <span className="px-3 py-1.5 text-[0.78rem] font-semibold text-gray-400 bg-gray-100 rounded-lg">
                          You
                        </span>
                      ) : user.role === "user" ? (
                        <button
                          className="px-3 py-1.5 text-[0.78rem] font-semibold bg-brand-light text-brand border-0 rounded-lg cursor-pointer transition-all hover:bg-brand hover:text-white disabled:opacity-60"
                          disabled={isUpdating}
                          onClick={() => setConfirmTarget({ _id: user._id, name: user.name, newRole: "admin" })}
                        >
                          {isUpdating ? "Updating..." : "Promote to Admin"}
                        </button>
                      ) : (
                        <button
                          className="px-3 py-1.5 text-[0.78rem] font-semibold bg-red-50 text-red-500 border border-red-200 rounded-lg cursor-pointer transition-all hover:bg-red-500 hover:text-white hover:border-red-500 disabled:opacity-60"
                          disabled={isUpdating}
                          onClick={() => setConfirmTarget({ _id: user._id, name: user.name, newRole: "user" })}
                        >
                          {isUpdating ? "Updating..." : "Demote to User"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmTarget}
        title={confirmTarget?.newRole === "admin" ? "Promote to Admin?" : "Demote to User?"}
        message={confirmTarget ? `Are you sure you want to change ${confirmTarget.name}'s role to ${confirmTarget.newRole}? They'll have ${confirmTarget.newRole === "admin" ? "full administrative access" : "regular customer access only"}.` : ""}
        confirmLabel={confirmTarget?.newRole === "admin" ? "Promote" : "Demote"}
        variant={confirmTarget?.newRole === "admin" ? "primary" : "danger"}
        loading={!!updatingId}
        onConfirm={handleConfirmRole}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
}
