import {
  ShoppingCart,
  UserPlus,
  LogIn,
  LogOut,
  Lock,
  Menu,
  UserIcon,
  X,
  Search,
  CookieIcon,
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
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const location = useLocation();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    setIsProfileOpen(false);
  };
  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
    if (!menuOpen) {
      setMenuOpen(false);
    }
  };

  const closeAll = () => {
    setMenuOpen(false);
    setIsProfileOpen(false);
  };
  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.split(" ");
    return (
      parts[0]?.charAt(0).toUpperCase() +
      (parts[1]?.charAt(0).toUpperCase() || "")
    );
  };
  return (
    <header className="fixed top-0 left-0 w-full bg-[#fcf7f8] text-[#A31621] bg-opacity-90 backdrop-blur-md shadow-lg z-40">
      <div className=" lg:mx-0 mx-auto px-4 py-2 md:py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold text-[#A31621] flex items-center space-x-2 mr-3"
          >
            <CookieIcon className="mr-2" size={24} />
            COOKIES<span className="text-[#fff]"></span>MAN
          </Link>
          {/* Search Bar Component */}

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
            className={`ml-6 lg:flex items-center  md:gap-[20px] lg:gap-2 xl:gap-6 ${
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
                  isProfileOpen
                    ? "text-[#A31621] hover:bg-[#A31621] hover:text-white"
                    : location.pathname === to
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
                <NavLink
                  to="/cart"
                  className={`relative flex  py-2 px-2 rounded-md text-center font-semibold ${
                    isProfileOpen
                      ? "text-[#A31621] hover:bg-[#A31621] hover:text-white"
                      : location.pathname === "/cart"
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

                {/* Profile Button */}
                <div className="relative">
                  <button
                    className={`flex items-center py-2 px-2 lg:px-2 rounded-md text-sm md:text-base font-semibold ${
                      isProfileOpen
                        ? "bg-[#A31621] text-white"
                        : "text-[#A31621] hover:bg-[#A31621] hover:text-white"
                    }`}
                    onClick={toggleProfile}
                  >
                    <UserIcon className="inline-block mr-1" size={20} />
                    <span>Profile</span>
                  </button>

                  {/* Profile Card */}
                  {isProfileOpen && (
                    <div className="absolute left-1/2 translate-x-[-50%] mt-2 w-64 bg-white shadow-xl rounded-lg p-4 text-black border border-gray-300 z-50 sm:left-auto sm:right-0 sm:translate-x-0">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Profile</h3>
                        <button onClick={closeAll}>
                          <X
                            size={20}
                            className="text-gray-500 hover:text-black"
                          />
                        </button>
                      </div>

                      {/* Avatar with First Letter */}
                      <div className="mt-3 flex items-center space-x-3">
                        <div className="w-12 h-12 flex items-center justify-center bg-red-800 text-white text-xl font-bold rounded-full">
                          {getInitials(user.name)}
                        </div>
                        <div className="text-sm">
                          <p>
                            <span className="font-semibold">Name:</span>{" "}
                            {user.name}
                          </p>
                          <p>
                            <span className="font-semibold">Email:</span>{" "}
                            {user.email}
                          </p>
                          <p>
                            <span className="font-semibold">Role:</span>{" "}
                            {user.role}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {isAdmin && (
              <NavLink
                to="/secret-dashboard"
                className={`flex items-center py-2 px-2 rounded-md text-center font-semibold ${
                  isProfileOpen
                    ? "text-[#A31621] hover:bg-[#A31621] hover:text-white"
                    : location.pathname === "/secret-dashboard"
                    ? "bg-[#A31621] text-white"
                    : "text-[#A31621] hover:bg-[#A31621] hover:text-white"
                }`}
                onClick={closeAll}
              >
                <Lock size={18} className="inline-block mr-1" />
                <span>Dashboard</span>
              </NavLink>
            )}

            {user ? (
              <button
                className="flex items-center py-2 px-2 rounded-md text-center font-semibold text-[#A31621] hover:text-white hover:bg-red-700"
                onClick={() => {
                  logout();
                  closeAll();
                }}
              >
                <LogOut size={18} className=" mr-2" />
                <span>LogOut</span>
              </button>
            ) : (
              <>
                <NavLink
                  to="/signup"
                  className={`flex items-center py-2 px-2 rounded-md text-center font-semibold ${
                    isProfileOpen
                      ? "text-[#A31621] hover:bg-[#A31621] hover:text-white"
                      : location.pathname === "/signup"
                      ? "bg-[#A31621] text-white"
                      : "text-[#A31621] hover:bg-[#A31621] hover:text-white"
                  }`}
                  onClick={closeAll}
                >
                  <UserPlus size={18} className=" mr-1" /> SignUp
                </NavLink>

                <NavLink
                  to="/login"
                  className={`flex items-center py-2 px-2 rounded-md text-center font-semibold ${
                    isProfileOpen
                      ? "text-[#A31621] hover:bg-[#A31621] hover:text-white"
                      : location.pathname === "/login"
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
