import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Crown, Trash, X } from "lucide-react";
import { useUserStore } from "../../stores/useUserStore";

const UserList = () => {
    const { users = [], getAllUsers, deleteUser } = useUserStore();
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            await getAllUsers();
            setLoading(false);
        };
        fetchUsers();
    }, [getAllUsers]);

    const handleDelete = async (userId) => {
        try {
            await deleteUser(userId);
            await getAllUsers();
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    const openUserModal = (user) => setSelectedUser(user);
    const closeUserModal = () => setSelectedUser(null);

    return (
        <div className='min-h-screen bg-[#fcf7f8] flex flex-col items-center'>
            <div className='container mx-auto px-4 py-6 mt-6 bg-white shadow-lg rounded-lg border border-[#A31621]'>
                <motion.h2
                    className='text-xl font-semibold text-[#A31621] text-center py-3'
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    Users List
                </motion.h2>

                <motion.div
                    className='shadow-lg rounded-lg overflow-hidden'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="overflow-x-auto">
                        {loading ? (
                            <p className="text-center py-4 text-[#A31621]">Loading...</p>
                        ) : users.length > 0 ? (
                            <table className="min-w-full divide-y divide-[#A31621]">
                                <thead className="bg-[#A31621] text-white">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Sr No</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-[#fcf7f8] divide-y divide-[#A31621]">
                                    {users.map((u, index) => (
                                        <tr
                                            key={u._id}
                                            className="hover:bg-red-50 cursor-pointer"
                                            onClick={() => openUserModal(u)}
                                        >
                                            <td className="px-6 py-4 text-gray-700 font-semibold">{index + 1}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-700 flex items-center gap-2">
                                                {u.name}
                                                {u.premium && <Crown className="w-4 h-4 text-yellow-500" />}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-700">{u.email}</td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(u._id);
                                                    }}
                                                    className="text-red-500 hover:text-[#A31621] transition duration-200"
                                                >
                                                    <Trash className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-center py-4 text-[#A31621] font-semibold">No users found</p>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Custom Modal (no external library) */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
                        <button
                            className="absolute top-3 right-3 text-gray-500 hover:text-red-600 transition"
                            onClick={closeUserModal}
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="text-lg font-bold text-[#A31621] mb-4">User Details</h3>
                        <div className="space-y-3 text-gray-700">
                            <p className="flex items-center gap-2">
                                <strong>Name:</strong> {selectedUser.name}
                                {selectedUser.premium && <Crown className="w-4 h-4 text-yellow-500" />}
                            </p>
                            <p><strong>Email:</strong> {selectedUser.email}</p>
                            <p><strong>Role:</strong> {selectedUser.role}</p>
                            <p><strong>Created At:</strong> {new Date(selectedUser.createdAt).toLocaleString()}</p>
                            <p className="font-semibold mt-4">Cart Items:</p>
                            {selectedUser.cartItems?.length > 0 ? (
                                <div className="mt-2 space-y-3 max-h-60 overflow-y-auto pr-1">
                                    {selectedUser.cartItems.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="border border-gray-300 rounded-lg p-3 bg-gray-50 shadow-sm text-sm"
                                        >
                                            <div className="mb-1">
                                                <span className="font-semibold text-gray-800">Product ID:</span>{" "}
                                                {item.product}
                                            </div>
                                            <div className="flex flex-wrap gap-4">
                                                <div>
                                                    <span className="font-semibold text-gray-800">Weight:</span>{" "}
                                                    {item.selectedWeight}
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-gray-800">Price:</span>{" "}
                                                    ${item.selectedPrice}
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-gray-800">Qty:</span>{" "}
                                                    {item.quantity}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-600 mt-1">No items in cart.</p>
                            )}

                        </div>
                        <div className="mt-5 text-right">
                            <button
                                onClick={closeUserModal}
                                className="px-4 py-2 bg-[#A31621] text-white rounded hover:bg-red-700 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserList;
