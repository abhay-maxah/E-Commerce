// import Order from "../models/order.model.js";
// import Product from "../models/product.model.js";
// import User from "../models/user.model.js";

// export const getAnalyticsData = async () => {
// 	const totalUsers = await User.countDocuments({ role: "user" });
// 	const totalProducts = await Product.countDocuments();

// 	const salesData = await Order.aggregate([
// 		{
// 			$group: {
// 				_id: null, // it groups all documents together,
// 				totalSales: { $sum: 1 },
// 				totalRevenue: { $sum: "$totalAmount" },
// 			},
// 		},
// 	]);

// 	const { totalSales, totalRevenue } = salesData[0] || { totalSales: 0, totalRevenue: 0 };

// 	return {
// 		users: totalUsers,
// 		products: totalProducts,
// 		totalSales,
// 		totalRevenue,
// 	};
// };

// export const getDailySalesData = async (startDate, endDate) => {
// 	try {
// 		const dailySalesData = await Order.aggregate([
// 			{
// 				$match: {
// 					createdAt: {
// 						$gte: startDate,
// 						$lte: endDate,
// 					},
// 				},
// 			},
// 			{
// 				$group: {
// 					_id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
// 					sales: { $sum: 1 },
// 					revenue: { $sum: "$totalAmount" },
// 				},
// 			},
// 			{ $sort: { _id: 1 } },
// 		]);

// 		// example of dailySalesData
// 		// [
// 		// 	{
// 		// 		_id: "2024-08-18",
// 		// 		sales: 12,
// 		// 		revenue: 1450.75
// 		// 	},
// 		// ]

// 		const dateArray = getDatesInRange(startDate, endDate);
// 		// console.log(dateArray) // ['2024-08-18', '2024-08-19', ... ]

// 		return dateArray.map((date) => {
// 			const foundData = dailySalesData.find((item) => item._id === date);

// 			return {
// 				date,
// 				sales: foundData?.sales || 0,
// 				revenue: foundData?.revenue || 0,
// 			};
// 		});
// 	} catch (error) {
// 		throw error;
// 	}
// };

// function getDatesInRange(startDate, endDate) {
// 	const dates = [];
// 	let currentDate = new Date(startDate);

// 	while (currentDate <= endDate) {
// 		dates.push(currentDate.toISOString().split("T")[0]);
// 		currentDate.setDate(currentDate.getDate() + 1);
// 	}

// 	return dates;
// }
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

// ----------------------------
// 1. Dashboard Summary
// ----------------------------
export const getAnalyticsData = async () => {
	const totalUsers = await User.countDocuments({ role: "user" });
	const totalProducts = await Product.countDocuments();

	const salesData = await Order.aggregate([
		{
			$group: {
				_id: null,
				totalSales: { $sum: 1 },
				totalRevenue: { $sum: "$totalAmount" },
			},
		},
	]);

	const { totalSales, totalRevenue } = salesData[0] || { totalSales: 0, totalRevenue: 0 };

	return {
		users: totalUsers,
		products: totalProducts,
		totalSales,
		totalRevenue,
	};
};

// ----------------------------
// 2. Daily Sales for Last X Days
// ----------------------------
export const getDailySalesData = async (startDate, endDate) => {
	try {
		const dailySalesData = await Order.aggregate([
			{
				$match: {
					createdAt: {
						$gte: startDate,
						$lte: endDate,
					},
				},
			},
			{
				$group: {
					_id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
					sales: { $sum: 1 },
					revenue: { $sum: "$totalAmount" },
				},
			},
			{ $sort: { _id: 1 } },
		]);

		const dateArray = getDatesInRange(startDate, endDate);

		return dateArray.map((date) => {
			const foundData = dailySalesData.find((item) => item._id === date);

			return {
				date,
				sales: foundData?.sales || 0,
				revenue: foundData?.revenue || 0,
			};
		});
	} catch (error) {
		throw error;
	}
};

function getDatesInRange(startDate, endDate) {
	const dates = [];
	let currentDate = new Date(startDate);

	while (currentDate <= endDate) {
		dates.push(currentDate.toISOString().split("T")[0]);
		currentDate.setDate(currentDate.getDate() + 1);
	}

	return dates;
}

// ----------------------------
// 3. Sales Grouped by Category
// ----------------------------
export const getSalesByCategory = async () => {
	const result = await Order.aggregate([
		{ $unwind: "$products" },
		{
			$lookup: {
				from: "products",
				localField: "products.product",
				foreignField: "_id",
				as: "productDetails",
			},
		},
		{ $unwind: "$productDetails" },
		{
			$group: {
				_id: "$productDetails.category",
				totalQuantity: { $sum: "$products.quantity" },
			},
		},
		{
			$project: {
				category: "$_id",
				totalQuantity: 1,
				_id: 0,
			},
		},
	]);
	return result;
};

// ----------------------------
// 4. Orders Grouped by Status
// ----------------------------
export const getOrdersByStatus = async () => {
	const result = await Order.aggregate([
		{
			$group: {
				_id: "$orderStatus",
				count: { $sum: 1 },
			},
		},
		{
			$project: {
				status: "$_id",
				count: 1,
				_id: 0,
			},
		},
	]);
	return result;
};

// ----------------------------
// 5. Top 5 Most Ordered Products
// ----------------------------
export const getTopProducts = async () => {
	const result = await Order.aggregate([
		{ $unwind: "$products" },
		{
			$lookup: {
				from: "products",
				localField: "products.product",
				foreignField: "_id",
				as: "productDetails",
			},
		},
		{ $unwind: "$productDetails" },
		{
			$group: {
				_id: "$productDetails.name",
				totalQuantity: { $sum: "$products.quantity" },
			},
		},
		{
			$project: {
				productName: "$_id",
				totalQuantity: 1,
				_id: 0,
			},
		},
		{ $sort: { totalQuantity: -1 } },
		{ $limit: 5 },
	]);
	return result;
};

// ----------------------------
// 6. Monthly Sales Totals
// ----------------------------
export const getMonthlySales = async () => {
	const result = await Order.aggregate([
		{
			$group: {
				_id: {
					year: { $year: "$createdAt" },
					month: { $month: "$createdAt" },
				},
				totalSales: { $sum: "$totalAmount" },
			},
		},
		{
			$project: {
				year: "$_id.year",
				month: "$_id.month",
				totalSales: 1,
				_id: 0,
			},
		},
		{ $sort: { year: 1, month: 1 } },
	]);
	return result;
};
