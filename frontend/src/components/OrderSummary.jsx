import { motion } from "framer-motion";
import { useCartStore } from "../stores/useCartStore";
import { useAddressStore } from "../stores/useAddressStore";
import { Link } from "react-router-dom";
import { MoveRight } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import axios from "../lib/axios";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import AddressSelectionModal from "./AddressSelectionModal";
import { Loader } from "lucide-react";
const stripePromise = loadStripe(
  "pk_test_51QzEaMEEwnxF6uaXFg88SDeBc2gwYDHPmRvr50njYWLZheM2IhU3jCIC5LMgu0iE3ESsQCZJx4USDXBgr5H0oUUR00eenCOvyw"
);

const OrderSummary = () => {
  const { total, subtotal, coupon, isCouponApplied, cart, clearCart } =
    useCartStore();
  const [isDisabled, setIsDisabled] = useState(false);
  const { addresses, getAllAddresses } = useAddressStore();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch addresses on first load
  useEffect(() => {
    if (!addresses || addresses.length === 0) {
      getAllAddresses();
    }
  }, [getAllAddresses, addresses]);

  const savings = subtotal - total;
  const formattedSubtotal = subtotal.toFixed(2);
  const formattedTotal = total.toFixed(2);
  const formattedSavings = savings.toFixed(2);

  const handlePayment = async () => {
    setIsDisabled(true);
    if (!addresses || addresses.length === 0) {
      toast.error("Please add an address in your profile before proceeding.");
      return;
    }

    if (addresses.length > 1) {
      setIsModalOpen(true);
      return;
    }
    processOrder(addresses[0]); // If only one address, proceed automatically
  };

  const processOrder = async (address) => {
    if (!address) {
      toast.error("Please select an address before proceeding.");
      return;
    }

    const stripe = await stripePromise;
    try {
      // 🔹 Step 1: Create a Stripe Checkout Session
      const res = await axios.post("/payments/create-checkout-session", {
        products: cart,
        couponCode: isCouponApplied && coupon ? coupon.code : null,
        address: JSON.stringify(address),
      });

      const session = res.data;

      if (!session.id) {
        throw new Error("Stripe session ID is missing.");
      }

      // 🔹 Step 2: Redirect to Stripe for Payment
      const result = await stripe.redirectToCheckout({ sessionId: session.id });

      if (result.error) {
        console.error("❌ Stripe Checkout Error:", result.error);
      } else {
        console.log("🛒 Clearing cart...");
        setTimeout(() => clearCart(), 500);
      }
    } catch (error) {
      toast.error("Payment processing failed. Please try again.");
    }
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
                <Loader className="inline-block mr-2 animate-spin" />{" "}
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
          onClose={() => setIsModalOpen(false)}
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
