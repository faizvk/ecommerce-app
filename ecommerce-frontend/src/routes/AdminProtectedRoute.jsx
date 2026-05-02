import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import RouteLoader from "../components/RouteLoader";

export default function AdminProtectedRoute() {
  const { user, loading } = useSelector((state) => state.auth);

  if (loading) return <RouteLoader />;

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;

  return <Outlet />;
}
