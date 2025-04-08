import Order from "../models/order.model.js";
import PDFDocument from "pdfkit";

export const getAllOrder = async (req, res) => {
  try {
    const { userId } = req.params;
    const userOrders = await Order.find({ user: userId })
      .populate("products.product", "name price")
      .populate("address"); // Include address details

    res.status(200).json(userOrders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate("user", "name email")
      .populate("products.product", "name price")
      .populate("address");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const doc = new PDFDocument({ margin: 50 });
    const fileName = `invoice-${orderId}.pdf`;
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    // Logo + Title
    const logoPath = path.join(__dirname, "../public/logo.png");
    doc.image(logoPath, 190, 42, { width: 30 });

    doc
      .fontSize(26)
      .fillColor("#A31621")
      .text("CookiesMan", 50, 50, {
        align: "center",
      });

    doc.moveDown(1);
    doc
      .fontSize(12)
      .fillColor("black")
      .text("CookiesMan Pvt. Ltd.", { align: "center" });
    doc.text("123 Cookie Street, New Delhi, India", { align: "center" });
    doc.text("Email: support@cookiesman.com | Phone: +91 98765 43210", {
      align: "center",
    });
    doc.moveDown();

    // INVOICE INFO
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const invoiceNumber = `INV-67DFB1${randomSuffix}`;
    const invoiceDate = new Date().toLocaleDateString("en-IN");

    doc.fontSize(14).fillColor("#333").text(`Invoice Number: ${invoiceNumber}`);
    doc.text(`Invoice Date: ${invoiceDate}`);
    doc.text(`Payment Method: Card Payment`);
    doc.moveDown();

    // BILLING TO
    doc.fontSize(16).fillColor("#A31621").text("Billing To", { underline: true });
    doc.moveDown(0.5);
    doc
      .fontSize(12)
      .fillColor("black")
      .text(`Name: ${order.user?.name || "N/A"}`)
      .text(`Address: ${order.address?.houseName || "N/A"}, ${order.address?.streetAddress || "N/A"}`)
      .text(`${order.address?.city || "N/A"}, ${order.address?.state || "N/A"} - ${order.address?.zipCode || "N/A"}`)
      .text("India")
      .text(`Phone: ${order.address?.phoneNumber || "N/A"}`);
    doc.moveDown();

    // ORDER SUMMARY TABLE
    doc.fontSize(16).fillColor("#A31621").text("Order Summary", { underline: true });

    let calculatedTotal = 0;
    const startX = 50;
    const endX = 550;
    const itemHeight = 20;
    let tableTop = doc.y + 5;

    // Header Row
    doc
      .fontSize(12)
      .fillColor("black")
      .text("Sr No", startX + 5, tableTop)
      .text("Product Name", startX + 50, tableTop)
      .text("Price (Rs)", startX + 210, tableTop)
      .text("Qty", startX + 290, tableTop)
      .text("Total (Rs)", startX + 350, tableTop);

    tableTop += 5;
    doc.rect(startX, tableTop - 10, endX - startX, itemHeight).stroke("#A31621");

    let currentY = tableTop + itemHeight;

    // Table Rows
    order.products.forEach((product, index) => {
      const productName = product.product?.name || "Unknown Product";
      const productPrice = product.product?.price || 0;
      const quantity = product.quantity || 0;
      const productTotal = quantity * productPrice;
      calculatedTotal += productTotal;

      doc
        .fontSize(12)
        .text(`${index + 1}`, startX + 5, currentY)
        .text(productName, startX + 50, currentY)
        .text(productPrice.toFixed(2), startX + 210, currentY)
        .text(quantity, startX + 290, currentY)
        .text(productTotal.toFixed(2), startX + 350, currentY);

      doc.rect(startX, currentY - 5, endX - startX, itemHeight).stroke("#A31621");
      currentY += itemHeight;
    });

    const tableBottomY = currentY;

    // BILLING SUMMARY
    doc.moveDown(1.5);
    doc.fontSize(16).fillColor("#A31621").text("Billing Summary", startX, tableBottomY + 10, { underline: true });

    const totalAmount = order.totalAmount || calculatedTotal;
    const discount = calculatedTotal - totalAmount;
    const payableAmount = totalAmount;

    doc
      .fontSize(14)
      .fillColor("black")
      .text(`Total Amount: Rs. ${calculatedTotal.toFixed(2)}`, startX, tableBottomY + 35);
    doc.text(`Discount: Rs. ${discount.toFixed(2)}`, startX, doc.y);
    doc
      .fontSize(16)
      .fillColor("#A31621")
      .text(`Payable Amount: Rs. ${payableAmount.toFixed(2)}`, startX, doc.y);

    // FOOTER
    doc.moveDown(1.5);
    doc
      .fontSize(14)
      .fillColor("#A31621")
      .text("Thank you for shopping with CookiesMan!", { align: "center" });
    doc.text("Enjoy your delicious cookies and visit our online store again!", {
      align: "center",
    });

    doc.end();
  } catch (error) {
    console.error("Error generating invoice:", error);
    if (!res.headersSent && !res.writableEnded) {
      res.status(500).json({ message: "Server error", error: error.message });
    } else {
      res.destroy(error);
    }
  }
};


export const getAllOrderForAdmin = async (req, res) => {
  try {
    const allOrders = await Order.find()
      .populate("user", "name email") // Fetch user details
      .populate("products.product", "name price"); // Fetch product details

    if (!allOrders || allOrders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }
    res.status(200).json(allOrders);
  } catch (error) {
    res
      .status(500)
      .json({ message: "GetAllOrderForAdminError", error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus: status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
