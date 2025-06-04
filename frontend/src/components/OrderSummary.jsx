import { motion } from "framer-motion";
import { useCartStore } from "../stores/useCartStore";
import { useAddressStore } from "../stores/useAddressStore";
import { Link } from "react-router-dom";
import { MoveRight, Loader } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import axios from "../lib/axios";
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import AddressSelectionModal from "./AddressSelectionModal";
import { useUserStore } from "../stores/useUserStore";

const stripePromise = loadStripe(
  "pk_test_51RCbq8QQS5dYukip8w5f6jioCO89ij7uxQDBTgQbtroyVdsp3tTcSAaIMwXKBjDcCXuwjqxjTMvlJociOALT0FEq00uhbHN90f"
);

const OrderSummary = () => {
  const { total: rawTotal, subtotal: rawSubtotal, coupon, isCouponApplied, cart } = useCartStore(); // Keep clearCart for now, but its direct use here will be removed.

  const { user } = useUserStore();
  const [isDisabled, setIsDisabled] = useState(false);
  const { addresses, getAllAddresses } = useAddressStore();

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    getAllAddresses();
  }, [getAllAddresses]);

  const deliveryCharge = 70; // Hardcoded delivery charge
  const isPremiumUser = user?.premium === true; // Strictly check for boolean true
  const subtotal = Number(rawSubtotal || 0);
  const total = Number(rawTotal || 0);

  const savings = subtotal - total;

  const finalCalculatedTotal = isPremiumUser ? total : total + deliveryCharge;

  const formattedSubtotal = subtotal.toFixed(2);
  const formattedTotal = finalCalculatedTotal.toFixed(2);
  const formattedSavings = savings.toFixed(2);

  const processOrder = useCallback(async (addressId) => {
    if (!addressId) {
      toast.error("An address ID must be selected to proceed with the order.");
      setIsDisabled(false);
      return;
    }

    const stripe = await stripePromise;
    if (!stripe) {
      toast.error("Stripe could not be loaded. Please try again.");
      setIsDisabled(false);
      return;
    }

    try {
      // Define success and cancel URLs for Stripe redirection
      // IMPORTANT: Add `source=cart` query parameter to success_url
      const successUrl = `${window.location.origin}/purchase-success?session_id={CHECKOUT_SESSION_ID}&source=cart`; // Added source=cart
      const cancelUrl = `${window.location.origin}/cart`; // Redirect back to the cart page if canceled

      const payload = {
        products: cart,
        couponCode: (isCouponApplied && coupon?.code) ? coupon.code : null,
        address: addressId,
        deliveryCharge: Math.round(isPremiumUser ? 0 : deliveryCharge), // Ensure delivery charge is an integer
        success_url: successUrl, // Pass the success URL to backend
        cancel_url: cancelUrl,   // Pass the cancel URL to backend
      };

      const res = await axios.post("/payments/create-checkout-session", payload);
      const session = res.data;

      if (!session.id) {
        throw new Error("Stripe session ID is missing from response. Backend issue?");
      }

      const result = await stripe.redirectToCheckout({ sessionId: session.id });

      if (result.error) {
        console.error("❌ Stripe Checkout Error:", result.error.message || result.error);
        toast.error(`Payment failed: ${result.error.message || "Unknown error."}`);
      }
      // Removed setTimeout(() => clearCart(), 500);
      // Cart clearing is now handled by PurchaseSuccessPage based on `source` parameter
    } catch (error) {
      console.error("❌ Order processing failed:", error.response?.data || error.message || error);
      const errorMessage = error.response?.data?.error || error.message || "Please try again.";
      toast.error(`Payment processing failed: ${errorMessage}`);
    } finally {
      setIsDisabled(false); // Re-enable button even on error or success
      setIsModalOpen(false); // Close modal if open after attempt
    }
  }, [cart, isCouponApplied, coupon, isPremiumUser]); // clearCart is removed from dependencies as it's not directly called here anymore

  const handlePayment = async () => {
    setIsDisabled(true); // Disable button immediately to prevent multiple clicks

    // --- Address Validation ---
    if (!addresses || addresses.length === 0) {
      toast.error("Please add an address in your profile before proceeding.");
      setIsDisabled(false);
      return;
    }

    // If more than one address, open modal for selection
    if (addresses.length > 1) {
      setIsModalOpen(true);
      return; // Stop here; processOrder will be called from modal's onSelect
    }

    // If exactly one address, proceed with it directly
    if (addresses[0] && addresses[0]._id) {
      processOrder(addresses[0]._id); // Pass only the _id
    } else {
      // This case should ideally not happen if addresses array is valid and non-empty
      toast.error("Selected address is invalid. Please try again.");
      setIsDisabled(false);
      return;
    }
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    setIsDisabled(false); // Re-enable button if modal is cancelled
  };

  return (
    <>
      <motion.div
        className="space-y-4 rounded-lg bg-transparent border border-[#A31621] p-4 shadow-sm sm:p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-xl font-semibold">Order summary</p>

        <div className="space-y-4">
          <div className="space-y-2">
            <dl className="flex items-center justify-between gap-4">
              <dt className="text-base font-normal">Original price</dt>
              <dd className="text-base font-medium">Rs.{formattedSubtotal}</dd>
            </dl>

            {/* Conditionally render savings and coupon details */}
            {isCouponApplied && savings > 0 && ( // Only show savings if coupon is applied and there are actual savings
              <dl className="flex items-center justify-between gap-4">
                <dt className="text-base font-normal">Savings</dt>
                <dd className="text-base font-medium">Rs.{formattedSavings}</dd>
              </dl>
            )}

            {isCouponApplied && coupon?.code && ( // Only show coupon code if applied and code exists
              <dl className="flex items-center justify-between gap-4">
                <dt className="text-base font-normal">
                  Coupon ({coupon.code})
                </dt>
                <dd className="text-base font-medium">
                  -{coupon.discountPercentage}%
                </dd>
              </dl>
            )}

            {!isPremiumUser && (
              <dl className="flex items-center justify-between gap-4">
                <dt className="text-base font-normal">Delivery Charge</dt>
                <dd className="text-base font-medium">Rs.{deliveryCharge.toFixed(2)}</dd> {/* Format for display */}
              </dl>
            )}

            <dl className="flex items-center justify-between gap-4 border-t pt-2">
              <dt className="text-base font-bold">Total</dt>
              <dd className="text-base font-bold">Rs.{formattedTotal}</dd>
            </dl>
          </div>

          <motion.button
            className="flex w-full items-center justify-center rounded-lg bg-transparent border border-[#A31621] hover:bg-[#A31621] hover:text-white px-5 py-2.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePayment}
            disabled={isDisabled}
          >
            {isDisabled ? (
              <>
                <Loader className="inline-block mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>Process to Checkout</>
            )}
          </motion.button>

          <div className="flex items-center justify-center gap-2">
            <span className="text-sm font-normal">or</span>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium underline hover:text-red-900 hover:no-underline"
            >
              Continue Shopping
              <MoveRight size={16} />
            </Link>
          </div>
        </div>
      </motion.div>

      {isModalOpen && (
        <AddressSelectionModal
          addresses={addresses}
          onClose={handleModalCancel}
          onSelect={(address) => {
            if (address && address._id) {
              setSelectedAddress(address); // Update local state for UI if needed
              setIsModalOpen(false); // Close modal
              processOrder(address._id); // Proceed with the selected address ID
            } else {
              toast.error("Invalid address selected.");
              setIsModalOpen(false); // Close modal
              setIsDisabled(false); // Re-enable button
            }
          }}
        />
      )}
    </>
  );
};

export default OrderSummary;