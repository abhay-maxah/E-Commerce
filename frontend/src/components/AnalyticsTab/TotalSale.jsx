import { useEffect, useState } from "react";
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

  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrdersForAdmin();
  }, [fetchOrdersForAdmin]);

  const handleStatusChange = async (orderId, newStatus) => {
    await updateStatus(orderId, newStatus);
    useOrderStore.setState((state) => ({
      orders: state.orders.map((order) =>
        order._id === orderId ? { ...order, orderStatus: newStatus } : order
      ),
    }));
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-[#fcf7f8] flex flex-col items-center">
      <div className="container mx-auto px-4 py-6 mt-6 rounded-2xl border-2 border-[#A31621] shadow-xl overflow-visible">
        <motion.h2
          className="text-xl font-semibold text-[#A31621] text-center py-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Total Sale
        </motion.h2>

        <motion.div
          className={"shadow-lg rounded-lg w-full "}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <table className="w-full min-w-[800px] divide-y divide-[#A31621]">
            <thead className="bg-[#A31621] text-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase rounded-tl-xl">Sr.No</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Products</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase rounded-tr-xl">Status</th>
              </tr>
            </thead>

            <tbody className="bg-[#fcf7f8] divide-y divide-[#A31621]">
              {orders.length > 0 ? (
                orders.map((order, index) => (
                  <tr
                    key={order._id}
                    className="hover:bg-red-50 cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-6 py-4 text-gray-700 font-semibold">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{order.user?.name || "N/A"}</td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-gray-700 truncate max-w-[480px]"
                      title={order.products.map((item) => item.product?.name || "N/A").join(", ")}
                    >
                      {(() => {
                        const productNames = order.products.map((item) => item.product?.name || "N/A");
                        const displayNames = productNames.slice(0, 2).join(", ");
                        const more = productNames.length > 2 ? "..." : "";
                        return `${displayNames}${more}`;
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">Rs.{order.totalAmount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.orderStatus}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
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

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-40  flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-2xl shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#A31621]">Order Details</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-[#A31621] font-bold text-2xl">×</button>
            </div>

            <div className="space-y-2 text-gray-700 text-sm">
              <p><strong>Customer:</strong> {selectedOrder.user?.name || "N/A"}</p>
              <p><strong>Email:</strong> {selectedOrder.user?.email || "N/A"}</p>
              <p><strong>Order ID:</strong> {selectedOrder._id}</p>
              <p><strong>Status:</strong> {selectedOrder.orderStatus}</p>
              <p><strong>Total Amount:</strong> Rs.{selectedOrder.totalAmount.toFixed(2)}</p>
              <p><strong>Delivery Charge:</strong> Rs.{selectedOrder.deliveryCharge}</p>
              <p><strong>Discount:</strong> Rs.{selectedOrder.discount}</p>
              <p><strong>Created At:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>

              <div>
                <strong>Products:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  {selectedOrder.products.map((item, idx) => (
                    <li key={idx}>
                      {item.product?.name || "N/A"} – Qty: {item.quantity} – {item.selectedWeight || "-"} – Rs.{item.price}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TotalSale;
