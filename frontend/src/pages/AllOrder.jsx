import { useEffect } from "react";
import { motion } from "framer-motion";
import { useOrderStore } from "../stores/useOrderStore";
import { useUserStore } from "../stores/useUserStore";
import { toast } from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

const AllOrder = () => {
  const { orders, loading, fetchOrdersForUser, downloadInvoice } =
    useOrderStore();
  const { user, checkingAuth } = useUserStore();

  useEffect(() => {
    if (!checkingAuth) {
      if (user) {
        fetchOrdersForUser(user._id);
      } else {
        toast.error("Please log in to view your orders.");
      }
    }
  }, [fetchOrdersForUser, checkingAuth, user]);

  if (loading) return <LoadingSpinner />;

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
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-white uppercase">
                      Sr No
                    </th>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-white uppercase">
                      Products
                    </th>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-white uppercase">
                      Total Quantity
                    </th>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-white uppercase">
                      Total Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-white uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-white uppercase">
                      Invoice
                    </th>
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
                    const totalPrice = order.products.reduce(
                      (sum, p) => sum + p.price * p.quantity,
                      0
                    );

                    return (
                      <tr
                        key={order._id}
                        className="hover:bg-red-100 transition"
                      >
                        <td className="px-4 py-4 text-gray-700 font-semibold">
                          {index + 1}
                        </td>
                        <td className="px-4 py-4 text-[#A31621] font-semibold break-words max-w-xs">
                          {productNames}
                        </td>
                        <td className="px-4 py-4 text-gray-700">
                          {totalQuantity}
                        </td>
                        <td className="px-4 py-4 text-gray-700">
                          Rs.{totalPrice.toFixed(2)}
                        </td>
                        <td className="px-4 py-4 text-[#A31621] font-semibold">
                          {order.orderStatus}
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => downloadInvoice(order._id)}
                            className="bg-[#A31621] hover:bg-red-700 text-white px-3 py-1 rounded-md font-medium transition duration-300 ease-in-out"
                          >
                            Download
                          </button>
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
            <p className="text-lg text-gray-600 font-medium">
              No orders found.
            </p>
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
