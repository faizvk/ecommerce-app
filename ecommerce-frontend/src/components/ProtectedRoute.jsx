import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useSelector((state) => state.auth);

  /* =========================
     WAIT FOR AUTH RESOLUTION
  ========================= */
  if (loading) {
    return <p className="loading">Loading...</p>;
  }

  /* =========================
     AUTH GUARD
  ========================= */
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
