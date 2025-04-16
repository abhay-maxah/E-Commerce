import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import { stripe } from "../lib/stripe.js";

export const createCheckoutSession = async (req, res) => {
  try {
    const { products, couponCode, address, deliveryCharge } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Invalid or empty products array" });
    }

    if (!address) {
      return res.status(400).json({ error: "Address is required." });
    }

    let productTotal = 0;
    let deliveryTotal = 0;
    let discountAmount = 0;
    let coupon = null;

    const lineItems = products.map((product) => {
      const amount = Math.round(product.price * 100);
      const quantity = product.quantity || 1;

      productTotal += amount * quantity;

      return {
        price_data: {
          currency: "inr",
          product_data: {
            name: product.name,
            images: [product.image],
          },
          unit_amount: amount,
        },
        quantity,
      };
    });

    // Add delivery charge if needed
    if (deliveryCharge && deliveryCharge > 0) {
      deliveryTotal = Math.round(deliveryCharge * 100);
      lineItems.push({
        price_data: {
          currency: "inr",
          product_data: {
            name: "Delivery Charge",
          },
          unit_amount: deliveryTotal,
        },
        quantity: 1,
      });
    }

    // Handle coupon discount on product total only
    if (couponCode) {
      coupon = await Coupon.findOne({
        code: couponCode,
        userId: req.user._id,
        isActive: true,
      });

      if (coupon) {
        discountAmount = Math.round(
          (productTotal * coupon.discountPercentage) / 100
        );
        productTotal -= discountAmount;
      }
    }

    const totalAmount = productTotal + deliveryTotal;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
      discounts: coupon
        ? [
          {
            coupon: await createStripeCoupon(coupon.discountPercentage),
          },
        ]
        : [],
      metadata: {
        userId: req.user._id.toString(),
        couponCode: couponCode || "",
        address,
        deliveryCharge: deliveryCharge || 0,
        discountAmount: discountAmount || 0,
        products: JSON.stringify(
          products.map((p) => ({
            id: p._id,
            quantity: p.quantity,
            price: p.price,
          }))
        ),
      },
    });

    // Auto generate new coupon if total (pre-discount) meets threshold
    if (productTotal + discountAmount >= 20000) {
      await createNewCoupon(req.user._id);
    }

    res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 });
  } catch (error) {
    console.error("Error processing checkout:", error);
    res.status(500).json({
      message: "Error processing checkout",
      error: error.message,
    });
  }
};

export const createYearlyPremiumSession = async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID, // The yearly subscription plan ID from your Stripe dashboard
          quantity: 1,
        },
      ],
      customer_email: req.user.email,
      success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
      metadata: {
        userId: req.user._id.toString(),
        email: req.user.email,
        upgradeType: "yearly-premium",
      },
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Error creating premium session:", error);
    res.status(500).json({ message: "Failed to create premium session" });
  }
};

export const checkoutSuccess = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: "Missing sessionId" });
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // ✅ Handle Yearly Premium Subscription Upgrade
    if (
      session.metadata?.upgradeType === "yearly-premium" &&
      session.payment_status === "paid"
    ) {
      const updatedUser = await User.findByIdAndUpdate(
        session.metadata.userId,
        { premium: true },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: "Premium plan activated successfully.",
        user: updatedUser,
        type: "subscription", // ⬅️ important for frontend
      });
    }

    // ✅ Prevent duplicate order creation
    const existingOrder = await Order.findOne({ stripeSessionId: sessionId });
    if (existingOrder) {
      return res
        .status(400)
        .json({ message: "Order already created for this session." });
    }

    // ✅ Handle Normal Product Purchase
    if (session.payment_status === "paid") {
      // Deactivate coupon if used
      if (session.metadata?.couponCode) {
        await Coupon.findOneAndUpdate(
          {
            code: session.metadata.couponCode,
            userId: session.metadata.userId,
          },
          { isActive: false }
        );
      }

      const parsedAddress = JSON.parse(session.metadata.address);
      const products = JSON.parse(session.metadata.products);

      const newOrder = new Order({
        user: session.metadata.userId,
        address: parsedAddress,
        products: products.map((product) => ({
          product: product.id,
          quantity: product.quantity,
          price: product.price,
        })),
        totalAmount: session.amount_total / 100,
        stripeSessionId: sessionId,
      });

      await newOrder.save();

      return res.status(200).json({
        success: true,
        message: "Payment successful, order created, and coupon deactivated if used.",
        orderId: newOrder._id,
        type: "order", // ⬅️ helps frontend distinguish
      });
    } else {
      return res.status(400).json({ message: "Payment not completed." });
    }

  } catch (error) {
    console.error("Error processing successful checkout:", error);
    res.status(500).json({
      message: "Error processing successful checkout",
      error: error.message,
    });
  }
};



async function createStripeCoupon(discountPercentage) {
  const coupon = await stripe.coupons.create({
    percent_off: discountPercentage,
    duration: "once",
  });

  return coupon.id;
}

async function createNewCoupon(userId) {
  await Coupon.findOneAndDelete({ userId });

  const newCoupon = new Coupon({
    code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    discountPercentage: 10,
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    userId: userId,
  });

  await newCoupon.save();
  return newCoupon;
}
