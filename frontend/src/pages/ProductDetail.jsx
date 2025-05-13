import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProductStore } from "../stores/useProductStore";
import { useUserStore } from "../stores/useUserStore";
import { useAddressStore } from "../stores/useAddressStore";
import LoadingSpinner from "../components/LoadingSpinner";
import { loadStripe } from "@stripe/stripe-js";
import { ShoppingCart, CreditCard, Loader } from "lucide-react";
import { useCartStore } from "../stores/useCartStore";
import axios from "../lib/axios";
import toast from "react-hot-toast";
import AddressSelectionModal from "../components/AddressSelectionModal";

const stripePromise = loadStripe(
  "pk_test_51RCbq8QQS5dYukip8w5f6jioCO89ij7uxQDBTgQbtroyVdsp3tTcSAaIMwXKBjDcCXuwjqxjTMvlJociOALT0FEq00uhbHN90f"
);

const ProductDetail = () => {
  const { productId } = useParams();
  const { product, fetchProductById, loading, error } = useProductStore();
  const { user, checkingAuth } = useUserStore();
  const navigate = useNavigate();
  const { addToCart, cart, coupon, isCouponApplied } = useCartStore();
  const { addresses, getAllAddresses } = useAddressStore();
  const [isDisabled, setIsDisabled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  useEffect(() => {
    if (productId) {
      fetchProductById(productId);
    }
  }, [productId]);

  useEffect(() => {
    if (user) {
      getAllAddresses();
    }
  }, [user]);

  useEffect(() => {
    if (addresses.length === 1) {
      setSelectedAddress(addresses[0]);
    }
  }, [addresses]);

  if ((!product && loading) || checkingAuth) return <LoadingSpinner />;
  if (error)
    return <p className="text-red-500 text-center font-semibold">{error}</p>;

  const handleAddToCart = () => {
    if (!user) {
      toast.error("You need to log in to add items to the cart.");
      return;
    }
    addToCart(product);
  };

  const handleBuyNow = async () => {
    setIsDisabled(true);

    if (!user) {
      toast.error("You need to log in to proceed with checkout.");
      setIsDisabled(false);
      return;
    }

    if (!selectedAddress && addresses.length === 1) {
      setSelectedAddress(addresses[0]);
      setIsDisabled(false);
      return;
    }

    if (addresses.length > 1 && !selectedAddress) {
      setIsModalOpen(true);
      return;
    }

    if (!selectedAddress) {
      toast.error("Please add an address in your profile before checkout.");
      setIsDisabled(false);
      return;
    }

    const deliveryCharge = user.premium ? 0 : 70;

    if (!user.premium) {
      toast.error("₹70 delivery charge applied. Become a premium user to get free delivery.");
    }

    const stripe = await stripePromise;
    try {
      const res = await axios.post("/payments/create-checkout-session", {
        products: product
          ? [{ ...product, quantity: 1 }]
          : cart.map((item) => ({ ...item, quantity: 1 })),
        couponCode: isCouponApplied && coupon ? coupon.code : null,
        address: JSON.stringify(selectedAddress),
        deliveryCharge,
      });

      const session = res.data;
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        console.error("Error:", result.error);
        toast.error("Payment failed. Please try again.");
        setIsDisabled(false);
      }
    } catch (error) {
      console.error("Error processing checkout:", error);
      toast.error("An error occurred while processing your payment.");
      setIsDisabled(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    setIsDisabled(false);
  };

  return (
    <>
      <div className="max-w-6xl mx-auto mt-20 p-4 sm:p-6 bg-transparent shadow-lg rounded-lg flex flex-col md:flex-row gap-6 md:gap-8 relative z-10 pb-20">
        <button
          className="absolute top-4 left-4 px-5 py-2 border bg-[#A31621] text-white font-semibold rounded-xl transition duration-300 shadow-lg z-20"
          onClick={() => navigate(-1)}
        >
          &larr;
        </button>
        <div className="w-full md:w-2/5 mt-12 md:mt-0 relative">
          <img
            src={product?.image}
            alt={product?.name}
            className="w-full h-80 sm:h-96 object-cover rounded-lg"
          />
        </div>
        <div className="w-full md:w-3/5">
          <h2 className="text-2xl lg:text-4xl xl:text-4xl md:text-3xl sm:text-2xl font-extrabold text-[#A31621] mb-4 leading-tight">
            {product?.name}
          </h2>
          <p className="text-3xl font-bold text-gray-800 mt-1">
            Rs.{product?.price}
          </p>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed">
            {product?.description}
          </p>

          <div className="mt-6 border-t pt-4">
            <h3 className="text-xl font-semibold">Shipping Information</h3>
            <ul className="list-disc pl-6 text-gray-600">
              <li>
                We dispatch all products within 24-48 hours of placing the order.
              </li>
              <li>We ensure the best courier services for your orders.</li>
              <li>Proper packaging prevents in-transit damages.</li>
            </ul>
          </div>

          <div className="mt-6 border-t pt-4">
            <h3 className="text-xl font-semibold">Manufacturing Details</h3>
            <p className="text-gray-600">Manufactured and Marketed By:</p>
            <p className="text-gray-600 font-semibold">
              CookiesMan Private Limited
            </p>
            <p className="text-gray-600">123, Sweet Treats Avenue</p>
            <p className="text-gray-600">Baking City - 400001, Dessert Land</p>
            <p className="text-gray-600">Country of Origin: Cookie Kingdom</p>
          </div>

          {/* Premium Suggestion CTA */}
          {user && !user.premium && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md my-4">
              <p className="font-medium">
                You're not a premium member yet. Delivery charges of ₹70 apply.
              </p>
              <p>
                <span>Want free delivery and exclusive deals? </span>
                <button
                  onClick={() => navigate("/premium")}
                  className="text-[#A31621] underline font-semibold hover:text-red-800 transition duration-200"
                >
                  Become a Premium Member
                </button>
              </p>
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <button
              className="flex-1 px-6 py-3 border border-[#A31621] text-[#A31621] font-semibold rounded-lg hover:bg-[#A31621] hover:text-white transition duration-300"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="inline-block mr-2" /> Add to Cart
            </button>
            <button
              className="flex-1 px-6 py-3 border border-[#A31621] text-[#A31621] font-semibold rounded-lg hover:bg-[#A31621] hover:text-white transition duration-300"
              disabled={isDisabled}
              onClick={handleBuyNow}
            >
              {isDisabled && user ? (
                <>
                  <Loader className="inline-block mr-2 animate-spin" /> Buying...
                </>
              ) : (
                <>
                  <CreditCard className="inline-block mr-2" /> Buy Now
                </>
              )}
            </button>
          </div>
        </div>

        {isModalOpen && (
          <AddressSelectionModal
            addresses={addresses}
            onClose={handleModalCancel}
            onSelect={(address) => {
              setSelectedAddress(address);
              setIsModalOpen(false);
              handleBuyNow();
            }}
          />
        )}
      </div>
    </>
  );
};

export default ProductDetail;
