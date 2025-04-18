import { motion } from "framer-motion";
import { useCartStore } from "../stores/useCartStore";
import { useAddressStore } from "../stores/useAddressStore";
import { Link } from "react-router-dom";
import { MoveRight, Loader } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import axios from "../lib/axios";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import AddressSelectionModal from "./AddressSelectionModal";
import { useUserStore } from "../stores/useUserStore"; // Make sure to import the user store

const stripePromise = loadStripe(
  "pk_test_51RCbq8QQS5dYukip8w5f6jioCO89ij7uxQDBTgQbtroyVdsp3tTcSAaIMwXKBjDcCXuwjqxjTMvlJociOALT0FEq00uhbHN90f"
);

const OrderSummary = () => {
  const { total, subtotal, coupon, isCouponApplied, cart, clearCart } =
    useCartStore();
  const { user } = useUserStore(); // Get user data from the store
  const [isDisabled, setIsDisabled] = useState(false);
  const { addresses, getAllAddresses } = useAddressStore();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!addresses || addresses.length === 0) {
      getAllAddresses();
    }
  }, [getAllAddresses]);

  const deliveryCharge = 70; // Set delivery charge
  const isPremiumUser = user?.premium; // Check if the user is premium
  const savings = subtotal - total;
  const formattedSubtotal = subtotal.toFixed(2);
  const formattedTotal = (isPremiumUser ? total : total + deliveryCharge).toFixed(2); // Add delivery charge to total only if not premium
  const formattedSavings = savings.toFixed(2);

  const handlePayment = async () => {
    setIsDisabled(true);

    if (!addresses || addresses.length === 0) {
      toast.error("Please add an address in your profile before proceeding.");
      setIsDisabled(false);
      return;
    }

    if (addresses.length > 1) {
      setIsModalOpen(true);
      return;
    }

    processOrder(addresses[0]);
  };

  const processOrder = async (address) => {
    if (!address) {
      toast.error("Please select an address before proceeding.");
      setIsDisabled(false);
      return;
    }

    const stripe = await stripePromise;
    try {
      const res = await axios.post("/payments/create-checkout-session", {
        products: cart,
        couponCode: isCouponApplied && coupon ? coupon.code : null,
        address: JSON.stringify(address),
        deliveryCharge: isPremiumUser ? 0 : deliveryCharge, // Send 0 if user is premium, otherwise send delivery charge
      });

      const session = res.data;

      if (!session.id) {
        throw new Error("Stripe session ID is missing.");
      }

      const result = await stripe.redirectToCheckout({ sessionId: session.id });

      if (result.error) {
        console.error("❌ Stripe Checkout Error:", result.error);
        toast.error("Payment failed. Please try again.");
        setIsDisabled(false);
      } else {
        setTimeout(() => clearCart(), 500);
      }
    } catch (error) {
      toast.error("Payment processing failed. Please try again.");
      setIsDisabled(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    setIsDisabled(false); // ✅ Reset the button if modal is closed without selection
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

            {coupon && isCouponApplied && savings > 0 && (
              <dl className="flex items-center justify-between gap-4">
                <dt className="text-base font-normal">Savings</dt>
                <dd className="text-base font-medium">Rs.{formattedSavings}</dd>
              </dl>
            )}

            {coupon && isCouponApplied && (
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
                <dd className="text-base font-medium">Rs.{deliveryCharge}</dd>
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
            setSelectedAddress(address);
            setIsModalOpen(false);
            processOrder(address);
          }}
        />
      )}
    </>
  );
};

export default OrderSummary;