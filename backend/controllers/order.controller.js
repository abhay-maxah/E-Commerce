import Order from "../models/order.model.js";
import { generateInvoicePDF } from "../utils/invoiceGenerator.js";
import PDFDocument from "pdfkit";
import { PassThrough } from "stream";
import resend from "../lib/resend.js";
// ✅ Place Order + Send Email Invoice
export const placeOrder = async (req, res) => {
  try {
    const { userId, products, address, totalAmount } = req.body;

    const newOrder = await Order.create({
      user: userId,
      products,
      address,
      totalAmount,
      orderStatus: "Pending",
    });

    const order = await Order.findById(newOrder._id)
      .populate("user", "name email")
      .populate("products.product", "name price")
      .populate("address");

    const { doc, chunks } = generateInvoicePDF(order);

    doc.on("end", async () => {
      const pdfBuffer = Buffer.concat(chunks);

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
    });

    doc.end();
  } catch (error) {
    console.error("Order placement error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get Orders for Specific User
export const getAllOrder = async (req, res) => {
  try {
    const { userId } = req.params;
    const userOrders = await Order.find({ user: userId })
      .populate("products.product", "name price")
      .populate("address");

    res.status(200).json(userOrders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Download Invoice
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

    // Reuse shared PDF generator logic
    generateInvoicePDF(order, doc);
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

// ✅ Admin: Get All Orders
export const getAllOrderForAdmin = async (req, res) => {
  try {
    const allOrders = await Order.find()
      .populate("user", "name email")
      .populate("products.product", "name price");

    if (!allOrders || allOrders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }
    res.status(200).json(allOrders);
  } catch (error) {
    res.status(500).json({ message: "GetAllOrderForAdminError", error: error.message });
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

export const emailInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("user", "name email")
      .populate("products.product", "name price")
      .populate("address");

    if (!order) return res.status(404).json({ message: "Order not found" });

    // ✅ Create PDF in memory
    const doc = new PDFDocument({ margin: 50 });
    const stream = new PassThrough();
    const chunks = [];

    // Collect PDF chunks
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", async () => {
      const pdfBuffer = Buffer.concat(chunks);

      // ✅ Email PDF with Resend
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
          </div>
        `,
        attachments: [
          {
            filename: `invoice-${order._id}.pdf`,
            content: pdfBuffer.toString("base64"),
          },
        ],
      });

      res.status(200).json({ message: "Invoice emailed successfully!" });
    });

    // Pipe and generate PDF
    doc.pipe(stream);
    generateInvoicePDF(order, doc);
    doc.end();
  } catch (error) {
    console.error("Error emailing invoice:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};