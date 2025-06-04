import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import NavBar from "./components/NavBar";
import { Toaster } from "react-hot-toast";
import { useUserStore } from "./stores/useUserStore";
import { useCartStore } from "./stores/useCartStore";
import LoadingSpinner from "./components/LoadingSpinner";
import AdminPage from "./pages/AdminPage";
import CategoryPage from "./pages/CategoryPage";
import CartPage from "./pages/CartPage";
import PurchaseSuccessPage from "./pages/PurchaseSuccessPage";
import PurchaseCancelPage from "./pages/PurchaseCancelPage";
import ErrorPage from "./pages/ErrorPage";
import ProductDetail from "./pages/ProductDetail";
import AllOrder from "./pages/AllOrder";
import AddressForm from "./pages/AddressForm";
import PlanCard from "./components/PlanCard";
import UserProfile from "./pages/UserProfile";
import ScrollToTop from "./components/ScrollToTop";
import ForgotPassword from "./pages/ForgotPassword";
import usePageTitle from "./hooks/usePageTitle";
import CreateDiscountForm from "./pages/CreateDiscountForm";
import PaymentErrorPage from "./pages/PaymentErrorPage";
const GoogleAuthWrapper = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <GoogleOAuthProvider clientId="809832986226-q5uuk1ai9u0onglu7jm43s8akhkt3761.apps.googleusercontent.com">
      {path === "/login" && <LoginPage />}
      {path === "/signup" && <SignUpPage userType="user" />}
      {path === "/admin" && <SignUpPage userType="admin" />}
    </GoogleOAuthProvider>
  );
};

function App() {
  const { user, checkAuth, checkingAuth } = useUserStore();
  const { getCartItems } = useCartStore();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user) getCartItems();
  }, [user, getCartItems]);
  usePageTitle()
  if (checkingAuth) return <LoadingSpinner />;

  // Paths where NavBar should be hidden
  const hideNavBarRoutes = ["/forgot-password"];

  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen bg-[#fcf7f8] text-[#A31621] relative overflow-hidden">
        <div className="relative z-50">
          {!hideNavBarRoutes.includes(location.pathname) && <NavBar />}

          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/signup"
              element={!user ? <GoogleAuthWrapper /> : <Navigate to="/" />}
            />

            <Route
              path="/admin"
              element={!user ? <GoogleAuthWrapper /> : <Navigate to="/" />}
            />
            <Route
              path="/login"
              element={!user ? <GoogleAuthWrapper /> : <Navigate to="/" />}
            />
            <Route
              path="/secret-dashboard"
              element={
                user?.role === "admin" ? (
                  <AdminPage />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route path="/category/:category" element={<CategoryPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/product/:productId" element={<ProductDetail />} />
            <Route
              path="/cart"
              element={user ? <CartPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/premium"
              element={user ? <PlanCard /> : <Navigate to="/login" />}

            />
            <Route
              path="/purchase-success"
              element={user ? <PurchaseSuccessPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/purchase-cancel"
              element={user ? <PurchaseCancelPage /> : <Navigate to="/login" />}
            />
            <Route path="/payment-error" element={<PaymentErrorPage />} />

            <Route path="/error" element={<ErrorPage />} />
            <Route
              path="/order-list"
              element={user ? <AllOrder /> : <Navigate to="/login" />}
            />
            <Route
              path="/address"
              element={user ? <AddressForm /> : <Navigate to="/login" />}
            />
            <Route
              path="/my-profile"
              element={user ? <UserProfile /> : <Navigate to="/login" />}
            />
            <Route
              path="/test"
              element={< CreateDiscountForm />}
            />
            <Route
              path="*"
              element={
                <Navigate to="/error" state={{ error: "404 - Page Not Found" }} />
              }
            />
          </Routes>
        </div>
        <Toaster />
      </div>
    </>
  );
}

export default App;
