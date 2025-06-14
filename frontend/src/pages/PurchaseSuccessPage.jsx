import { ArrowRight, CheckCircle, HandHeart } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCartStore } from "../stores/useCartStore"; // Make sure this path is correct
import { useUserStore } from "../stores/useUserStore";
import axios from "../lib/axios";
import Confetti from "react-confetti";
import PaymentErrorPage from "./PaymentErrorPage"; // Make sure this path is correct
import LoadingSpinner from "../components/LoadingSpinner";

const PurchaseSuccessPage = () => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState(null);
  const [type, setType] = useState(null); // "order" or "subscription"
  const [orderId, setOrderId] = useState(null);
  const { clearCart } = useCartStore(); // Correctly destructure clearCart
  const { user, setUser } = useUserStore(); // setUser to update premium status

  useEffect(() => {
    const handleCheckoutSuccess = async (sessionId) => {
      try {
        const response = await axios.post("/payments/checkout-success", {
          sessionId,
        });

        // Get the 'source' query parameter from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const source = urlParams.get("source"); // This is crucial for conditional clearing

        if (response.data.type === "order") {

          if (source === "cart") {
            clearCart();
          }
          setOrderId(response.data.orderId);
        }

        if (response.data.type === "subscription") {
          setUser(response.data.user); // update user with premium = true
        }

        setType(response.data.type);
        setError(null); // Clear any previous errors on success
      } catch (err) {
        setError(err.response?.data?.message || "An unexpected error occurred after payment. Please check your orders shortly or contact support.");
      } finally {
        setIsProcessing(false);
      }
    };

    const sessionId = new URLSearchParams(window.location.search).get(
      "session_id"
    );
    if (sessionId) {
      handleCheckoutSuccess(sessionId);
    } else {
      setError("No session ID found in the URL. Payment verification failed.");
      setIsProcessing(false);
    }
  }, [clearCart, setUser]); // Add clearCart to dependency array for useEffect

  const isPremium = user?.premium === true;

  if (isProcessing) {
    return (
      <LoadingSpinner />
    );
  }

  // If there's an error, render the PaymentErrorPage
  if (error) {
    // Pass the error message to the PaymentErrorPage if it accepts it as a prop
    return <PaymentErrorPage errorMessage={error} />;
  }

  // Otherwise, render the success page
  return (
    <div className="h-screen flex items-center justify-center px-4">
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        gravity={0.1}
        style={{ zIndex: 99 }}
        numberOfPieces={1000}
        recycle={false}
      />

      <div className="max-w-md w-full bg-transparent border border-[#A31621] rounded-lg shadow-xl overflow-hidden relative z-10">
        <div className="p-6 sm:p-8">
          <div className="flex justify-center">
            <CheckCircle className="text-[#A31621] w-16 h-16 mb-4" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-[#A31621] mb-2">
            {type === "subscription" ? "You're Premium Now!" : "Purchase Successful!"}
          </h1>

          <p className="text-center mb-2">
            {type === "subscription"
              ? "Thank you for upgrading. Enjoy exclusive benefits."
              : "Thank you for your order. We're processing it now."}
          </p>
          <p className="text-center text-sm mb-6">
            Check your email for {type === "subscription" ? "your subscription details" : "order details and updates"}.
          </p>

          {type === "order" && (
            <div className="bg-[#A31621] rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white">Order number</span>
                <span className="text-sm font-semibold text-white">
                  #{orderId?.slice(-6) || Math.floor(Math.random() * 100000)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white">Estimated delivery</span>
                <span className="text-sm font-semibold text-white">
                  {isPremium ? "1-2 business days" : "4-7 business days"}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <button className="w-full bg-[#A31621] hover:bg-[#7A1D18] text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center">
              <HandHeart className="mr-2" size={18} />
              {type === "subscription"
                ? "Thanks for going Premium!"
                : "Thanks for trusting us!"}
            </button>
            <Link
              to={"/"}
              className="w-full bg-transparent border border-[#A31621] hover:bg-[#A31621] hover:text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center"
            >
              Continue Shopping
              <ArrowRight className="ml-2" size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSuccessPage;