import {
  ShoppingCart,
  UserPlus,
  LogIn,
  LogOut,
  Lock,
  Menu,
  UserIcon,
  X,
  CookieIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useUserStore } from "../stores/useUserStore.js";
import { useCartStore } from "../stores/useCartStore.js";

const NavBar = () => {
  const { user, logout } = useUserStore();
  const isAdmin = user?.role === "admin";
  const { cart } = useCartStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);
  const toggleProfile = () => setShowProfile(!showProfile);
  const closeProfile = () => setShowProfile(false);

  return (
    <header className="fixed top-0 left-0 w-full bg-[#fcf7f8] text-[#A31621] bg-opacity-90 backdrop-blur-md shadow-lg z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold text-[#A31621] flex items-center space-x-2"
          >
            <CookieIcon className="mr-2" size={24} />
            COOKIES MAN
          </Link>

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
            className={`lg:flex items-center gap-4 ${
              menuOpen
                ? "flex flex-col justify-center items-center w-4/5 max-w-sm bg-[#fcf7f8] rounded-lg shadow-lg p-6 absolute top-16 right-0"
                : "hidden"
            } lg:block lg:static lg:w-auto lg:bg-transparent transition-all duration-300`}
          >
            <Link
              to="/"
              className="block lg:inline-block  bg-transparent hover:bg-[#A31621]  hover:text-white text-[#A31621] py-2 px-4 rounded-md  lg:py-0"
              onClick={closeMenu}
            >
              Home
            </Link>
            <Link
              to="/category/Cookies"
              className="block lg:inline-block  hover:bg-[#A31621]  rounded-md hover:text-white text-[#A31621] py-2 px-4 lg:py-0"
              onClick={closeMenu}
            >
              Cookies
            </Link>
            <Link
              to="/category/Chocolates"
              className="block lg:inline-block  hover:bg-[#A31621]  rounded-md hover:text-white text-[#A31621] py-2 px-4 lg:py-0"
              onClick={closeMenu}
            >
              Chocolates
            </Link>

            {user && (
              <>
                <Link
                  to="/cart"
                  className="relative bg-transparent hover:bg-[#A31621] hover:text-white text-[#A31621] py-2 px-4 rounded-md lg:py-0 transition-colors duration-300"
                  onClick={closeMenu}
                >
                  <ShoppingCart className="inline-block mr-1" size={20} />
                  <span>Cart</span>
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -left-2 bg-[#A31621] text-white rounded-full px-2 py-0.5 text-xs font-bold">
                      {cart.length}
                    </span>
                  )}
                </Link>

                {/* Profile Button */}
                <div className="relative bg-transparent hover:bg-[#A31621]  hover:text-white text-[#A31621] py-2 px-4 rounded-md">
                  <button
                    className="flex items-center py-2 lg:py-0 focus:outline-none"
                    onClick={toggleProfile}
                  >
                    <UserIcon className="inline-block mr-1" size={20} />
                    <span>Profile</span>
                  </button>

                  {/* Profile Card */}
                  {showProfile && (
                    <div className="absolute left-1/2 translate-x-[-50%] mt-2 w-64 bg-white shadow-xl rounded-lg p-4 text-black border border-gray-300 z-50 sm:left-auto sm:right-0 sm:translate-x-0">
                      {/* Close Button */}
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Profile</h3>
                        <button onClick={closeProfile}>
                          <X
                            size={20}
                            className="text-gray-500 hover:text-black"
                          />
                        </button>
                      </div>

                      {/* Avatar with First Letter */}
                      <div className="mt-3 flex items-center space-x-3">
                        <div className="w-12 h-12 flex items-center justify-center bg-red-800 text-white text-xl font-bold rounded-full">
                          {user.name?.charAt(0).toUpperCase()}
                          {user.name?.charAt(5).toUpperCase()}
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
              <Link
                to="/secret-dashboard"
                className="bg-transparent hover:bg-[#A31621]  hover:text-white text-[#A31621] py-2 px-4 rounded-md"
                onClick={closeMenu}
              >
                <Lock size={18} className="inline-block mr-1" />
                Dashboard
              </Link>
            )}

            {user ? (
              <button
                className="bg-transparent hover:bg-[#A31621]  hover:text-white text-[#A31621] py-2 px-4 rounded-md"
                onClick={() => {
                  logout();
                  closeMenu();
                }}
              >
                <LogOut size={18} className="inline-block mr-2" />
                Log Out
              </button>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="bg-transparent hover:bg-[#A31621]  hover:text-white text-[#A31621] py-2 px-4 rounded-md"
                  onClick={closeMenu}
                >
                  <UserPlus size={18} className="inline-block mr-1" /> Sign Up
                </Link>
                <Link
                  to="/login"
                  className="bg-transparent hover:bg-[#A31621]  hover:text-white text-[#A31621] py-2 px-4 rounded-md"
                  onClick={closeMenu}
                >
                  <LogIn size={18} className="inline-block mr-1" /> Login
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
