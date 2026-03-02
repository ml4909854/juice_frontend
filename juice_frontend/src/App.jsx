// src/App.jsx
import React, { useState, useEffect, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

// Components that are needed immediately (keep these)
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { PageLoader } from "./components/Loader";
import PrivateRoute from "./utils/PrivateRoute";
import AdminRoute from "./admin/AdminRoute";

// 🚀 LAZY LOAD ALL PAGES - They load only when needed
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Juices = lazy(() => import("./pages/Juices"));
const JuiceDetails = lazy(() => import("./pages/JuiceDetails"));
const Cart = lazy(() => import("./pages/Cart"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Orders = lazy(() => import("./pages/Orders"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Profile = lazy(() => import("./pages/Profile"));

// 🚀 LAZY LOAD ADMIN PAGES
const AdminLayout = lazy(() => import("./admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./admin/AdminUsers"));
const AdminJuices = lazy(() => import("./admin/AdminJuices"));
const AdminOrders = lazy(() => import("./admin/AdminOrders"));
const AdminReviews = lazy(() => import("./admin/AdminReviews"));
const Settings = lazy(() => import("./admin/Settings"));
const HelpAndSupport = lazy(() => import("./admin/HelpAndSupport"));
const AdminProfile = lazy(() => import("./admin/AdminProfile"));

const Layout = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [location]);

  return (
    <>
      {loading && <PageLoader />}
      <div className="flex flex-col min-h-screen">
        {!isAdminRoute && <Navbar />}
        <main className={`flex-grow ${!isAdminRoute ? "pt-20" : ""}`}>
          {/* 🚀 SUSPENSE shows loader while lazy components load */}
          <Suspense fallback={<PageLoader text="Loading page..." />}>
            {children}
          </Suspense>
        </main>
        {!isAdminRoute && <Footer />}
      </div>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* ===== PUBLIC ROUTES ===== */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/juices" element={<Juices />} />
          <Route path="/juices/:id" element={<JuiceDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* ===== USER PROTECTED ROUTES ===== */}
          <Route element={<PrivateRoute />}>
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* ===== ADMIN ROUTES ===== */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="juices" element={<AdminJuices />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="profile" element={<AdminProfile />} />
              <Route path="settings" element={<Settings />} />
              <Route path="help" element={<HelpAndSupport />} />
            </Route>
          </Route>

          {/* ===== 404 NOT FOUND ===== */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center px-4">
                  <h1 className="text-6xl font-black text-gray-800 mb-4">404</h1>
                  <p className="text-xl text-gray-600 mb-8">Page not found</p>
                  <a
                    href="/"
                    className="inline-block bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                  >
                    Go Home
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;