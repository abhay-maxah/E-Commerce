// import express from "express";
// import { getAnalyticsData, getDailySalesData } from "../controllers/analytics.controller.js";
// import { adminRoute, protectRoute } from "../Middleware/auth.middleware.js";

// const router = express.Router();

// router.get("/", protectRoute, adminRoute, async (req, res) => {
// 	try {
// 		const analyticsData = await getAnalyticsData();

// 		const endDate = new Date();
// 		const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

// 		const dailySalesData = await getDailySalesData(startDate, endDate);

// 		res.json({
// 			analyticsData,
// 			dailySalesData,
// 		});
// 	} catch (error) {
// 		res.status(500).json({ message: "Server error", error: error.message });
// 	}
// });

// export default router;
import express from "express";
import {
	getAnalyticsData,
	getDailySalesData,
	getSalesByCategory,
	getOrdersByStatus,
	getTopProducts,
	getMonthlySales,
} from "../controllers/analytics.controller.js";

import { adminRoute, protectRoute } from "../Middleware/auth.middleware.js";

const router = express.Router();

// ------------------------------
// Dashboard Summary Route
// ------------------------------
router.get("/", protectRoute, adminRoute, async (req, res) => {
	try {
		const analyticsData = await getAnalyticsData();

		const endDate = new Date();
		const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days

		const dailySalesData = await getDailySalesData(startDate, endDate);

		res.json({
			analyticsData,
			dailySalesData,
		});
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

// ------------------------------
// 1. Products Grouped by Category
// ------------------------------
router.get("/by-category", protectRoute, adminRoute, async (req, res) => {
	try {
		const data = await getSalesByCategory();
		res.json(data);
	} catch (error) {
		res.status(500).json({ message: "Error fetching category data", error: error.message });
	}
});

// ------------------------------
// 2. Orders Grouped by Status
// ------------------------------
router.get("/by-status", protectRoute, adminRoute, async (req, res) => {
	try {
		const data = await getOrdersByStatus();
		res.json(data);
	} catch (error) {
		res.status(500).json({ message: "Error fetching status data", error: error.message });
	}
});

// ------------------------------
// 3. Top 5 Products by Quantity Sold
// ------------------------------
router.get("/top-products", protectRoute, adminRoute, async (req, res) => {
	try {
		const data = await getTopProducts();
		res.json(data);
	} catch (error) {
		res.status(500).json({ message: "Error fetching top products", error: error.message });
	}
});

// ------------------------------
// 4. Monthly Sales Summary
// ------------------------------
router.get("/monthly-sales", protectRoute, adminRoute, async (req, res) => {
	try {
		const data = await getMonthlySales();
		res.json(data);
	} catch (error) {
		res.status(500).json({ message: "Error fetching monthly sales", error: error.message });
	}
});

export default router;
