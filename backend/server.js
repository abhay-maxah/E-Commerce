import express from "express";
import Dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import paymentRoutes from "./routes/payment.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
import OrderRoutes from "./routes/order.route.js"
import WistlistRoutes from "./routes/wishlist.route.js"
import path from "path";
import addressRoute from "./routes/address.route.js"
//if we dont used a cores than config in vite.config.js file
import { connectDB } from "./lib/db.js";
Dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

const __dirname = path.resolve(); //to get path of current directory
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use('/api/orders',OrderRoutes)
app.use('/api/address',addressRoute)
app.use('/api/wishlist', WistlistRoutes)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
  });
}
app.listen(PORT, () => {
  console.log("server running on http://localhost:" + PORT);
  connectDB();
});
