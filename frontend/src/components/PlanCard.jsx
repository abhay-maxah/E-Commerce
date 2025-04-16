import { useState } from "react";
import axiosInstance from "../lib/axios.js"; // Import the axiosInstance

const PlanCard = () => {
  const [isLoading, setIsLoading] = useState(false); // State to manage the loading status
  const [errorMessage, setErrorMessage] = useState(""); // State to manage error messages

  // Function to handle upgrade to Premium
  const handleUpgradeClick = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post("/payments/create-yearly-premium-session");
      if (response.status === 200) {
        window.location.href = response.data.url; // Redirect to Stripe Checkout
      }
    } catch (error) {
      console.error("Error during upgrade:", error);
      setErrorMessage("Failed to initiate the upgrade, please try again.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl w-full">

        {/* Basic / Free Plan */}
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 border-2 border-[#A31621] relative">
          <span className="absolute top-3 right-3 bg-[#A31621] text-white text-xs font-semibold px-3 py-1 rounded-full">
            Current Plan
          </span>
          <h2 className="text-2xl font-bold text-[#A31621] mb-2">Basic</h2>
          <p className="text-gray-700 mb-4">Perfect for casual shoppers and cookie lovers.</p>
          <ul className="text-gray-800 mb-6 space-y-2 text-sm md:text-base">
            <li>✔ Standard delivery (4-7 days)</li>
            <li>✔ Access to regular products</li>
            <li>✔ No exclusive discounts</li>
            <li>✔ Delivery charges apply</li>
            <li>✔ Basic support via email</li>
          </ul>
          <button className="bg-[#A31621] text-white px-6 py-2 rounded-lg cursor-not-allowed opacity-70">
            Activated
          </button>
        </div>

        {/* Premium Plan */}
        <div className="bg-[#A31621] rounded-2xl shadow-md p-6 md:p-8 text-white border-2 border-[#A31621]">
          <h2 className="text-2xl font-bold mb-2">Premium</h2>
          <p className="text-white/90 mb-4">Unlock the full CookiesMan experience!</p>
          <ul className="mb-6 space-y-2 text-sm md:text-base">
            <li>✔ Express delivery (1-2 days)</li>
            <li>✔ Free delivery on all orders</li>
            <li>✔ Access to exclusive & limited-edition cookies</li>
            <li>✔ Premium-only discounts & deals</li>
            <li>✔ Early access to new product launches</li>
            <li>✔ Priority customer support</li>
          </ul>
          <div className="text-3xl font-semibold mb-4">₹250 <span className="text-lg font-medium">/ year</span></div>
          <button
            onClick={handleUpgradeClick}
            disabled={isLoading} // Disable the button if loading
            className={`bg-white text-[#A31621] px-6 py-2 rounded-lg ${isLoading ? 'cursor-not-allowed opacity-70' : 'hover:bg-red-100'} transition font-medium`}
          >
            {isLoading ? "Upgrading..." : "Upgrade Now"} {/* Button text changes based on loading */}
          </button>
          {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>} {/* Display error if any */}
        </div>

      </div>
    </div>
  );
};

export default PlanCard;
