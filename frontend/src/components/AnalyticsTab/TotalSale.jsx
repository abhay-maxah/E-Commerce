import { useEffect } from "react";
import { motion } from "framer-motion";
import { useOrderStore } from "../../stores/useOrderStore";
import LoadingSpinner from "../LoadingSpinner";

const TotalSale = () => {
    const { orders = [], fetchOrdersForAdmin, loading, updateStatus } = useOrderStore();

    useEffect(() => {
        fetchOrdersForAdmin();
    }, [fetchOrdersForAdmin]);

    const handleStatusChange = async (orderId, newStatus) => {
        await updateStatus(orderId, newStatus);
        fetchOrdersForAdmin();
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className='min-h-screen bg-[#fcf7f8] flex flex-col items-center'>
            <div className='container mx-auto px-4 py-6 mt-6 bg-white shadow-lg rounded-lg border border-[#A31621]'>
                <motion.h2
                    className='text-xl font-semibold text-[#A31621] text-center py-3'
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    Total sale
                </motion.h2>

                <motion.div
                    className='shadow-lg rounded-lg overflow-hidden'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <table className='min-w-full divide-y divide-[#A31621]'>
                        <thead className='bg-[#A31621]'>
                            <tr>
                                <th className='px-6 py-3 text-left text-xs font-medium text-white uppercase'>Sr No</th>
                                <th className='px-6 py-3 text-left text-xs font-medium text-white uppercase'>Customer</th>
                                <th className='px-6 py-3 text-left text-xs font-medium text-white uppercase'>Email</th>
                                <th className='px-6 py-3 text-left text-xs font-medium text-white uppercase'>Products</th>
                                <th className='px-6 py-3 text-left text-xs font-medium text-white uppercase'>Total</th>
                                <th className='px-6 py-3 text-left text-xs font-medium text-white uppercase'>Status</th>
                            </tr>
                        </thead>
                        <tbody className='bg-[#fcf7f8] divide-y divide-[#A31621]'>
                            {orders.map((order, index) => (
                                <tr key={order._id} className='hover:bg-red-50'>
                                    <td className='px-6 py-4 text-gray-700 font-semibold'>{index + 1}</td>
                                    <td className='px-6 py-4 whitespace-nowrap text-gray-700'>{order.user?.name || "N/A"}</td>
                                    <td className='px-6 py-4 whitespace-nowrap text-gray-700'>{order.user?.email || "N/A"}</td>
                                    <td className='px-6 py-4 whitespace-nowrap text-gray-700'>
                                        {order.products.map((item) => item.product?.name || "N/A").join(", ")}
                                    </td>
                                    <td className='px-6 py-4 whitespace-nowrap text-gray-700'>Rs.{order.totalAmount.toFixed(2)}</td>
                                    <td className='px-6 py-4 whitespace-nowrap'>
                                        <select
                                            value={order.orderStatus}
                                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                            className='px-2 py-1 rounded-md text-white bg-[#A31621]'
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Processing">Processing</option>
                                            <option value="Shipped">Shipped</option>
                                            <option value="Delivered">Delivered</option>
                                            <option value="Canceled">Canceled</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </motion.div>
            </div>
        </div>
    );
};

export default TotalSale;