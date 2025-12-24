import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllUsersThunk,
  updateUserRoleThunk,
} from "../redux/slice/userSlice";
import "./styles/AdminUsers.css";

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
    const confirmed = window.confirm(
      `Are you sure you want to change ${name}'s role to ${newRole}?`
    );

    if (!confirmed) return;

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
    <div className="admin-users-page">
      <div className="admin-users-header">
        <h1>User Management</h1>

        <div className="filter-box">
          <label htmlFor="roleFilter">Role:</label>
          <select
            id="roleFilter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="user">Customers</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading users...</div>
      ) : (
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Contact</th>
              <th>Role</th>
              <th width="200">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((user) => {
              const isSelf = currentAdmin?._id === user._id;
              const isUpdating = updatingId === user._id;

              return (
                <tr key={user._id}>
                  <td className="user-name">
                    <strong>{user.name}</strong>
                  </td>

                  <td>{user.email}</td>
                  <td>{user.contact || "—"}</td>

                  <td>
                    <span
                      className={`role-badge ${
                        user.role === "admin" ? "admin" : "user"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td>
                    {isSelf ? (
                      <button className="disabled-btn" disabled>
                        You
                      </button>
                    ) : user.role === "user" ? (
                      <button
                        className="promote-btn"
                        disabled={isUpdating}
                        onClick={() => updateRole(user._id, "admin", user.name)}
                      >
                        {isUpdating ? "Updating..." : "Promote to Admin"}
                      </button>
                    ) : (
                      <button
                        className="demote-btn"
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
      )}
    </div>
  );
}
