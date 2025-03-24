import {
  ShoppingCart,
  UserPlus,
  LogIn,
  LogOut,
  Lock,
  Menu,
  X,
  ClipboardList,
  CookieIcon,
  User,
} from "lucide-react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useUserStore } from "../stores/useUserStore.js";
import { useCartStore } from "../stores/useCartStore.js";
import SearchBar from "./SearchBar.jsx";

const NavBar = () => {
  const { user, logout } = useUserStore();
  const isAdmin = user?.role === "admin";
  const { cart } = useCartStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeAll = () => setMenuOpen(false);

  return (
    <header className="fixed top-0 left-0 w-full bg-[#fcf7f8] text-[#A31621] bg-opacity-90 backdrop-blur-md shadow-lg z-40">
      <div className="lg:mx-0 mx-auto px-4 py-2 md:py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold text-[#A31621] flex items-center space-x-2 mr-3"
          >
            <CookieIcon className="mr-2" size={24} />
            COOKIES<span className="text-[#fff]"></span>MAN
          </Link>

          {/* Search Bar */}
          <SearchBar />

          {/* Hamburger Icon */}
          <div className="lg:hidden">
            {menuOpen ? (
              <X
                className="text-[#A31621] cursor-pointer"
                size={28}
                onClick={toggleMenu}
              />
            ) : (
              <Menu
                className="text-[#A31621] cursor-pointer"
                size={28}
                onClick={toggleMenu}
              />
            )}
          </div>

          {/* Navigation Links */}
          <nav
            className={`ml-6 lg:flex items-center md:gap-[20px] lg:gap-1 xl:gap-4 ${
              menuOpen
                ? "flex flex-col justify-center items-center w-4/5 max-w-sm bg-[#fcf7f8] rounded-lg shadow-lg p-6 absolute top-16 right-0"
                : "hidden"
            } lg:block lg:static lg:w-auto lg:bg-transparent`}
          >
            {[
              { to: "/", label: "Home" },
              { to: "/category/Cookies", label: "Cookies" },
              { to: "/category/Chocolates", label: "Chocolates" },
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={`block lg:inline-block py-2 px-2 rounded-md text-center font-semibold ${
                  location.pathname === to
                    ? "bg-[#A31621] text-white"
                    : "text-[#A31621] hover:bg-[#A31621] hover:text-white"
                }`}
                onClick={closeAll}
              >
                {label}
              </NavLink>
            ))}

            {user && (
              <>
                {/* Cart */}
                <NavLink
                  to="/cart"
                  className={`relative flex py-2 px-2 rounded-md text-center font-semibold ${
                    location.pathname === "/cart"
                      ? "bg-[#A31621] text-white"
                      : "text-[#A31621] hover:bg-[#A31621] hover:text-white"
                  }`}
                  onClick={closeAll}
                >
                  <ShoppingCart className="inline-block mr-1" size={20} />
                  <span>Cart</span>
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -left-2 bg-white text-[#A31621] rounded-full px-2 py-0.5 text-xs font-bold">
                      {cart.length}
                    </span>
                  )}
                </NavLink>

                {/* Profile Section */}
                <NavLink
                  to="/my-profile"
                  className={`flex items-center py-2 px-2 rounded-md text-sm md:text-base font-semibold ${
                    location.pathname === "/my-profile"
                      ? "bg-[#A31621] text-white"
                      : "text-[#A31621] hover:bg-[#A31621] hover:text-white"
                  }`}
                  onClick={closeAll}
                >
                  <User size={20} className="mr-2" />
                  <span>Profile</span>
                </NavLink>

                {/* Orders Section */}
                <NavLink
                  to="/order-list"
                  className={`flex items-center py-2 px-2 rounded-md text-sm md:text-base font-semibold ${
                    location.pathname === "/order-list"
                      ? "bg-[#A31621] text-white"
                      : "text-[#A31621] hover:bg-[#A31621] hover:text-white"
                  }`}
                  onClick={closeAll}
                >
                  <ClipboardList size={20} className="mr-2" />
                  <span>Orders</span>
                </NavLink>
              </>
            )}

            {/* Admin Dashboard */}
            {isAdmin && (
              <NavLink
                to="/secret-dashboard"
                className={`flex items-center py-2 px-2 rounded-md text-center font-semibold ${
                  location.pathname === "/secret-dashboard"
                    ? "bg-[#A31621] text-white"
                    : "text-[#A31621] hover:bg-[#A31621] hover:text-white"
                }`}
                onClick={closeAll}
              >
                <Lock size={18} className="inline-block mr-1" />
                <span>Dashboard</span>
              </NavLink>
            )}

            {/* Authentication Buttons */}
            {user ? (
              <button
                className="flex items-center py-2 px-2 rounded-md text-center font-semibold text-[#A31621] hover:text-white hover:bg-red-700"
                onClick={() => {
                  logout();
                  closeAll();
                }}
              >
                <LogOut size={18} className="mr-2" />
                <span>LogOut</span>
              </button>
            ) : (
              <>
                <NavLink
                  to="/signup"
                  className={`flex items-center py-2 px-2 rounded-md text-center font-semibold ${
                    location.pathname === "/signup"
                      ? "bg-[#A31621] text-white"
                      : "text-[#A31621] hover:bg-[#A31621] hover:text-white"
                  }`}
                  onClick={closeAll}
                >
                  <UserPlus size={18} className="mr-1" /> SignUp
                </NavLink>

                <NavLink
                  to="/login"
                  className={`flex items-center py-2 px-2 rounded-md text-center font-semibold ${
                    location.pathname === "/login"
                      ? "bg-[#A31621] text-white"
                      : "text-[#A31621] hover:bg-[#A31621] hover:text-white"
                  }`}
                  onClick={closeAll}
                >
                  <LogIn size={18} className="inline-block mr-1" /> Login
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
