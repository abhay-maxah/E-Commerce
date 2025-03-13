import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useCartStore } from "../stores/useCartStore";

const GiftCouponCard = () => {
  const [userInputCode, setUserInputCode] = useState("");
  const { coupon, isCouponApplied, applyCoupon, getMyCoupon, removeCoupon } =
    useCartStore();

  // Debugging: Log store values
  console.log("GiftCouponCard Rendered");
  console.log("coupon:", coupon);
  console.log("isCouponApplied:", isCouponApplied);
  console.log("userInputCode:", userInputCode);

  useEffect(() => {
    console.log("Fetching my coupon...");
    getMyCoupon();
  }, [getMyCoupon]);

  useEffect(() => {
    if (coupon) {
      console.log("Coupon updated:", coupon);
      setUserInputCode(coupon.code);
    }
  }, [coupon]);

  const handleApplyCoupon = () => {
    if (!userInputCode) {
      console.log("No coupon code entered");
      return;
    }
    console.log("Applying coupon:", userInputCode);
    applyCoupon(userInputCode);
  };

  const handleRemoveCoupon = async () => {
    console.log("Removing coupon...");
    await removeCoupon();
    setUserInputCode("");
    getMyCoupon();
    console.log("Coupon removed, resetting input field");
  };

  return (
    <motion.div
      className="space-y-4 rounded-lg border border-[#A31621] p-4 shadow-sm sm:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="voucher" className="mb-2 block text-sm font-medium ">
            Do you have a voucher or gift card?
          </label>
          <input
            type="text"
            id="voucher"
            className="block w-full rounded-lg border border-red-600 bg-transparent 
            p-2.5 text-sm placeholder-gray-400 focus:outline-none "
            placeholder="Enter code here"
            value={userInputCode}
            onChange={(e) => setUserInputCode(e.target.value)}
            required
          />
        </div>

        <motion.button
          type="button"
          className="flex w-full items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium bg-transparent border border-[#A31621] hover:bg-[#A31621] hover:text-white focus:outline-none focus:ring-1 focus:ring-red-500"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleApplyCoupon}
        >
          Apply Code
        </motion.button>
      </div>

      {isCouponApplied && coupon && (
        <div className="mt-4">
          <h3 className="text-lg font-medium ">Applied Coupon</h3>
          <p className="mt-2 text-sm ">
            {coupon.code} - {coupon.discountPercentage}% off
          </p>
          <motion.button
            type="button"
            className="mt-2 flex w-full items-center justify-center rounded-lg
            px-5 py-2.5 text-sm font-medium bg-transparent border border-[#A31621] hover:bg-[#A31621] hover:text-white focus:outline-none
             focus:ring-4 focus:ring-red-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRemoveCoupon}
          >
            Remove Coupon
          </motion.button>
        </div>
      )}

      {coupon && (
        <div className="mt-4">
          <h3 className="text-lg font-medium ">Your Available Coupon:</h3>
          <p className="mt-2 text-sm ">
            {coupon.code} - {coupon.discountPercentage}% off
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default GiftCouponCard;
