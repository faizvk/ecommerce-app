import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import RouteLoader from "../components/RouteLoader";

export default function ProtectedRoute() {
  const { user, loading } = useSelector((state) => state.auth);
  const location = useLocation();

  if (loading) return <RouteLoader />;

  if (!user) {
    // Preserve intended destination so we can return after login
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }

  return <Outlet />;
}
