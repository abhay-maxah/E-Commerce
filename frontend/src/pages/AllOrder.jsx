import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useOrderStore } from "../stores/useOrderStore";
import { useUserStore } from "../stores/useUserStore";
import { toast } from "react-hot-toast";
import { Download, Mail } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";

const AllOrder = () => {
  const {
    orders,
    fetchOrdersForUser,
    downloadInvoice,
    emailInvoice,
  } = useOrderStore();

  const { user, checkingAuth } = useUserStore();

  const [pageLoading, setPageLoading] = useState(true);
  const [loadingOrderId, setLoadingOrderId] = useState(null);
  const [emailingOrderId, setEmailingOrderId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!checkingAuth) {
        if (user) {
          await fetchOrdersForUser(user._id);
        } else {
          toast.error("Please log in to view your orders.");
        }
        setPageLoading(false);
      }
    };

    fetchOrders();
  }, [fetchOrdersForUser, checkingAuth, user]);

  if (pageLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-[#fcf7f8] flex flex-col items-center px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto py-16 mt-16 w-full max-w-6xl">
        <motion.h1
          className="text-2xl sm:text-4xl font-bold mb-8 text-[#A31621] text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Order History
        </motion.h1>

        {orders.length > 0 ? (
          <motion.div
            className="bg-white shadow-lg rounded-lg overflow-hidden w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-300">
                <thead className="bg-[#A31621]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-white uppercase">Sr No</th>
                    <th className="px-4 py-3 text-center text-xs sm:text-sm font-medium text-white uppercase">Products</th>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-white uppercase">Total Quantity</th>
                    {/* Updated column header */}
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-white uppercase">Order Total</th>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-white uppercase">Status</th>
                    <th className="px-4 py-3 text-center text-xs sm:text-sm font-medium text-white uppercase">Invoice</th>
                  </tr>
                </thead>
                <tbody className="bg-[#fcf7f8] divide-y divide-gray-300">
                  {orders.map((order, index) => {
                    const productNames = order.products
                      .map((p) => p.product?.name || "N/A")
                      .join(", ");
                    const totalQuantity = order.products.reduce(
                      (sum, p) => sum + p.quantity,
                      0
                    );
                    // const totalPrice = order.products.reduce( // This line is no longer needed for display
                    //   (sum, p) => sum + p.price * p.quantity,
                    //   0
                    // );
                    return (
                      <tr key={order._id} className="hover:bg-red-50 transition">
                        <td className="px-4 py-4 text-gray-700 font-semibold">{index + 1}</td>
                        <td className="px-4 py-4 text-[#A31621] font-semibold break-words max-w-xs">{productNames}</td>
                        <td className="px-4 py-4 text-gray-700">{totalQuantity}</td>
                        {/* Displaying order.totalAmount directly */}
                        <td className="px-4 py-4 text-gray-700">Rs.{order.totalAmount.toFixed(2)}</td>
                        <td className="px-4 py-4 text-[#A31621] font-semibold">{order.orderStatus}</td>
                        <td className="px-4 py-4">
                          <div className="flex justify-center items-center flex-col sm:flex-row gap-2">
                            <button
                              onClick={async () => {
                                setLoadingOrderId(order._id);
                                await downloadInvoice(order._id);
                                setLoadingOrderId(null);
                              }}
                              disabled={loadingOrderId === order._id}
                              className="flex items-center gap-2 px-3 py-1 rounded-md font-medium bg-[#A31621] hover:bg-red-700 text-white transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Download className="h-4 w-4" />
                              {loadingOrderId === order._id ? "Downloading..." : "Get Invoice"}
                            </button>

                            <button
                              onClick={async () => {
                                setEmailingOrderId(order._id);
                                await emailInvoice(order._id);
                                setEmailingOrderId(null);
                              }}
                              disabled={emailingOrderId === order._id}
                              className="flex items-center gap-2 px-3 py-1 rounded-md font-medium bg-[#A31621] hover:bg-red-700 text-white transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Mail className="h-4 w-4" />
                              {emailingOrderId === order._id ? "Sending..." : "Email"}
                            </button>

                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="flex flex-col items-center justify-center text-center py-10 bg-white rounded-lg shadow-md w-full max-w-lg mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-lg text-gray-600 font-medium">No orders found.</p>
            <p className="text-sm text-gray-500">
              It looks like you haven’t placed any orders yet.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AllOrder;