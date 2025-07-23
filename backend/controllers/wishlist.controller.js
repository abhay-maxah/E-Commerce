import User from "../models/user.model.js";

export const addToSaveForLater = async (req, res) => {
  const userId = req.user._id;
  const { productId, selectedWeight, selectedPrice } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const alreadySaved = user.savedForLaterItems.find(
      (item) =>
        item.product.toString() === productId &&
        item.selectedWeight === selectedWeight &&
        item.selectedPrice === selectedPrice
    );

    if (alreadySaved) {
      return res
        .status(400)
        .json({ message: "Product already saved for later" });
    }

    user.savedForLaterItems.push({
      product: productId,
      selectedWeight,
      selectedPrice,
    });

    await user.save();

    res.status(200).json({
      message: "Item saved for later",
      savedItem: user.savedForLaterItems.at(-1),
    });
  } catch (err) {
    res.status(500).json({ message: "Error saving item", error: err.message });
  }
};

export const removeFromSaveForLater = async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.savedForLaterItems = user.savedForLaterItems.filter(
      (item) => item.product.toString() !== productId
    );

    await user.save();

    res.status(200).json({
      message: "Item removed from saved items",
      savedForLaterItems: user.savedForLaterItems,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error removing item", error: err.message });
  }
};
export const getSavedForLaterItems = async (req, res) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId).populate(
      "savedForLaterItems.product"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user.savedForLaterItems);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching saved items", error: err.message });
  }
};

