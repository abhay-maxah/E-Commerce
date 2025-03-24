import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trash } from "lucide-react";
import { useUserStore } from "../../stores/useUserStore";

const UserList = () => {
    const { users = [], getAllUsers, deleteUser } = useUserStore();
    const [loading, setLoading] = useState(true);

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
            await getAllUsers(); // Re-fetch users after deletion
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

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
                                        <tr key={u._id} className="hover:bg-red-50">
                                            <td className="px-6 py-4 text-gray-700 font-semibold">{index + 1}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-700">{u.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-700">{u.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleDelete(u._id)}
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
        </div>
    );
};

export default UserList;
