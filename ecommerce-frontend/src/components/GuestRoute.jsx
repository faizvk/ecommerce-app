import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function GuestRoute({ children }) {
  const { user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return <p className="loading">Loading...</p>;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}
