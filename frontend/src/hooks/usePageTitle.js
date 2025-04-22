import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";

const usePageTitle = () => {
  const location = useLocation();
  const { user } = useUserStore();

  useEffect(() => {
    const path = location.pathname;
    let pageTitle = "Cookiesman";

    if (path === "/") {
      pageTitle = "Home";
    } else if (path.startsWith("/product/")) {
      pageTitle = "Product Details";
    } else if (path === "/signup") {
      pageTitle = user ? "Welcome Back" : "Sign Up";
    } else if (path === "/secret-signup") {
      pageTitle = "Admin Sign Up";
    } else if (path === "/login") {
      pageTitle = user ? "Redirecting" : "Log In";
    } else if (path === "/secret-dashboard") {
      pageTitle = "Admin Dashboard";
    } else if (path.startsWith("/category/")) {
      const category = decodeURIComponent(path.split("/").pop());
      pageTitle = `Category - ${category}`;
    } else if (path === "/forgot-password") {
      pageTitle = "Forgot Password";
    } else if (path === "/cart") {
      pageTitle = "Your Cart";
    } else if (path === "/purchase-success") {
      pageTitle = "Purchase Successful";
    } else if (path === "/purchase-cancel") {
      pageTitle = "Purchase Canceled";
    } else if (path === "/order-list") {
      pageTitle = "Your Orders";
    } else if (path === "/address") {
      pageTitle = "Shipping Address";
    } else if (path === "/my-profile") {
      pageTitle = "Your Profile";
    } else if (path === "/error") {
      pageTitle = "Error";
    }

    document.title = `${pageTitle} | Cookiesman`;
  }, [location, user]);
};

export default usePageTitle;
