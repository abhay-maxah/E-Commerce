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

    // **Company Header**
    doc
      .fontSize(26)
      .fillColor("#A31621")
      .text("CookiesMan", { align: "center", underline: true });
    doc.moveDown(0.5);

    doc
      .fontSize(12)
      .fillColor("black")
      .text("CookiesMan Pvt. Ltd.", { align: "center" });
    doc.text("123 Cookie Street, New Delhi, India", { align: "center" });
    doc.text("Email: support@cookiesman.com | Phone: +91 98765 43210", {
      align: "center",
    });
    doc.moveDown();

    // **Generate Random Invoice Number**
    const randomSuffix = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit random number
    const invoiceNumber = `INV-67DFB1${randomSuffix}`;
    const invoiceDate = new Date().toLocaleDateString("en-IN"); // Format: 3/23/2025

    // **Invoice Details**
    doc.fontSize(14).fillColor("#333").text(`Invoice Number: ${invoiceNumber}`);
    doc.text(`Invoice Date: ${invoiceDate}`);
    doc.text(`Payment Method: Card Payment`);
    doc.moveDown();

    // **Billing Details**
    doc
      .fontSize(16)
      .fillColor("#A31621")
      .text("Billing To", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor("black").text(`Name :${order.user.name}`);
    doc.text(
      `Address: ${order.address.houseName}, ${order.address.streetAddress}`
    );
    doc.text(
      `${order.address.city}, ${order.address.state} - ${order.address.zipCode}`
    );
    doc.text(`India`);
    doc.text(`Phone: ${order.address.phoneNumber}`);
    doc.moveDown();

    // **Order Summary**
    doc
      .fontSize(16)
      .fillColor("#A31621")
      .text("Order Summary", { underline: true });
    doc.moveDown(0.5);

    let calculatedTotal = 0;
    order.products.forEach((product, index) => {
      const productTotal = product.quantity * product.product.price;
      calculatedTotal += productTotal;

      doc.fontSize(12).fillColor("black");
      doc.text(`${index + 1}. ${product.product.name}`, { bold: true });
      doc.text(`Quantity: ${product.quantity}`);
      doc.text(`Price: ₹${product.product.price.toFixed(2)}`);
      doc.text(`Subtotal: ₹${productTotal.toFixed(2)}`);
      doc.moveDown();
    });

    // **Calculate Discount Properly**
    const totalAmount = order.totalAmount || calculatedTotal;
    const discount = calculatedTotal - totalAmount; // Correct discount calculation
    const payableAmount = totalAmount;

    // **Billing Summary**
    doc
      .fontSize(16)
      .fillColor("#A31621")
      .text("Billing Summary", { underline: true });
    doc.moveDown(0.5);

    const fallbackRupeeText = "Rs.";

    doc
      .fontSize(14)
      .fillColor("black")
      .text(`Total Amount: ${fallbackRupeeText} ${calculatedTotal.toFixed(2)}`);
    doc.text(`Discount: ${fallbackRupeeText} ${discount.toFixed(2)}`);
    doc
      .fontSize(16)
      .fillColor("#A31621")
      .text(
        `Payable Amount: ${fallbackRupeeText} ${payableAmount.toFixed(2)}`,
        { bold: true }
      );
    doc.moveDown(1);

    // **Thank You Note**
    doc
      .fontSize(14)
      .fillColor("#A31621")
      .text("Thank you for shopping with CookiesMan!", { align: "center" });
    doc.text("Enjoy your delicious cookies and visit our online store again!", {
      align: "center",
    });

    doc.end(); // Ensure stream is properly closed
  } catch (error) {
    console.error("Error generating invoice:", error);

    if (!res.headersSent) {
      res.setHeader("Content-Type", "application/json");
      res.status(500).json({ message: "Server error", error: error.message });
    } else {
      res.destroy(error); // Properly close the stream if response has already started
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
