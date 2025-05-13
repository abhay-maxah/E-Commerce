import { motion } from "framer-motion";

const AddressSelectionModal = ({ addresses, onClose, onSelect }) => {
  const handleSelect = (address) => {
    onSelect(address); // Pass selected address to OrderSummary
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <motion.div
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <h2 className="text-lg font-semibold">Select Delivery Address</h2>
        <div className="mt-4 space-y-2">
          {addresses.map((address, index) => (
            <div
              key={index}
              className="flex cursor-pointer items-center justify-between rounded-lg border p-3 hover:bg-gray-100"
              onClick={() => handleSelect(address)}
            >
              <div>
                <p className="font-medium">{address.houseName}</p>
                <p className="text-sm text-gray-600">
                  {address.streetAddress}, {address.city}
                </p>
                <p className="text-sm text-gray-600">
                  {address.state}, {address.zipCode}
                </p>
                <p className="text-sm text-gray-600">{address.country}</p>
                <p className="text-sm text-gray-600">
                  Phone: {address.phoneNumber}
                </p>
              </div>
              <span className="text-sm font-semibold text-[#A31621]">Select</span>
            </div>
          ))}
        </div>

        {/* Informational Message */}
        <p className="mt-4 text-sm text-gray-500 text-center">
          Want to deliver to a different address? Please add it from your{" "}
          <span className="text-[#A31621] font-medium">Profile</span>. Once added, it will appear here.
        </p>

        <button
          className="mt-4 w-full py-2 border border-[#A31621] text-[#A31621] font-semibold rounded-lg hover:bg-[#A31621] hover:text-white transition duration-300"
          onClick={onClose}
        >
          Cancel
        </button>
      </motion.div>
    </div>
  );
};

export default AddressSelectionModal;
