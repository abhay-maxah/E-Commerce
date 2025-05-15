import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  UserPlus,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  Loader,
} from "lucide-react";
import { motion } from "framer-motion";
import { useUserStore } from "../stores/useUserStore";

const popularEmailDomains = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "aol.com",
  "icloud.com",
  "protonmail.com",
  "zoho.com",
  "mail.com",
  "gmx.com",
];

const SignUpPage = ({ userType = "user" }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    code: "",
    role: userType,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [timer, setTimer] = useState(0);
  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");

  const { signup, loading, sendCode, verifyCode } = useUserStore();

  const inputClass =
    "w-full rounded-md border border-gray-300 bg-transparent py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-0 focus:border-transparent";

  const plainInputClass =
    "flex-1 rounded-l-md border border-gray-300 bg-transparent py-2 px-3 text-sm focus:outline-none focus:ring-0 focus:border-transparent";

  const isValidEmailDomain = (email) => {
    if (!email) return false;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const domain = email.split("@")[1];
    return regex.test(email) && domain && popularEmailDomains.includes(domain.toLowerCase());
  };

  const validatePassword = (password) => {
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (!/[a-z]/.test(password)) return "Include a lowercase letter.";
    if (!/[A-Z]/.test(password)) return "Include an uppercase letter.";
    if (!/[0-9]/.test(password)) return "Include a number.";
    if (!/[^a-zA-Z0-9]/.test(password)) return "Include a special character.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const passwordErrorMessage = validatePassword(formData.password);
    setPasswordError(passwordErrorMessage);
    if (passwordErrorMessage) return;

    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match.");
    }

    if (!isValidEmailDomain(formData.email)) {
      setEmailError(`Only email domains allowed: ${popularEmailDomains.join(", ")}`);
      return;
    } else {
      setEmailError("");
    }

    try {
      const token = await window.grecaptcha.execute("6LewqyErAAAAAJbiS2ByOtkI376mhlaF807odWLE", {
        action: "signup",
      });

      await verifyCode(formData.email, formData.code);
      setCodeVerified(true);

      signup({ ...formData, captchaToken: token });
    } catch (err) {
      console.error("reCAPTCHA or verification failed", err);
    }
  };

  const handleSendCode = async (email) => {
    if (!email) return toast.error("Enter your email address.");
    if (!isValidEmailDomain(email)) {
      toast.error(`Only email domains allowed: ${popularEmailDomains.join(", ")}`);
      return;
    }
    try {
      setSendingCode(true);
      await sendCode(email);
      setTimer(60);
    } catch (err) {
      console.error("Send code failed:", err);
    } finally {
      setSendingCode(false);
    }
  };

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        className="w-full max-w-md space-y-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-center text-3xl font-extrabold">
          {userType === "admin" ? "Create your account as Admin" : "Create your account"}
        </h2>

        <div className="rounded-lg border border-[#A31621] bg-transparent px-6 py-8 shadow-md sm:px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold">
                Full name
              </label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2" size={20} />
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={inputClass}
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold">
                Email address
              </label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2" size={20} />
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  onBlur={(e) =>
                    setEmailError(isValidEmailDomain(e.target.value) ? "" : "Invalid email domain")
                  }
                  className={inputClass}
                  placeholder="you@example.com"
                />
              </div>
              {emailError && <p className="mt-1 text-sm text-red-500">{emailError}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold">
                Password
              </label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2" size={20} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    setPasswordError(validatePassword(e.target.value));
                  }}
                  className="w-full rounded-md border border-gray-300 bg-transparent py-2 pl-10 pr-10 text-sm focus:outline-none focus:ring-0 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {passwordError && <p className="mt-1 text-sm text-red-500">{passwordError}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold">
                Confirm Password
              </label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2" size={20} />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  onPaste={(e) => e.preventDefault()}
                  className="w-full rounded-md border border-gray-300 bg-transparent py-2 pl-10 pr-10 text-sm focus:outline-none focus:ring-0 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="code" className="block text-sm font-semibold">
                Verification Code
              </label>
              <div className="relative mt-1 flex">
                <input
                  id="code"
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className={plainInputClass}
                  placeholder="Enter code"
                />
                <button
                  type="button"
                  onClick={() => handleSendCode(formData.email)}
                  className="rounded-r-md bg-[#A31621] px-4 py-2 text-sm text-white hover:bg-[#8f101a] disabled:opacity-50"
                  disabled={
                    sendingCode || timer > 0 || !formData.email || !isValidEmailDomain(formData.email)
                  }
                >
                  {sendingCode
                    ? "Sending..."
                    : timer > 0
                      ? `Resend in ${timer}s`
                      : "Send Code"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center rounded-md border border-[#A31621] px-4 py-2 text-sm font-semibold hover:bg-[#A31621] hover:text-white focus:outline-none"
              disabled={loading || passwordError || emailError}
            >
              {loading ? (
                <>
                  <Loader className="mr-2 h-5 w-5 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-5 w-5" />
                  Sign up
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-[#A31621] hover:underline">
              Login here <ArrowRight className="inline h-4 w-4" />
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUpPage;
