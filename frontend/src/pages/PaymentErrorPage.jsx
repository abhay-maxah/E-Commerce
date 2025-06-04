import { XCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const PaymentErrorPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-transparent border border-[#A31621] rounded-lg shadow-xl overflow-hidden relative z-10"
      >
        <div className="p-6 sm:p-8">
          <div className="flex justify-center">
            <XCircle className="text-red-500 w-16 h-16 mb-4" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-red-500 mb-2">
            Payment Failed
          </h1>
          <p className="text-center mb-6">
            Your payment was successful, but we encountered a technical issue while processing your order. If the order is not created, your money will be automatically refunded within 24 to 48 hours. Please check your orders shortly or contact support for assistance.
          </p>
          <div className="bg-red-500 rounded-lg p-4 mb-6">
            <p className="text-sm text-white text-center">
              Please try again or contact support if the issue persists.
            </p>
          </div>
          <div className="space-y-4">
            <Link
              to="/"
              className="w-full bg-transparent border border-[#A31621] hover:bg-[#A31621] hover:text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center"
            >
              <ArrowLeft className="mr-2" size={18} />
              Back to Home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentErrorPage;
