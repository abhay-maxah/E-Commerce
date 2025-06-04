import { useEffect } from "react";
import { motion } from "framer-motion";
import { useOrderStore } from "../../stores/useOrderStore";
import LoadingSpinner from "../LoadingSpinner";

const TotalSale = () => {
  const {
    orders = [],
    fetchOrdersForAdmin,
    loading,
    updateStatus,
  } = useOrderStore();

  useEffect(() => {
    fetchOrdersForAdmin();
  }, [fetchOrdersForAdmin]);

  const handleStatusChange = async (orderId, newStatus) => {
    await updateStatus(orderId, newStatus);
    // Optimistically update order status locally
    useOrderStore.setState((state) => ({
      orders: state.orders.map((order) =>
        order._id === orderId ? { ...order, orderStatus: newStatus } : order
      ),
    }));
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-[#fcf7f8] flex flex-col items-center">
      <div className="container mx-auto px-4 py-6 mt-6 shadow-lg rounded-lg border border-[#A31621]">
        <motion.h2
          className="text-xl font-semibold text-[#A31621] text-center py-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Total Sale
        </motion.h2>

        {/* Responsive Table Wrapper */}
        <motion.div
          className={"shadow-lg rounded-lg w-full "}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <table className="w-full min-w-[800px] divide-y divide-[#A31621]">
            <thead className="bg-[#A31621] text-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Sr.No</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Products</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-[#fcf7f8] divide-y divide-[#A31621]">
              {orders.length > 0 ? (
                orders.map((order, index) => (
                  <tr key={order._id} className="hover:bg-red-50">
                    <td className="px-6 py-4 text-gray-700 font-semibold">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {order.user?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {order.user?.email || "N/A"}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-gray-700 truncate max-w-[480px]"
                      title={order.products
                        .map((item) => item.product?.name || "N/A")
                        .join(", ")}
                    >
                      {order.products
                        .map((item) => item.product?.name || "N/A")
                        .join(", ")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      Rs.{order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.orderStatus}
                        onChange={(e) =>
                          handleStatusChange(order._id, e.target.value)
                        }
                        className="px-2 py-1 rounded-md bg-transparent w-full sm:w-auto"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Canceled">Canceled</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </motion.div>
      </div>
    </div>
  );
};

export default TotalSale;