import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function AdminProtectedRoute({ children }) {
  const { user, loading } = useSelector((state) => state.auth);

  /* =========================
     WAIT FOR AUTH RESOLUTION
  ========================= */
  if (loading) {
    return <p>Loading...</p>;
  }

  /* =========================
     AUTH GUARDS
  ========================= */
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
