import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Trash2, Edit, Plus, X, AlertTriangle, Star } from "lucide-react"; // Import Star icon for premium symbol
import { useUserStore } from "../stores/useUserStore";
import { useAddressStore } from "../stores/useAddressStore";
import AddressForm from "./AddressForm";
import LoadingSpinner from "../components/LoadingSpinner";
import { toast } from "react-hot-toast";

const UserProfile = () => {
  const { user, checkAuth, deleteUser, logout } = useUserStore();
  const { addresses, getAllAddresses, togelVisiblity, loading } = useAddressStore();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // for account closer

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        await checkAuth();
      }
      await getAllAddresses();
      setIsUserLoading(false);
    };
    fetchData();
  }, []);

  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.split(" ");
    return parts[0]?.charAt(0).toUpperCase() + (parts[1]?.charAt(0).toUpperCase() || "");
  };

  const handleCloseModal = async () => {
    setIsEditing(false);
    setSelectedAddress(null);
    await getAllAddresses();
  };

  const handleDeleteAccount = async () => {
    try {
      if (!user?._id) {
        toast.error("User not found");
        return;
      }

      const response = await deleteUser(user._id); // Should return a success/failure status

      if (response?.status === 200) {
        await logout(); // Clear the user session/token
        navigate("/login"); // Redirect to login
        toast.success("Account deleted successfully");
      } else {
        toast.error("Failed to delete account");
      }
    } catch (error) {
      console.error("Account deletion failed:", error);
      toast.error("Something went wrong while deleting account");
    } finally {
      setShowDeleteModal(false); // Close modal in all cases
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <motion.div
      className="flex justify-center items-center min-h-screen px-4 mt-10"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-3xl p-6 bg-white shadow-md rounded-md border">
        <h1 className="text-4xl font-bold text-[#A31621] text-center mb-6">My Profile</h1>

        <div className="flex flex-col md:flex-row items-center gap-6">
          {user?.image ? (
            <img
              src={user.image}
              alt={`${user.name}'s profile picture`}
              className="w-32 h-32 rounded-full object-cover border-4 border-[#A31621]"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-32 h-32 flex items-center justify-center bg-[#A31621] text-white text-3xl font-bold rounded-full">
              {getInitials(user?.name)}
            </div>
          )}

          <div className="flex-1">
            <div className="text-gray-700 space-y-3">
              <div>
                <h2 className="text-lg font-semibold">Name: {user?.name}</h2>
              </div>
              <div>
                <p className="text-gray-600">Role: {user?.role}</p>
              </div>
              {/* Display Prime Account if the user is premium */}
              {user?.premium && (
                <div className="flex items-center text-red-500">
                  <Star size={18} className="mr-2" /> {/* Show a star icon */}
                  <span className="font-semibold"> CookiesMan Plus Account</span>
                </div>
              )}
              <div className="border-t pt-4 mt-4 space-y-2">
                <div>
                  <span className="font-semibold">Email:</span> {user?.email}
                </div>
                <div>
                  <span className="font-semibold">Phone:</span>{" "}
                  {addresses[0]?.phoneNumber || "N/A"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-[#A31621]">Addresses</h2>
          {loading ? (
            <p className="text-gray-500">Fetching addresses...</p>
          ) : addresses.length > 0 ? (
            <ul className="mt-2 space-y-4">
              {addresses.map((address, index) => (
                <motion.li
                  key={index}
                  className="flex justify-between items-center p-3 border rounded-md shadow-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold">
                      {address.houseName}, {address.optionalAddress}
                    </p>
                    <p>
                      {address.streetAddress}, {address.city}, {address.state} - {address.zipCode}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => {
                        setSelectedAddress(address);
                        setIsEditing(true);
                      }}
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={async () => {
                        await togelVisiblity(address._id);
                        getAllAddresses();
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No addresses found.</p>
          )}
        </div>

        <motion.button
          className="w-full flex items-center justify-center mt-6 py-2 bg-[#A31621] text-white font-medium rounded-md hover:bg-[#870f19] transition duration-150"
          onClick={() => navigate("/address")}
          whileHover={{ scale: 1.05 }}
        >
          <Plus size={18} className="mr-2" /> Add Address
        </motion.button>

        {/* Account Closer Button */}
        <motion.button
          className="w-full flex items-center justify-center mt-4 border  py-2 px-4 border-[#A31621] hover:bg-[#A31621] hover:text-white rounded-md text-sm font-medium transition"
          onClick={() => setShowDeleteModal(true)}
          whileHover={{ scale: 1.05 }}
        >
          <AlertTriangle className="mr-2" size={18} /> Account Closer
        </motion.button>
      </div>

      {/* Edit Address Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-40">
          <div className="relative bg-white w-full max-w-lg p-6 rounded-lg shadow-lg">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              onClick={handleCloseModal}
            >
              <X size={20} />
            </button>
            <AddressForm existingAddress={selectedAddress} closeModal={handleCloseModal} />
          </div>
        </div>
      )}

      {/* Account Closer Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="relative bg-white w-full max-w-lg p-6 rounded-lg shadow-lg">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              onClick={() => setShowDeleteModal(false)}
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-semibold text-red-600 mb-4">Delete Account</h2>
            <p className="text-gray-700 mb-4">
              By closing your account, all your personal information, saved addresses,
              preferences, and order history will be permanently deleted from our system.
              This action is irreversible, and you won’t be able to recover your data once
              the account is deleted. Please make sure you’ve downloaded any necessary
              information before proceeding. By clicking the delete button, you agree to
              our terms of service and confirm that you understand the consequences.
            </p>
            <button
              onClick={handleDeleteAccount}
              className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default UserProfile;
