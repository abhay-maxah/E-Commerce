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
  const { addresses, getAllAddresses } = useAddressStore();
  const { addToCart, coupon, isCouponApplied } = useCartStore();
  const navigate = useNavigate();
  const [isDisabled, setIsDisabled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedPricing, setSelectedPricing] = useState(null);

  useEffect(() => {
    if (productId) fetchProductById(productId);
  }, [productId, fetchProductById]);

  useEffect(() => {
    if (user) getAllAddresses();
  }, [user, getAllAddresses]);

  useEffect(() => {
    // If only one address, select it by default
    if (addresses.length === 1) setSelectedAddress(addresses[0]);
    // If user has no addresses, ensure selectedAddress is null
    if (addresses.length === 0) setSelectedAddress(null);
  }, [addresses]);

  useEffect(() => {
    if (product?.images?.length) setSelectedImage(product.images[0]);
    if (product?.pricing?.length) setSelectedPricing(product.pricing[0]);
  }, [product]);

  const isChocolate = product?.category?.toLowerCase() === "chocolates";

  if ((!product && loading) || checkingAuth) return <LoadingSpinner />;
  if (error) return <p className="text-red-500 text-center font-semibold">{error}</p>;

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Login required to add to cart.");
      return;
    }
    if (!selectedPricing) {
      toast.error("Please select a weight/price option.");
      return;
    }

    const updatedProduct = {
      ...product, // Spread original product to include _id, name, images etc.
      selectedPrice: selectedPricing.price,
      selectedWeight: selectedPricing.weight,
      quantity: 1, // Default quantity for single add to cart
    };

    addToCart(updatedProduct, selectedPricing.price, selectedPricing.weight);
  };


  const handleBuyNow = async () => {
    setIsDisabled(true); // Disable button immediately

    if (!user) {
      toast.error("Login to proceed.");
      setIsDisabled(false);
      return;
    }

    if (!selectedPricing) { // Ensure a pricing option is selected for "Buy Now"
      toast.error("Please select a weight/price option before buying.");
      setIsDisabled(false);
      return;
    }

    if (!addresses || addresses.length === 0) {
      toast.error("Please add an address in your profile before proceeding.");
      setIsDisabled(false);
      return;
    }

    if (addresses.length > 1 && !selectedAddress) {
      setIsModalOpen(true);
      return; // Open modal, processBuyNowOrder will be called from modal's onSelect
    }

    const addressToUse = selectedAddress || addresses[0];

    try {
      await processBuyNowOrder(addressToUse);
    } catch (checkoutError) { // Changed variable name to avoid shadowing
      console.error("Buy Now checkout initiation error:", checkoutError);
      toast.error(
        "There was an issue initiating your order. Please try again or contact support."
      );
    } finally {
      if (!isModalOpen) { // Only re-enable if modal isn't pending selection
        setIsDisabled(false);
      }
    }
  };

  const processBuyNowOrder = async (addressToUse) => {
    if (!addressToUse) {
      toast.error("No address selected. Please select an address.");
      setIsDisabled(false);
      return;
    }

    const deliveryCharge = user?.premium ? 0 : 70;
    if (!user?.premium) {
      toast("₹70 delivery applies. Upgrade to Premium for free delivery.", { icon: '🚚' });
    }

    const stripe = await stripePromise;
    if (!stripe) {
      toast.error("Stripe could not be loaded. Please try again.");
      setIsDisabled(false);
      return;
    }

    try {
      const successUrl = `${window.location.origin}/purchase-success?session_id={CHECKOUT_SESSION_ID}&source=product_detail`;
      const cancelUrl = `${window.location.origin}/purchase-cancel`;

      const productsForBackend = [
        {
          product: product._id,
          name: product.name,
          image: product.images[0],
          selectedPrice: selectedPricing.price,
          selectedWeight: selectedPricing.weight,
          quantity: 1,
          ...(product.description && product.description.trim() !== '' && {
            description: product.description
          }),
        },
      ];

      const res = await axios.post("/payments/create-checkout-session", {
        products: productsForBackend,
        couponCode: isCouponApplied && coupon ? coupon.code : null,
        address: addressToUse._id,
        deliveryCharge: Math.round(deliveryCharge), // Ensure delivery charge is an integer
        success_url: successUrl, // Pass the success URL to backend
        cancel_url: cancelUrl,   // Pass the cancel URL to backend
      });

      const session = res.data;
      if (!session.id) {
        throw new Error("Stripe session ID is missing from response. Backend issue?");
      }

      const result = await stripe.redirectToCheckout({ sessionId: session.id });
      if (result.error) {
        console.error("❌ Stripe Checkout Redirection Error:", result.error.message || result.error);
        toast.error("Payment failed. Please try again.");
      }
      // No clearCart() call here; it will be handled by PurchaseSuccessPage
    } catch (error) {
      console.error("❌ Buy Now Payment processing failed:", error.response?.data || error.message || error);
      const errorMessage = error.response?.data?.error || error.message || "Please try again.";
      toast.error(`Payment error: ${errorMessage}`);
    } finally {
      setIsDisabled(false);
      setIsModalOpen(false); // Close modal if open after attempt
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setIsDisabled(false); // Re-enable button if modal is closed without selection
  };

  return (
    <div className="max-w-6xl mx-auto mt-20 p-4 sm:p-6 bg-transparent shadow-lg rounded-lg flex flex-col md:flex-row gap-8 relative pb-20">
      {/* Back Button */}
      <button
        className="absolute top-4 left-4 px-3 py-2 bg-[#A31621] text-white rounded-lg font-semibold z-50"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      {/* Left: Images */}
      <div className="flex gap-4 w-full md:w-2/5 mt-12 md:mt-0">
        <div className="flex flex-col gap-2 overflow-y-auto max-h-96">
          {product?.images?.map((img, idx) => (
            <img
              key={idx}
              src={img}
              onClick={() => setSelectedImage(img)}
              className={`w-20 h-20 object-cover rounded-md cursor-pointer border-2 ${selectedImage === img ? "border-[#A31621]" : "border-gray-300"
                }`}
              alt={`Product thumbnail ${idx + 1}`}
            />
          ))}
        </div>
        <div className="flex-1">
          {selectedImage && (
            <img
              src={selectedImage}
              className="w-full h-96 object-cover rounded-lg shadow-md"
              alt="Selected Product"
            />
          )}
        </div>
      </div>

      {/* Right: Details */}
      <div className="w-full md:w-3/5">
        <h2 className="text-3xl font-extrabold text-[#A31621] mb-3">
          {product?.name}
        </h2>

        {!isChocolate && (
          <div className="mb-4">
            <p className="text-gray-700 text-lg mb-2">Select Weight:</p>
            <div className="flex flex-wrap gap-3">
              {product?.pricing?.map((item) => (
                <button
                  key={item._id}
                  onClick={() => setSelectedPricing(item)}
                  className={`px-4 py-2 rounded-full border font-medium ${selectedPricing?._id === item._id
                    ? "bg-[#A31621] text-white border-[#A31621]"
                    : "bg-white text-[#A31621] border-[#A31621]"
                    }`}
                >
                  {item.weight}
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="text-2xl font-bold text-gray-900 mt-3">
          ₹{selectedPricing?.price}
        </p>

        <p className="mt-4 text-lg text-gray-600 leading-relaxed">
          {product?.description}
        </p>

        <div className="mt-6 border-t pt-4">
          <h3 className="text-xl font-semibold">Shipping Information</h3>
          <ul className="list-disc pl-6 text-gray-600 space-y-1">
            <li>{user?.premium ? "Shipping in 2-3 days" : "Shipping in 4-5 days"}</li>
            <li>Dispatched within 24–48 hours.</li>
            <li>Secure & hygienic packaging.</li>
            <li>Tracking info will be provided.</li>
            <li>Ships via top courier partners.</li>
            <li>COD available at select locations.</li>
          </ul>
        </div>

        <div className="mt-6 border-t pt-4">
          <h3 className="text-xl font-semibold">Manufacturing Details</h3>
          <p className="text-gray-600">Manufactured by:</p>
          <p className="font-semibold text-gray-700">CookiesMan Pvt. Ltd.</p>
          <p className="text-gray-600">123, Sweet Treats Avenue</p>
          <p className="text-gray-600">Baking City, Dessert Land</p>
          <p className="text-gray-600">Origin: Cookie Kingdom</p>
        </div>

        {user && !user.premium && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md my-4">
            <p className="font-medium">
              You're not a premium member. Delivery charges of ₹70 apply.
            </p>
            <p>
              Want free delivery?{" "}
              <button
                onClick={() => navigate("/premium")}
                className="text-[#A31621] underline font-semibold hover:text-red-800"
              >
                Become a Premium Member
              </button>
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <button
            className="flex-1 px-6 py-3 border border-[#A31621] text-[#A31621] font-semibold rounded-lg hover:bg-[#A31621] hover:text-white transition"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="inline-block mr-2" /> Add to Cart
          </button>
          <button
            className="flex-1 px-6 py-3 border border-[#A31621] text-[#A31621] font-semibold rounded-lg hover:bg-[#A31621] hover:text-white transition"
            onClick={handleBuyNow}
            disabled={isDisabled}
          >
            {isDisabled ? (
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

      {/* Address Modal */}
      {isModalOpen && (
        <AddressSelectionModal
          addresses={addresses}
          onClose={handleModalClose}
          onSelect={(address) => {
            setSelectedAddress(address);
            setIsModalOpen(false);
            processBuyNowOrder(address);
          }}
        />
      )}
    </div>
  );
};

export default ProductDetail;