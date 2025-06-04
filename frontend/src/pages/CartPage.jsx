import { useNavigate } from "react-router-dom";
import { useCartStore } from "../stores/useCartStore";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import CartItem from "../components/CartItem";
import PeopleAlsoBought from "../components/PeopleAlsoBought";
import OrderSummary from "../components/OrderSummary";
import GiftCouponCard from "../components/GiftCouponCard";
import { useUserStore } from "../stores/useUserStore";
import { useState } from "react";
const CartPage = () => {
  const [showPremiumBanner, setShowPremiumBanner] = useState(true);
  const { cart } = useCartStore();
  const { user } = useUserStore();
  const navigate = useNavigate();
  const handleBecomePremium = () => {
    navigate("/premium");
  };

  return (
    <div className="py-8 md:py-16">
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        <div className="mt-6 sm:mt-8 md:gap-6 lg:flex lg:items-start xl:gap-8">
          <motion.div
            className="mx-auto w-full flex-none lg:max-w-2xl xl:max-w-4xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {user && !user.premium && cart.length > 0 && showPremiumBanner && (
              <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 border border-yellow-300 p-5 rounded-lg shadow-sm mb-6 flex items-start gap-4 relative">
                <div className="text-yellow-500 text-4xl">⭐</div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-yellow-800">
                    Unlock Premium Benefits!
                  </h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    You're not a premium member. Delivery charges of ₹70 may apply. Upgrade to enjoy
                    <strong> free delivery</strong>, <strong>exclusive deals</strong>, and more!
                  </p>
                </div>
                <button
                  onClick={handleBecomePremium}
                  className="bg-[#A31621] hover:bg-red-800 text-white font-semibold px-4 py-2 mt-5 rounded-md text-sm transition-all"
                >
                  Upgrade Now
                </button>
                <button
                  onClick={() => setShowPremiumBanner(false)}
                  className="absolute top-2 right-2 text-yellow-600 hover:text-yellow-800 text-lg font-bold"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            )}


            {cart.length === 0 ? (
              <EmptyCartUI />
            ) : (
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-[#A31621] mb-4">
                  Cart Items
                </h3>
                  {cart.map((item, idx) => {
                    const selectedPrice = item.selectedPrice ?? 'noPrice';
                    const selectedWeight = item.selectedWeight ?? 'noWeight';
                    const key = `${item._id}-${selectedPrice}-${selectedWeight}-${idx}`;
                    return <CartItem key={key} item={item} />;
                  })}
              </div>
            )}
            {cart.length > 0 && <PeopleAlsoBought />}
          </motion.div>

          {cart.length > 0 && (
            <motion.div
              className="mx-auto mt-6 max-w-4xl flex-1 space-y-6 lg:mt-0 lg:w-full"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <OrderSummary />
              <GiftCouponCard />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;

const EmptyCartUI = () => {
  const navigate = useNavigate();

  const handleStartShopping = () => {
    navigate("/category/Cookies");
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center space-y-4 py-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ShoppingCart className="h-24 w-24 text-gray-300" />
      <h3 className="text-2xl font-semibold ">Your cart is empty</h3>
      <p className="text-gray-400">
        Looks like you haven't added anything to your cart yet.
      </p>
      <button
        className="mt-4 rounded-md bg-transparent border border-[#A31621] hover:bg-[#A31621] hover:text-white px-6 py-2"
        onClick={handleStartShopping}
      >
        Start Shopping
      </button>
    </motion.div>
  );
};
