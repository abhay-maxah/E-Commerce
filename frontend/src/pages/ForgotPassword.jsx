import { useEffect, useRef, useState } from "react";
import { Mail, Lock, Eye, EyeOff, RotateCcw } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { useUserStore } from "../stores/useUserStore";
import { Link, useNavigate } from "react-router-dom";

const ForgetPasswordPage = () => {
  const { verifyCode, resetPassword, sendCodeForgot } = useUserStore();
  const [step, setStep] = useState(1);
  const [sending, setSending] = useState(false);

  const [form, setForm] = useState({
    email: "",
    codeDigits: ["", "", "", "", "", ""],
    newPassword: "",
    confirmPassword: "",
  });

  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();

  const inputsRef = useRef([]);

  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    }
  }, [timer]);

  const handleSendCode = async () => {
    if (!form.email) return toast.error("Enter your email address");

    setSending(true); // Disable button
    try {
      await sendCodeForgot(form.email);
      toast.success("Code sent to email");
      setStep(2);
      setTimer(60);
    } catch (error) {
      toast.error("Failed to send code");
    } finally {
      setSending(false); // Enable button again
    }
  };

  const handleResendCode = async () => {
    if (timer > 0) return;
    await sendCodeForgot(form.email);
    toast.success("Code resent");
    setTimer(60);
  };

  const handleVerifyCode = async () => {
    const code = form.codeDigits.join("");
    if (code.length !== 6) return toast.error("Enter all 6 digits");
    await verifyCode(form.email, code);
    toast.success("Code verified");
    setStep(3);
  };

  const handleDigitChange = (index, value) => {
    if (/^\d?$/.test(value)) {
      const newDigits = [...form.codeDigits];
      newDigits[index] = value;
      setForm({ ...form, codeDigits: newDigits });

      if (value && index < 5) {
        inputsRef.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !form.codeDigits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleResetPassword = async () => {
    if (form.newPassword !== form.confirmPassword) {
      return toast.error("Passwords don't match");
    }
    try {
      await resetPassword(form.email, form.newPassword);
      toast.success("Password reset successful");
      navigate("/login");
    } catch (err) {
      toast.error("Password reset failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <motion.div
        className="w-full max-w-md border border-[#A31621] p-8 rounded-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-2xl font-bold text-center mb-6">Forgot Password</h2>

        {step === 1 && (
          <>
            <p className="text-sm mb-4">
              Enter your email address and we’ll send you a verification code to reset your password.
            </p>
            <label className="block text-sm font-medium mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="pl-10 w-full py-2 rounded-md bg-transparent border focus:ring-[#A31621]"
              />
            </div>
            <button
              onClick={handleSendCode}
              disabled={sending}
              className={`mt-4 w-full py-2 text-white rounded ${sending ? "bg-gray-400 cursor-not-allowed" : "bg-[#A31621] hover:bg-[#8f101a]"
                }`}
            >
              {sending ? "Sending..." : "Send Code"}
            </button>

            <Link to="/login" className="flex text-center text-sm mt-4 hover:underline text-[#A31621]">
              Back to Login
            </Link>
          </>
        )}

        {step === 2 && (
          <>
            <label className="block text-sm font-medium mb-1">Verification Code</label>
            <div className="flex justify-between gap-2 mb-4">
              {form.codeDigits.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={digit}
                  ref={(el) => (inputsRef.current[index] = el)}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-10 h-12 text-center text-xl border rounded-md focus:outline-none focus:ring-2 focus:ring-[#A31621]"
                />
              ))}
            </div>
            <button
              onClick={handleVerifyCode}
              className="w-full py-2 bg-[#A31621] text-white rounded hover:bg-[#8f101a]"
            >
              Verify Code
            </button>
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-red-600">
                {timer > 0 ? `Resend in ${timer}s` : "Didn't receive the code?"}
              </span>
              <button
                onClick={handleResendCode}
                disabled={timer > 0}
                className={`flex items-center text-sm text-[#A31621] hover:underline disabled:opacity-50`}
              >
                <RotateCcw size={16} className="mr-1" /> Resend Code
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type={showNewPass ? "text" : "password"}
                placeholder="New Password"
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                className="pl-10 w-full py-2 rounded-md bg-transparent border focus:ring-[#A31621]"
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-gray-400"
                onClick={() => setShowNewPass(!showNewPass)}
              >
                {showNewPass ? <EyeOff /> : <Eye />}
              </button>
            </div>

            <label className="block text-sm font-medium mt-4 mb-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type={showConfirmPass ? "text" : "password"}
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="pl-10 w-full py-2 rounded-md bg-transparent border focus:ring-[#A31621]"
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-gray-400"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
              >
                {showConfirmPass ? <EyeOff /> : <Eye />}
              </button>
            </div>

            <button
              onClick={handleResetPassword}
              className="mt-6 w-full py-2 bg-[#A31621] text-white rounded hover:bg-[#8f101a]"
            >
              Reset Password
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ForgetPasswordPage;
