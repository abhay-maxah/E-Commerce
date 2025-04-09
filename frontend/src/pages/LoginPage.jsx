import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  LogIn,
  Mail,
  Lock,
  ArrowRight,
  Loader,
  Eye,
  EyeOff,
} from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import { useGoogleLogin } from "@react-oauth/google";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { login, loading, googleAuth } = useUserStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      await login(email, password);
    } catch (err) {
      setErrorMessage("Invalid credentials");
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async ({ code }) => {
      try {
        await googleAuth(code);
      } catch (error) {
        setErrorMessage("Google login failed.");
      }
    },
    onError: () => setErrorMessage("Google login error."),
  });

  return (
    <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <motion.div
        className="sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="mt-6 text-center text-3xl font-extrabold">
          Login to your account
        </h2>
      </motion.div>

      <motion.div
        className="border border-[#A31621] mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="bg-transparent py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email address
              </label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-3 py-2 bg-transparent rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2 bg-transparent rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {errorMessage && (
              <p className="text-sm text-red-500 text-center">{errorMessage}</p>
            )}
            <div className="text-sm text-right">
              <Link to="/forgot-password" className="font-medium text-[#A31621] hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2 px-4 border border-[#A31621] hover:bg-[#A31621] hover:text-white rounded-md text-sm font-medium transition"
            >
              {loading ? (
                <>
                  <Loader className="mr-2 h-5 w-5 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  Login
                </>
              )}
            </button>
          </form>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full mt-5 flex items-center justify-center gap-2 py-2 px-4 bg-white text-black border border-gray-300 hover:bg-gray-100 rounded-md text-sm font-medium transition"
          >
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Continue with Google
          </button>

          <p className="mt-8 text-center text-sm">
            Not a member?{" "}
            <Link to="/signup" className="font-medium hover:underline">
              Sign up now <ArrowRight className="inline h-4 w-4" />
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
