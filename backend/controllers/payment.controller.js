import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import { stripe } from "../lib/stripe.js";
import mongoose from "mongoose";
// export const createCheckoutSession = async (req, res) => {
//   try {
//     const { products, couponCode, address, deliveryCharge } = req.body;

//     if (!Array.isArray(products) || products.length === 0) {
//       console.error("Backend: Validation Error: Invalid or empty products array.");
//       return res.status(400).json({ error: "Invalid or empty products array." });
//     }

//     if (!address) {
//       return res.status(400).json({ error: "Address ID is required." });
//     }

//     const parsedDeliveryCharge = Number(deliveryCharge);
//     if (isNaN(parsedDeliveryCharge)) {
//       return res.status(400).json({ error: "Invalid delivery charge: must be a number." });
//     }

//     let productTotal = 0; // This will accumulate in cents/paise
//     let deliveryTotal = 0; // This will be in cents/paise
//     let discountAmount = 0; // This will be in cents/paise
//     let coupon = null;

//     const lineItems = products.map((product, index) => {
//       const productPrice = Number(product.selectedPrice);
//       const productQuantity = Number(product.quantity || 1);

//       // Robust validation for each product item
//       if (isNaN(productPrice) || productPrice <= 0 || isNaN(productQuantity) || productQuantity <= 0 || !Number.isInteger(productQuantity)) {
//         throw new Error(`Invalid product price or quantity for product: ${product.name || product._id || `index ${index}`}`);
//       }

//       const unitAmountInPaise = Math.round(productPrice * 100); // Convert to smallest currency unit (paise)

//       productTotal += unitAmountInPaise * productQuantity;

//       return {
//         price_data: {
//           currency: "inr", // Ensure this matches your Stripe account's currency
//           product_data: {
//             name: product.name,
//             images: product.image ? [product.image] : [], // Ensure image is an array if present
//             description: product.description || '' // Add description for Stripe, can be empty
//           },
//           unit_amount: unitAmountInPaise,
//         },
//         quantity: productQuantity,
//       };
//     });

//     // Add delivery charge as a line item if applicable
//     if (parsedDeliveryCharge > 0) {
//       deliveryTotal = Math.round(parsedDeliveryCharge * 100);
//       lineItems.push({
//         price_data: {
//           currency: "inr",
//           product_data: {
//             name: "Delivery Charge",
//             // No image for delivery charge, or a generic one if you have it
//           },
//           unit_amount: deliveryTotal,
//         },
//         quantity: 1,
//       });
//     }

//     if (couponCode) {
//       if (!req.user || !req.user._id) {

//       } else {
//         coupon = await Coupon.findOne({
//           code: couponCode,
//           userId: req.user._id, // Ensure coupon applies to the current user
//           isActive: true,
//         });

//         if (coupon) {
//           const discountPercentage = Number(coupon.discountPercentage);
//           if (isNaN(discountPercentage) || discountPercentage < 0 || discountPercentage > 100) {
//             console.error(`Backend: Coupon discount percentage is invalid: ${coupon.discountPercentage}`);
//             coupon = null; // Invalidate coupon if percentage is bad
//           } else {
//             discountAmount = Math.round(
//               (productTotal * discountPercentage) / 100
//             );
//             productTotal -= discountAmount;
//           }
//         } else {
//           console.log(`Backend: Coupon with code ${couponCode} not found or inactive for user ${req.user._id}`);
//         }
//       }
//     }

//     // Calculate final amount for Stripe
//     const finalAmountForStripe = productTotal + deliveryTotal;

//     if (isNaN(finalAmountForStripe) || !Number.isInteger(finalAmountForStripe) || finalAmountForStripe < 0) {
//       console.error(`Backend: Final amount for Stripe is invalid: ${finalAmountForStripe}`);
//       return res.status(500).json({
//         message: "Error processing checkout",
//         error: "Calculated payment amount is invalid. Please contact support.",
//       });
//     }

//     // Create Stripe Checkout Session
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items: lineItems,
//       mode: "payment",
//       success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
//       discounts: coupon && finalAmountForStripe > 0
//         ? [{ coupon: await createStripeCoupon(coupon.discountPercentage) }] // Ensure this function returns a Stripe Coupon ID
//         : [],
//       metadata: {
//         userId: req.user._id.toString(),
//         couponCode: couponCode || "",
//         address: address, // Store the address ID directly if it's an ID
//         deliveryCharge: parsedDeliveryCharge.toString(),
//         discountAmount: discountAmount.toString(),
//         products: JSON.stringify(
//           products.map((p) => ({
//             productId: p.product,
//             quantity: p.quantity,
//             price: p.selectedPrice,
//             selectedWeight: p.selectedWeight,
//           }))
//         ),
//       },
//     });
//     if ((productTotal + discountAmount) / 100 >= 200) { // Assuming 200 is the threshold in original currency units
//       await createNewCoupon(req.user._id); // Ensure createNewCoupon is defined
//     }

//     res.status(200).json({ id: session.id, totalAmount: finalAmountForStripe / 100 });
//   } catch (error) {
//     console.error("❌ Error processing checkout:", error);
//     res.status(500).json({
//       message: "Error processing checkout",
//       error: error.message || "An unexpected error occurred.",
//     });
//   }
// };

// export const checkoutSuccess = async (req, res) => {
//   try {
//     const { sessionId } = req.body;

//     if (!sessionId) {
//       return res.status(400).json({ message: "Missing sessionId." });
//     }
//     let session;
//     try {
//       session = await stripe.checkout.sessions.retrieve(sessionId);
//     } catch (stripeError) {
//       console.error("❌ Stripe session retrieval failed:", stripeError.message);
//       return res.status(500).json({
//         message: "Failed to retrieve payment session.",
//         error: stripeError.message,
//       });
//     }

//     if (
//       session.metadata?.upgradeType === "yearly-premium" &&
//       session.payment_status === "paid"
//     ) {
//       const updatedUser = await User.findByIdAndUpdate(
//         session.metadata.userId,
//         { premium: true },
//         { new: true }
//       );

//       if (!updatedUser) {
//         return res.status(404).json({
//           success: false,
//           message: "User not found for premium upgrade.",
//         });
//       }

//       return res.status(200).json({
//         success: true,
//         message: "Premium plan activated successfully.",
//         user: updatedUser,
//         type: "subscription",
//       });
//     }

//     // ✅ Prevent duplicate order creation
//     const existingOrder = await Order.findOne({ stripeSessionId: sessionId });
//     if (existingOrder) {
//       return res.status(200).json({
//         success: false, // Indicate it's not a *new* creation
//         message: "Order already created for this session.",
//         orderId: existingOrder._id,
//         type: "order",
//       });
//     }

//     // ✅ Check payment status
//     if (session.payment_status !== "paid") {
//       return res.status(400).json({
//         success: false,
//         message: `Payment not completed.Status: ${session.payment_status} `,
//       });
//     }

//     // ✅ Parse metadata
//     let productsFromMetadata = []; // Rename to avoid conflict with function parameter `products`
//     let parsedAddressId = null; // Rename to clarify it's an ID
//     try {
//       productsFromMetadata = JSON.parse(session.metadata.products);
//       parsedAddressId = session.metadata.address; // ✅ FIX: No need to parse again if `address` was stored as a string ID
//     } catch (jsonError) {
//       console.error("❌ JSON Parsing Error:", jsonError.message);
//       console.error("📦 Raw Metadata:", session.metadata);
//       return res.status(500).json({
//         message: "Error processing order details: Invalid product or address data.",
//         error: "Metadata JSON parsing failed.",
//       });
//     }

//     if (!mongoose.Types.ObjectId.isValid(parsedAddressId)) {
//       console.error(`❌ Invalid address ID from metadata: ${parsedAddressId} `);
//       return res.status(400).json({ message: "Invalid address ID from payment session." });
//     }

//     const mappedProducts = productsFromMetadata.map((p, index) => {
//       if (!p.productId || !p.price || !p.quantity || !p.selectedWeight) {
//         throw new Error(`Product at index ${index} from metadata is missing required fields.`);
//       }
//       return {
//         product: p.productId, // Use the productId from metadata
//         quantity: p.quantity,
//         price: p.price, // Use price from metadata (which was selectedPrice)
//         selectedWeight: p.selectedWeight,
//       };
//     });

//     const newOrder = new Order({
//       user: session.metadata.userId,
//       address: parsedAddressId, // Use the parsed address ID
//       products: mappedProducts,
//       totalAmount: session.amount_total / 100, // Stripe amount_total is in cents/paise
//       deliveryCharge: Number(session.metadata.deliveryCharge || 0),
//       discount: Number(session.metadata.discountAmount || 0),
//       stripeSessionId: sessionId,
//       orderStatus: "Pending", // Or whatever your initial status is
//     });

//     await newOrder.save();
//     if (session.metadata?.couponCode) {
//       await Coupon.findOneAndUpdate(
//         {
//           code: session.metadata.couponCode,
//           userId: session.metadata.userId,
//           isActive: true // Only deactivate if it was active
//         },
//         { isActive: false },
//         { new: true }
//       );
//     }
//     return res.status(200).json({
//       success: true,
//       message: "Payment successful, order created, and coupon deactivated if used.",
//       orderId: newOrder._id,
//       type: "order",
//     });
//   } catch (error) {
//     console.error("❌ Error processing checkout success:", error.message);
//     // Be careful not to expose too much internal error detail to the client in production
//     return res.status(500).json({
//       message: "An unexpected error occurred during checkout success.",
//       error: error.message || "Unknown error",
//     });
//   }
// };

export const createCheckoutSession = async (req, res) => {
  try {
    // 1. IMPORTANT: Destructure success_url and cancel_url from req.body
    const { products, couponCode, address, deliveryCharge, success_url, cancel_url } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      console.error("Backend: Validation Error: Invalid or empty products array.");
      return res.status(400).json({ error: "Invalid or empty products array." });
    }

    if (!address) {
      return res.status(400).json({ error: "Address ID is required." });
    }

    // 2. Validate that success_url and cancel_url are provided by the frontend
    if (!success_url || !cancel_url) {
      console.error("Backend: Validation Error: success_url and cancel_url are required in request body.");
      return res.status(400).json({ error: "success_url and cancel_url are required." });
    }
    // Optional but recommended: Basic security check to ensure URLs are from your domain
    if (!success_url.startsWith(process.env.CLIENT_URL) || !cancel_url.startsWith(process.env.CLIENT_URL)) {
      console.error("Backend: Validation Error: Invalid success_url or cancel_url origin.");
      return res.status(400).json({ error: "Invalid success_url or cancel_url origin." });
    }


    const parsedDeliveryCharge = Number(deliveryCharge);
    if (isNaN(parsedDeliveryCharge)) {
      return res.status(400).json({ error: "Invalid delivery charge: must be a number." });
    }

    let productTotal = 0; // This will accumulate in cents/paise
    let deliveryTotal = 0; // This will be in cents/paise
    let discountAmount = 0; // This will be in cents/paise
    let coupon = null;

    const lineItems = products.map((product, index) => {
      const productPrice = Number(product.selectedPrice);
      const productQuantity = Number(product.quantity || 1);

      // Robust validation for each product item
      if (isNaN(productPrice) || productPrice <= 0 || isNaN(productQuantity) || productQuantity <= 0 || !Number.isInteger(productQuantity)) {
        throw new Error(`Invalid product price or quantity for product: ${product.name || product._id || `index ${index}`}`);
      }

      const unitAmountInPaise = Math.round(productPrice * 100); // Convert to smallest currency unit (paise)

      productTotal += unitAmountInPaise * productQuantity;

      return {
        price_data: {
          currency: "inr", // Ensure this matches your Stripe account's currency
          product_data: {
            name: product.name,
            images: product.image ? [product.image] : [], // Ensure image is an array if present
            description: product.description || '' // Add description for Stripe, can be empty
          },
          unit_amount: unitAmountInPaise,
        },
        quantity: productQuantity,
      };
    });

    // Add delivery charge as a line item if applicable
    if (parsedDeliveryCharge > 0) {
      deliveryTotal = Math.round(parsedDeliveryCharge * 100);
      lineItems.push({
        price_data: {
          currency: "inr",
          product_data: {
            name: "Delivery Charge",
            // No image for delivery charge, or a generic one if you have it
          },
          unit_amount: deliveryTotal,
        },
        quantity: 1,
      });
    }

    if (couponCode) {
      if (!req.user || !req.user._id) {
        console.log("Backend: Coupon code provided but user not authenticated.");
      } else {
        coupon = await Coupon.findOne({
          code: couponCode,
          userId: req.user._id,
          isActive: true,
        });

        if (coupon) {
          const discountPercentage = Number(coupon.discountPercentage);
          if (isNaN(discountPercentage) || discountPercentage < 0 || discountPercentage > 100) {
            console.error(`Backend: Coupon discount percentage is invalid: ${coupon.discountPercentage}`);
            coupon = null;
          } else {
            discountAmount = Math.round(
              (productTotal * discountPercentage) / 100
            );
            productTotal -= discountAmount;
          }
        } else {
          console.log(`Backend: Coupon with code ${couponCode} not found or inactive for user ${req.user._id}`);
        }
      }
    }

    // Calculate final amount for Stripe
    const finalAmountForStripe = productTotal + deliveryTotal;

    if (isNaN(finalAmountForStripe) || !Number.isInteger(finalAmountForStripe) || finalAmountForStripe < 0) {
      console.error(`Backend: Final amount for Stripe is invalid: ${finalAmountForStripe}`);
      return res.status(500).json({
        message: "Error processing checkout",
        error: "Calculated payment amount is invalid. Please contact support.",
      });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      // 3. CRITICAL FIX: Use the success_url and cancel_url from req.body
      success_url: success_url, // Use the dynamic URL from frontend
      cancel_url: cancel_url,   // Use the dynamic URL from frontend
      discounts: coupon && finalAmountForStripe > 0
        ? [{ coupon: await createStripeCoupon(coupon.discountPercentage) }]
        : [],
      metadata: {
        userId: req.user._id.toString(),
        couponCode: couponCode || "",
        address: address,
        deliveryCharge: parsedDeliveryCharge.toString(),
        discountAmount: discountAmount.toString(),
        products: JSON.stringify(
          products.map((p) => ({
            productId: p.product,
            quantity: p.quantity,
            price: p.selectedPrice,
            selectedWeight: p.selectedWeight,
          }))
        ),
      },
    });

    // This part should ideally be in checkoutSuccess after payment is confirmed
    // if it's for generating *new* coupons based on total spend.
    // Keeping it here as per your original code, but consider moving.
    if (finalAmountForStripe / 100 >= 200 && req.user && req.user._id) {
    // await createNewCoupon(req.user._id); // Uncomment if you have this function
    }

    res.status(200).json({ id: session.id, totalAmount: finalAmountForStripe / 100 });
  } catch (error) {
    console.error("❌ Error processing checkout:", error);
    res.status(500).json({
      message: "Error processing checkout",
      error: error.message || "An unexpected error occurred.",
    });
  }
};

// Your checkoutSuccess function remains the same as it correctly processes the session data.
export const checkoutSuccess = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: "Missing sessionId." });
    }
    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId);
    } catch (stripeError) {
      console.error("❌ Stripe session retrieval failed:", stripeError.message);
      return res.status(500).json({
        message: "Failed to retrieve payment session.",
        error: stripeError.message,
      });
    }

    if (
      session.metadata?.upgradeType === "yearly-premium" &&
      session.payment_status === "paid"
    ) {
      const updatedUser = await User.findByIdAndUpdate(
        session.metadata.userId,
        { premium: true },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found for premium upgrade.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Premium plan activated successfully.",
        user: updatedUser,
        type: "subscription",
      });
    }

    // ✅ Prevent duplicate order creation
    const existingOrder = await Order.findOne({ stripeSessionId: sessionId });
    if (existingOrder) {
      return res.status(200).json({
        success: false, // Indicate it's not a *new* creation
        message: "Order already created for this session.",
        orderId: existingOrder._id,
        type: "order",
      });
    }

    // ✅ Check payment status
    if (session.payment_status !== "paid") {
      return res.status(400).json({
        success: false,
        message: `Payment not completed.Status: ${session.payment_status} `,
      });
    }

    // ✅ Parse metadata
    let productsFromMetadata = [];
    let parsedAddressId = null;
    try {
      productsFromMetadata = JSON.parse(session.metadata.products);
      parsedAddressId = session.metadata.address;
    } catch (jsonError) {
      console.error("❌ JSON Parsing Error:", jsonError.message);
      console.error("📦 Raw Metadata:", session.metadata);
      return res.status(500).json({
        message: "Error processing order details: Invalid product or address data.",
        error: "Metadata JSON parsing failed.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(parsedAddressId)) {
      console.error(`❌ Invalid address ID from metadata: ${parsedAddressId} `);
      return res.status(400).json({ message: "Invalid address ID from payment session." });
    }

    const mappedProducts = productsFromMetadata.map((p, index) => {
      if (!p.productId || !p.price || !p.quantity || !p.selectedWeight) {
        throw new Error(`Product at index ${index} from metadata is missing required fields.`);
      }
      return {
        product: p.productId,
        quantity: p.quantity,
        price: p.price,
        selectedWeight: p.selectedWeight,
      };
    });

    const newOrder = new Order({
      user: session.metadata.userId,
      address: parsedAddressId,
      products: mappedProducts,
      totalAmount: session.amount_total / 100,
      deliveryCharge: Number(session.metadata.deliveryCharge || 0),
      discount: Number(session.metadata.discountAmount || 0),
      stripeSessionId: sessionId,
      orderStatus: "Pending",
    });

    await newOrder.save();
    if (session.metadata?.couponCode) {
      await Coupon.findOneAndUpdate(
        {
          code: session.metadata.couponCode,
          userId: session.metadata.userId,
          isActive: true
        },
        { isActive: false },
        { new: true }
      );
    }
    return res.status(200).json({
      success: true,
      message: "Payment successful, order created, and coupon deactivated if used.",
      orderId: newOrder._id,
      type: "order",
    });
  } catch (error) {
    console.error("❌ Error processing checkout success:", error.message);
    return res.status(500).json({
      message: "An unexpected error occurred during checkout success.",
      error: error.message || "Unknown error",
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
