import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllUsersThunk,
  updateUserRoleThunk,
} from "../redux/slice/userSlice";

export default function AdminUsers() {
  const dispatch = useDispatch();
  const { users, loading } = useSelector((state) => state.user);

  const [roleFilter, setRoleFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);

  const currentAdmin = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    dispatch(fetchAllUsersThunk());
  }, [dispatch]);

  const updateRole = async (id, newRole, name) => {
    if (!window.confirm(`Are you sure you want to change ${name}'s role to ${newRole}?`)) return;
    setUpdatingId(id);
    try {
      await dispatch(updateUserRoleThunk({ id, role: newRole })).unwrap();
      await dispatch(fetchAllUsersThunk());
    } catch (err) {
      alert(err || "Failed to update role");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = useMemo(() => {
    if (roleFilter === "all") return users;
    return users.filter((u) => u.role === roleFilter);
  }, [users, roleFilter]);

  return (
    <div className="flex flex-col gap-6">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-extrabold text-brand-dark">User Management</h1>

        <div className="flex items-center gap-2">
          <label htmlFor="roleFilter" className="text-[0.85rem] font-semibold text-gray-600">Role:</label>
          <select
            id="roleFilter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 outline-none transition-all focus:border-brand focus:shadow-[0_0_0_2px_rgba(56,89,139,0.12)]"
          >
            <option value="all">All</option>
            <option value="user">Customers</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-center py-12 text-brand text-xl">Loading users...</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-black/[0.06] shadow-card bg-white">
          <table className="w-full text-[0.875rem]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Contact</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Role</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 w-44">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => {
                const isSelf = currentAdmin?._id === user._id;
                const isUpdating = updatingId === user._id;

                return (
                  <tr key={user._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-gray-900">{user.name}</td>
                    <td className="py-3 px-4 text-gray-600">{user.email}</td>
                    <td className="py-3 px-4 text-gray-500">{user.contact || "—"}</td>

                    <td className="py-3 px-4">
                      <span className={`text-[0.75rem] font-bold px-2.5 py-1 rounded-full ${
                        user.role === "admin"
                          ? "bg-brand-light text-brand border border-brand/20"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {user.role}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {isSelf ? (
                        <button className="px-3 py-1.5 text-[0.8rem] font-semibold text-gray-400 bg-gray-100 rounded-lg border-0 cursor-not-allowed" disabled>
                          You
                        </button>
                      ) : user.role === "user" ? (
                        <button
                          className="px-3 py-1.5 text-[0.8rem] font-semibold bg-brand-light text-brand border-0 rounded-lg cursor-pointer transition-all hover:bg-brand hover:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                          disabled={isUpdating}
                          onClick={() => updateRole(user._id, "admin", user.name)}
                        >
                          {isUpdating ? "Updating..." : "Promote to Admin"}
                        </button>
                      ) : (
                        <button
                          className="px-3 py-1.5 text-[0.8rem] font-semibold bg-red-50 text-red-500 border border-red-200 rounded-lg cursor-pointer transition-all hover:bg-red-500 hover:text-white hover:border-red-500 disabled:opacity-60 disabled:cursor-not-allowed"
                          disabled={isUpdating}
                          onClick={() => updateRole(user._id, "user", user.name)}
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
    </div>
  );
}
