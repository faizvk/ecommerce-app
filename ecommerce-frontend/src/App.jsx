import "./globalStyles/App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy, useEffect, useState } from "react";
import { useFadeInScroll } from "./animations/useFadeInScroll";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminProtectedRoute from "./routes/AdminProtectedRoute";
import GuestRoute from "./routes/GuestRoute";
import ServerLoadingScreen from "./components/ServerLoadingScreen";

import { useDispatch } from "react-redux";
import { restoreSession } from "./redux/slice/authSlice";

const Home = lazy(() => import("./pages/Home"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const SearchResults = lazy(() => import("./pages/SearchResults"));

const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderTrack = lazy(() => import("./pages/OrderTrack"));
const Orders = lazy(() => import("./pages/Orders"));
const Profile = lazy(() => import("./pages/Profile"));
const EditProfile = lazy(() => import("./pages/EditProfile"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));
const OrderDetails = lazy(() => import("./pages/OrderDetails"));

const AdminDashboard = lazy(() => import("./admin/AdminDashboard"));
const AdminHome = lazy(() => import("./admin/AdminHome"));
const AdminProducts = lazy(() => import("./admin/AdminProducts"));
const AdminAddProduct = lazy(() => import("./admin/AdminAddProduct"));
const AdminEditProduct = lazy(() => import("./admin/AdminEditProduct"));
const AdminOrders = lazy(() => import("./admin/AdminOrders"));
const AdminUsers = lazy(() => import("./admin/AdminUsers"));

export default function App() {
  useFadeInScroll();
  const dispatch = useDispatch();

  const [backendReady, setBackendReady] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  useEffect(() => {
    let mounted = true;
    let attempts = 0;

    // Strip trailing slash AND any trailing /api suffix so the health check
    // works regardless of whether VITE_BASE_URL includes /api or not.
    const base = (import.meta.env.VITE_BASE_URL || "")
      .replace(/\/$/, "")
      .replace(/\/api$/, "");

    // Tick the elapsed counter every second for the loading screen
    const ticker = setInterval(() => {
      if (mounted) setElapsed((s) => s + 1);
    }, 1000);

    const checkBackend = async () => {
      if (!mounted) return;
      attempts++;

      try {
        const res = await fetch(`${base}/api/health`);
        if (res.ok && mounted) {
          clearInterval(ticker);
          setBackendReady(true);
          return;
        }
      } catch {
        // network error or CORS — keep retrying
      }

      // Give up after ~90 s and show the app anyway
      // (individual pages have their own error states)
      if (attempts >= 30 && mounted) {
        clearInterval(ticker);
        setBackendReady(true);
        return;
      }

      setTimeout(checkBackend, 3000);
    };

    checkBackend();

    return () => {
      mounted = false;
      clearInterval(ticker);
    };
  }, []);

  if (!backendReady) return <ServerLoadingScreen elapsed={elapsed} />;

  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content">
        <Suspense fallback={<ServerLoadingScreen />}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/search" element={<SearchResults />} />

            {/* Guest Only */}
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
            </Route>

            {/* Auth */}
            <Route element={<ProtectedRoute />}>
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/track/:id" element={<OrderTrack />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:id" element={<OrderDetails />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/edit" element={<EditProfile />} />
              <Route path="/profile/password" element={<ChangePassword />} />
            </Route>

            {/* Admin */}
            <Route element={<AdminProtectedRoute />}>
              <Route path="/admin" element={<AdminDashboard />}>
                <Route index element={<AdminHome />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="products/add" element={<AdminAddProduct />} />
                <Route
                  path="products/edit/:id"
                  element={<AdminEditProduct />}
                />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="users" element={<AdminUsers />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      <ToastContainer position="top-center" />
      <Footer />
    </div>
  );
}
