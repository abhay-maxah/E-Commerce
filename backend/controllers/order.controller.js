import Order from "../models/order.model.js";
import { generateInvoicePDF } from "../utils/invoiceGenerator.js";
import PDFDocument from "pdfkit";
import { PassThrough } from "stream";
import resend from "../lib/resend.js";
// 🔄 Helper to calculate order totals
const calculateOrderTotal = ({ products, deliveryCharge = 0, discount = 0 }) => {
  const productTotal = products.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );
  const totalAmount = productTotal + deliveryCharge - discount;
  return { productTotal, totalAmount };
};
const createPDFBuffer = (order) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = new PassThrough();
    const chunks = [];

    doc.pipe(stream);
    generateInvoicePDF(order, doc);
    doc.end();

    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });

// ✅ Place Order + Send Email Invoice// ✅ Place Order
export const placeOrder = async (req, res) => {
  try {
    const { userId, products, address, deliveryCharge = 0, discount = 0 } = req.body;

    // Calculate total amount
    const { totalAmount } = calculateOrderTotal({ products, deliveryCharge, discount });

    const newOrder = await Order.create({
      user: userId,
      address,
      products,
      deliveryCharge,
      discount,
      totalAmount,
      orderStatus: "Pending",
    });

    const order = await Order.findById(newOrder._id)
      .populate("user", "name email")
      .populate("products.product", "name")
      .populate("address");

    const pdfBuffer = await createPDFBuffer(order);

    await resend.emails.send({
      from: "CookiesMan <support@cookiesman.me>",
      to: [order.user.email],
      subject: `Your Order Confirmation - ${order._id}`,
      html: `<p>Hi ${order.user.name},</p>
             <p>Thank you for placing your order with CookiesMan! Please find your invoice attached.</p>`,
      attachments: [
        {
          filename: `invoice-${order._id}.pdf`,
          content: pdfBuffer.toString("base64"),
        },
      ],
    });

    res.status(201).json({ message: "Order placed and invoice emailed!", order });
  } catch (error) {
    console.error("Place order error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// ✅ Get Orders for Specific User
export const getAllOrder = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }
    const userOrders = await Order.find({ user: userId })
      .populate("products.product", "name images") // Select 'name' and 'images' from the referenced Product
      .populate("address")
      .sort({ createdAt: -1 }); // Assuming address is a ref to an Address model
    res.status(200).json(userOrders);
  } catch (error) {
    console.error("Error fetching all orders for user:", userId, error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Download Invoice
export const generateInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("user", "name email")
      .populate("products.product", "name")
      .populate("address");

    if (!order) return res.status(404).json({ message: "Order not found" });

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Disposition", `attachment; filename=invoice-${orderId}.pdf`);
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    try {
      generateInvoicePDF(order, doc);
      doc.end();
    } catch (err) {
      console.error("PDF generation error:", err);
      // Cancel PDF stream
      doc.destroy();
      if (!res.headersSent && !res.writableEnded) {
        res.status(500).json({ message: "Error generating PDF" });
      } else {
        res.destroy(err);
      }
    }

  } catch (error) {
    console.error("Invoice download error:", error);
    if (!res.headersSent && !res.writableEnded) {
      res.status(500).json({ message: "Server error", error: error.message });
    } else {
      res.destroy(error);
    }
  }
};


// ✅ Admin: Get All Orders
export const getAllOrderForAdmin = async (req, res) => {
  try {
    const allOrders = await Order.find()
      .populate("user", "name email")
      .populate("products.product", "name price")
      .sort({ createdAt: -1 }); // Sort orders by creation date (latest first)

    if (!allOrders || allOrders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    res.status(200).json(allOrders);
  } catch (error) {
    res.status(500).json({
      message: "GetAllOrderForAdminError",
      error: error.message,
    });
  }
};


// ✅ Update Order Status
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


// ✅ Re-send Invoice Email
export const emailInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("user", "name email")
      .populate("products.product", "name")
      .populate("address");

    if (!order) return res.status(404).json({ message: "Order not found" });

    const pdfBuffer = await createPDFBuffer(order);

    await resend.emails.send({
      from: "CookiesMan <support@cookiesman.me>",
      to: [order.user.email],
      subject: `🍪 CookiesMan Invoice for Your Order #${order._id}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; padding: 20px; background-color: #fcf7f8;">
          <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <div style="background-color: #A31621; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Thank You for Your Order!</h1>
            </div>
            <div style="padding: 20px;">
              <p>Hi <strong>${order.user.name}</strong>,</p>
              <p>We appreciate your recent purchase from <strong>CookiesMan</strong>! 🍪</p>
              <p>Your invoice for <strong>Order #${order._id}</strong> is attached to this email.</p>
              <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
              <p style="margin-top: 20px;">We hope to see you again soon for more delicious treats!</p>
              <div style="margin-top: 30px; text-align: center;">
                <a href="https://cookiesman.me/" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #A31621; color: white; border-radius: 5px; text-decoration: none; font-weight: bold;">
                  Visit Our Website
                </a>
              </div>
            </div>
            <div style="background-color: #f5f5f5; text-align: center; padding: 10px 20px; font-size: 12px; color: #999;">
              &copy; ${new Date().getFullYear()} CookiesMan. All rights reserved.
            </div>
          </div>
        </div>`,
      attachments: [
        {
          filename: `invoice-${order._id}.pdf`,
          content: pdfBuffer.toString("base64"),
        },
      ],
    });

    res.status(200).json({ message: "Invoice emailed successfully!" });
  } catch (error) {
    console.error("Email invoice error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};