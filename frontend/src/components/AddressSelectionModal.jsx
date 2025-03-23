import {motion} from "framer-motion";
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
                  <p className="text-sm text-gray-600">{address.streetAddress}, {address.city}</p>
                  <p className="text-sm text-gray-600">{address.state}, {address.zipCode}</p>
                  <p className="text-sm text-gray-600">{address.country}</p>
                  <p className="text-sm text-gray-600">Phone: {address.phoneNumber}</p>
                </div>
                <span className="text-sm font-semibold">Select</span>
              </div>
            ))}
          </div>
          <button
            className="mt-4 w-full rounded-lg bg-red-600 py-2 text-white hover:bg-red-700"
            onClick={onClose}
          >
            Cancel
          </button>
        </motion.div>
      </div>
    );
  };
  
  export default AddressSelectionModal;
  