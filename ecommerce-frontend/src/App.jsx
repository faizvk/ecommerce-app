import "./globalStyles/App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { useFadeInScroll } from "./animations/UseFadeInScroll";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import GuestRoute from "./components/GuestRoute";

import { useDispatch } from "react-redux";
import { restoreSession } from "./redux/slice/authSlice";

const Home = lazy(() => import("./pages/Home"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const SearchResults = lazy(() => import("./pages/SearchResults"));

const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));

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

function LoadingScreen() {
  return <p className="loading">Loading...</p>;
}

export default function App() {
  useFadeInScroll();
  const dispatch = useDispatch();

  useEffect(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("accessToken");

    if (user && token) {
      dispatch(restoreSession());
    }
  }, [dispatch]);

  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content">
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/search" element={<SearchResults />} />

            <Route
              path="/login"
              element={
                <GuestRoute>
                  <Login />
                </GuestRoute>
              }
            />

            <Route
              path="/signup"
              element={
                <GuestRoute>
                  <Signup />
                </GuestRoute>
              }
            />

            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              }
            />

            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />

            <Route
              path="/track/:id"
              element={
                <ProtectedRoute>
                  <OrderTrack />
                </ProtectedRoute>
              }
            />

            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />

            <Route
              path="/orders/:id"
              element={
                <ProtectedRoute>
                  <OrderDetails />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile/edit"
              element={
                <ProtectedRoute>
                  <EditProfile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile/password"
              element={
                <ProtectedRoute>
                  <ChangePassword />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              }
            >
              <Route index element={<AdminHome />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/add" element={<AdminAddProduct />} />
              <Route path="products/edit/:id" element={<AdminEditProduct />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="users" element={<AdminUsers />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
