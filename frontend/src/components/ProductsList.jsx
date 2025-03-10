import { motion } from "framer-motion";
import { Trash, Star } from "lucide-react";
import { useProductStore } from "../stores/useProductStore";

const ProductsList = () => {
  const { deleteProduct, toggleFeaturedProduct, products } = useProductStore();
  return (
    <motion.div
      className="bg-transparent border border-[#A31621] text-[#A31621] shadow-lg rounded-lg overflow-hidden max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <table className=" min-w-full divide-y ">
        <thead className="bg-transprent">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-[#A31621] uppercase tracking-wider"
            >
              Product
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-[#A31621] uppercase tracking-wider"
            >
              Price
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-[#A31621] uppercase tracking-wider"
            >
              Category
            </th>

            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-[#A31621] uppercase tracking-wider"
            >
              Featured
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-[#A31621] uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="bg-transparent divide-y border border-[#A31621]">
          {products?.map((product) => (
            <tr key={product._id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <img
                      className="h-10 w-10 rounded-full object-cover"
                      src={product.image}
                      alt={product.name}
                    />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium ">{product.name}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm ">${product.price?.toFixed(2)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm">{product.category}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => toggleFeaturedProduct(product._id)}
                  className={`p-1 rounded-full ${
                    product.isFeatured
                      ? "bg-yellow-400 text-gray-900"
                      : "bg-red-600 text-gray-100"
                  } hover:bg-yellow-500 transition-colors duration-200`}
                >
                  <Star className="h-5 w-5" />
                </button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => deleteProduct(product._id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
};
export default ProductsList;
