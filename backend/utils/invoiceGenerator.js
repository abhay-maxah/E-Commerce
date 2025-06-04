import PDFDocument from "pdfkit";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateInvoicePDF = (order, doc) => {
  const logoPath = path.join(__dirname, "../public/logo.png");
  try {
    doc.image(logoPath, 190, 42, { width: 30 });
  } catch (e) {
    console.warn("Logo not found or failed to load:", e.message);
  }

  doc
    .fontSize(26)
    .fillColor("#A31621")
    .text("CookiesMan", 50, 50, { align: "center" });

  doc.moveDown(1);
  doc.fontSize(12).fillColor("black")
    .text("CookiesMan Pvt. Ltd.", { align: "center" })
    .text("123 Cookie Street, New Delhi, India", { align: "center" })
    .text("Email: support@cookiesman.com | Phone: +91 98765 43210", { align: "center" })
    .moveDown();

  const invoiceNumber = `INV-67DFB1${Math.floor(100000 + Math.random() * 900000)}`;
  const invoiceDate = new Date().toLocaleDateString("en-IN");

  doc.fontSize(14).fillColor("#333")
    .text(`Invoice Number: ${invoiceNumber}`)
    .text(`Invoice Date: ${invoiceDate}`)
    .text(`Payment Method: Card Payment`).moveDown();

  doc.fontSize(16).fillColor("#A31621").text("Billing To", { underline: true }).moveDown(0.5);
  doc.fontSize(12).fillColor("black")
    .text(`Name: ${order.user?.name || "N/A"}`)
    .text(`Address: ${order.address?.houseName || "N/A"}, ${order.address?.streetAddress || "N/A"}`)
    .text(`${order.address?.city || "N/A"}, ${order.address?.state || "N/A"} - ${order.address?.zipCode || "N/A"}`)
    .text("India")
    .text(`Phone: ${order.address?.phoneNumber || "N/A"}`)
    .moveDown();

  doc.fontSize(16).fillColor("#A31621").text("Order Summary", { underline: true });

  const startX = 50;
  const itemHeight = 30;
  let tableTop = doc.y + 5;
  let currentY = tableTop + itemHeight;
  let calculatedTotal = 0;

  // Header
  doc.fontSize(12).fillColor("black")
    .text("Sr No", startX + 5, tableTop)
    .text("Product Name", startX + 50, tableTop)
    .text("Weight", startX + 200, tableTop)
    .text("Price (Rs)", startX + 270, tableTop)
    .text("Qty", startX + 350, tableTop)
    .text("Total (Rs)", startX + 400, tableTop);

  // Underline after header
  doc.moveTo(startX, tableTop + itemHeight - 10)
    .lineTo(startX + 500, tableTop + itemHeight - 10)
    .strokeColor("#333")
    .lineWidth(1)
    .stroke();

  // Product Rows
  order.products.forEach((product, index) => {
    const name = product.product?.name || "Unknown";
    const weight = product.selectedWeight || "-";
    const price = product.price || 0;
    const quantity = product.quantity;
    const total = price * quantity;
    calculatedTotal += total;

    const rowHeight = doc.heightOfString(name, { width: 130 });

    doc.fontSize(12)
      .text(index + 1, startX + 5, currentY)
      .text(name, startX + 50, currentY, { width: 130 })
      .text(weight, startX + 200, currentY)
      .text(price.toFixed(2), startX + 270, currentY)
      .text(quantity, startX + 350, currentY)
      .text(total.toFixed(2), startX + 400, currentY);

    currentY += Math.max(rowHeight, itemHeight);
  });

  const deliveryCharge = order.deliveryCharge || 0;
  const orderTotalAmount = order.totalAmount ?? (calculatedTotal + deliveryCharge);
  const discount = orderTotalAmount < (calculatedTotal + deliveryCharge)
    ? (calculatedTotal + deliveryCharge) - orderTotalAmount
    : 0;

  doc.moveDown(2).fontSize(16).fillColor("#A31621")
    .text("Billing Summary", startX, currentY + 10, { underline: true });

  let summaryY = currentY + 35;

  doc.fontSize(14).fillColor("black")
    .text(`Total Amount: Rs. ${calculatedTotal.toFixed(2)}`, startX, summaryY);
  summaryY += 20;

  if (deliveryCharge > 0) {
    doc.text(`Delivery Charge: Rs. ${deliveryCharge.toFixed(2)}`, startX, summaryY);
    summaryY += 20;
  }

  if (discount > 0) {
    doc.text(`Discount: Rs. ${discount.toFixed(2)}`, startX, summaryY);
    summaryY += 20;
  }

  doc.fontSize(16).fillColor("#A31621")
    .text(`Payable Amount: Rs. ${orderTotalAmount.toFixed(2)}`, startX, summaryY);

  doc.moveDown().fontSize(14).fillColor("#A31621")
    .text("Thank you for shopping with CookiesMan!", { align: "center" })
    .text("Enjoy your delicious cookies and visit our online store again!", { align: "center" });
};
