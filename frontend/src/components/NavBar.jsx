import {
  ShoppingCart,
  UserPlus,
  LogIn,
  LogOut,
  Lock,
  Menu,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useUserStore } from "../stores/useUserStore.js";
import { useCartStore } from "../stores/useCartStore.js";
import { CookieIcon } from "lucide-react";

const NavBar = () => {
  const { user, logout } = useUserStore();
  const isAdmin = user?.role === "admin";
  const { cart } = useCartStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="fixed top-0 left-0 w-full bg-gray-900 bg-opacity-90 backdrop-blur-md shadow-lg z-40 border-b border-emerald-800">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold text-emerald-400 flex items-center space-x-2"
          >
            <CookieIcon className="mr-2" size={24} />
            COOKIES MAN
          </Link>

          {/* Hamburger Icon */}
          <div className="lg:hidden">
            {menuOpen ? (
              <X
                className="text-white cursor-pointer"
                size={28}
                onClick={toggleMenu}
              />
            ) : (
              <Menu
                className="text-white cursor-pointer"
                size={28}
                onClick={toggleMenu}
              />
            )}
          </div>

          {/* Navigation Links */}
          <nav
            className={`lg:flex items-center gap-4 ${
              menuOpen
                ? "flex flex-col justify-center items-center w-4/5 max-w-sm bg-gray-900 rounded-lg shadow-lg p-6 absolute top-16 right-0"
                : "hidden"
            } lg:block lg:static lg:w-auto lg:bg-transparent transition-all duration-300`}
          >
            <Link
              to="/"
              className="block lg:inline-block text-gray-300 hover:text-emerald-400 py-2 lg:py-0"
              onClick={closeMenu}
            >
              Home
            </Link>
            <Link
              to="/category/Cookies"
              className="block lg:inline-block text-gray-300 hover:text-emerald-400 py-2 lg:py-0"
              onClick={closeMenu}
            >
              Cookies
            </Link>
            <Link
              to="/category/Chocolates"
              className="block lg:inline-block text-gray-300 hover:text-emerald-400 py-2 lg:py-0"
              onClick={closeMenu}
            >
              Chocolates
            </Link>

            {user && (
              <Link
                to="/cart"
                className="relative group text-gray-300 hover:text-emerald-400 py-2 lg:py-0"
                onClick={closeMenu}
              >
                <ShoppingCart
                  className="inline-block mr-1 group-hover:text-emerald-400"
                  size={20}
                />
                <span className="hidden sm:inline">Cart</span>
                {cart.length > 0 && (
                  <span className="absolute -top-2 -left-2 bg-emerald-500 text-white rounded-full px-2 py-0.5 text-xs">
                    {cart.length}
                  </span>
                )}
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/secret-dashboard"
                className="bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1 rounded-md"
                onClick={closeMenu}
              >
                <Lock size={18} className="inline-block mr-1" />
                Dashboard
              </Link>
            )}

            {user ? (
              <button
                className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md"
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
                  className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md"
                  onClick={closeMenu}
                >
                  <UserPlus size={18} className="mr-2" /> Sign Up
                </Link>
                <Link
                  to="/login"
                  className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md"
                  onClick={closeMenu}
                >
                  <LogIn size={18} className="mr-2" /> Login
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
