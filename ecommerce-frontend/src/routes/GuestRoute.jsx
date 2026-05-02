import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import RouteLoader from "../components/RouteLoader";

export default function GuestRoute() {
  const { user, loading } = useSelector((state) => state.auth);

  if (loading) return <RouteLoader />;

  if (user) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/"} replace />;
  }

  return <Outlet />;
}
