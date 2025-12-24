import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function GuestRoute({ children }) {
  const { user, loading } = useSelector((state) => state.auth);

  /* =========================
     WAIT FOR AUTH RESOLUTION
  ========================= */
  if (loading) {
    return <p>Loading...</p>;
  }

  /* =========================
     BLOCK LOGGED-IN USERS
  ========================= */
  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}
