import { Route, Routes, Navigate } from "react-router-dom";
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
import UserProfile from "./pages/UserProfile";
import ScrollToTop from "./components/ScrollToTop";

// 🔐 Wrapper for Google login
const GoogleAuthWrapper = () => {
  return (
    <GoogleOAuthProvider clientId="809832986226-q5uuk1ai9u0onglu7jm43s8akhkt3761.apps.googleusercontent.com">
      <LoginPage />
    </GoogleOAuthProvider>
  );
};

function App() {
  const { user, checkAuth, checkingAuth } = useUserStore();
  const { getCartItems } = useCartStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user) getCartItems();
  }, [user, getCartItems]);

  if (checkingAuth) return <LoadingSpinner />;

  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen bg-[#fcf7f8] text-[#A31621] relative overflow-hidden">
        <div className="relative z-50">
          <NavBar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/signup"
              element={!user ? <SignUpPage /> : <Navigate to="/" />}
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
            <Route path="/product/:productId" element={<ProductDetail />} />
            <Route
              path="/cart"
              element={user ? <CartPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/purchase-success"
              element={user ? <PurchaseSuccessPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/purchase-cancel"
              element={user ? <PurchaseCancelPage /> : <Navigate to="/login" />}
            />
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
