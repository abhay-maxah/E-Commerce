import Product from "../models/product.model.js";

export const addToCart = async (req, res) => {
  try {
    let { productId, selectedPrice, selectedWeight } = req.body;
    const user = req.user;

    // Basic input validation
    if (!productId || !selectedPrice || !selectedWeight) {
      return res.status(400).json({
        message: "productId, selectedPrice, and selectedWeight are required.",
      });
    }

    selectedWeight = selectedWeight.trim().toLowerCase();
    selectedPrice = Number(selectedPrice);

    if (isNaN(selectedPrice) || selectedPrice <= 0) {
      return res.status(400).json({ message: "Invalid selectedPrice value." });
    }

    const productDetails = await Product.findById(productId, "_id name description images");
    if (!productDetails) {
      return res.status(404).json({ message: "Product not found." });
    }

    if (!Array.isArray(user.cartItems)) {
      user.cartItems = [];
    }
    user.cartItems = user.cartItems.filter(
      (item) => item && typeof item === "object" && item.product
    );

    const existingItem = user.cartItems.find(
      (item) =>
        item.product.toString() === productId &&
        item.selectedPrice === selectedPrice &&
        item.selectedWeight.toLowerCase() === selectedWeight
    );

    let message;
    let finalCartItemForResponse; 

    if (existingItem) {
      existingItem.quantity += 1;
      message = "Quantity updated";

      finalCartItemForResponse = existingItem;
    } else {
      const newItem = {
        product: productId,
        selectedPrice,
        selectedWeight,
        quantity: 1,
      };
      user.cartItems.push(newItem); 
    }

    await user.save();
    if (!finalCartItemForResponse) {
      finalCartItemForResponse = user.cartItems.find(
        (item) =>
          item.product.toString() === productId &&
          item.selectedPrice === selectedPrice &&
          item.selectedWeight.toLowerCase() === selectedWeight &&
          item.quantity === 1
      );
      if (!finalCartItemForResponse) {
        // Fallback or error if it's somehow not found after saving (unlikely)
        console.error("Error: Newly added item not found after save!");
        return res.status(500).json({ message: "Failed to retrieve added cart item." });
      }
      message = "Item added to cart"; // Message for new items
    }


    // Construct the response object with all necessary details
    const responseCartItem = {
      _id: finalCartItemForResponse._id,       // Guaranteed to have _id now
      product: productDetails._id,           // Product's _id
      name: productDetails.name,
      description: productDetails.description,
      image: productDetails.images && productDetails.images.length > 0
        ? productDetails.images[0]
        : null,
      selectedWeight: finalCartItemForResponse.selectedWeight,
      selectedPrice: finalCartItemForResponse.selectedPrice,
      quantity: finalCartItemForResponse.quantity,
    };

    res.json({ message, cartItem: responseCartItem });

  } catch (error) {
    console.error("Error in addToCart controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const updateQuantity = async (req, res) => {
  try {
    const { id: cartItemId } = req.params; // Renamed 'product' to 'cartItemId' for clarity as it's the cart item's _id
    const { quantity } = req.body;
    const user = req.user;

    if (!cartItemId || quantity == null) {
      return res.status(400).json({ message: "Cart item ID and quantity are required." });
    }

    const existingItem = user.cartItems.find(
      (item) => item._id.toString() === cartItemId.toString()
    );

    if (!existingItem) {
      return res.status(404).json({ message: "Cart item not found." });
    }

    if (quantity === 0) {
      // If quantity is zero, remove the item from cart
      user.cartItems = user.cartItems.filter( // Corrected from user.product to user.cartItems
        (item) => item._id.toString() !== cartItemId.toString()
      );
      // If an item is removed, send back the removed item (or a success message)
      // For this specific request, we'll send a success message and let the frontend handle the removal
    } else {
      // Update quantity
      existingItem.quantity = quantity;
    }

    await user.save();

    // Find the updated item to send back in the response (if not removed)
    const updatedItem = user.cartItems.find(
      (item) => item._id.toString() === cartItemId.toString()
    );

    return res.json({
      message: "Cart updated successfully",
      cartItem: updatedItem, // Send only the updated cart item (or null if removed)
      // If quantity was 0 and item removed, updatedItem will be undefined, which is fine
      // The frontend should handle null/undefined for cartItem accordingly.
    });
  } catch (error) {
    console.error("Error in updateQuantity controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getCartProducts = async (req, res) => {
  try {
    // Ensure req.user.cartItems exists and is an array
    if (!req.user || !Array.isArray(req.user.cartItems)) {
      return res.status(400).json({ message: "Cart data not found or invalid." });
    }

    // Extract all unique product IDs from the cartItems
    const productIds = req.user.cartItems.map((item) => item.product);

    // Fetch product details (name, images, and description) for all unique product IDs
    const products = await Product.find(
      { _id: { $in: productIds } },
      "name images description" // <--- Added 'description' here
    );

    // Create a map for quick lookup of product details by their _id
    const productMap = new Map();
    products.forEach((p) => {
      productMap.set(p._id.toString(), p);
    });

    // Combine cart item details with product details
    const cartItemsWithDetails = req.user.cartItems.map((cartItem) => {
      const productDetails = productMap.get(cartItem.product.toString());

      // If product details aren't found (e.g., product was deleted),
      // you might want to handle this gracefully (e.g., skip or return a placeholder).
      if (!productDetails) {
        console.warn(`Product with ID ${cartItem.product} not found for cart item.`);
        return null; // This item will be filtered out
      }

      return {
        _id: cartItem._id, // The unique ID of this specific cart entry
        product: cartItem.product, // The original product ObjectId
        name: productDetails.name,
        description: productDetails.description, // Description is now available
        image:
          productDetails.images && productDetails.images.length > 0
            ? productDetails.images[0]
            : null, // Get the first image, or null if no images
        selectedWeight: cartItem.selectedWeight,
        selectedPrice: cartItem.selectedPrice,
        quantity: cartItem.quantity,
      };
    }).filter(Boolean); // Filter out any null entries if products weren't found
    return res.json({
      message: "Cart item fetched successfully.",
      cart: cartItemsWithDetails,
    });
  } catch (error) {
    console.error("Error in getCartProduct controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const removeAllFromCart = async (req, res) => {
  try {
    const { cartItemId } = req.body;
    const user = req.user;

    if (!cartItemId) {
      return res.status(400).json({ message: "Cart item ID is required." });
    }

    const itemIndex = user.cartItems.findIndex(
      (item) => item._id.toString() === cartItemId.toString()
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Cart item not found." });
    }
    const [removedItem] = user.cartItems.splice(itemIndex, 1); 

    await user.save();

    return res.json({
      message: "Cart item removed successfully.",
      removedItem: removedItem,
    });
  } catch (error) {
    console.error("Error in removeAllFromCart controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const cleanCartAfterPurchese = async (req, res) => {
  try {
    const user = req.user;
    user.cartItems = [];
    await user.save();
    res.json({ message: "cart clean SucessFull", cart: user.cart });
  } catch (error) {
    console.log("Error in cleanCartAfterPurchese controller", error.message);
    res.status(500).json({ message: "server error", error: error.message });
  }
};
