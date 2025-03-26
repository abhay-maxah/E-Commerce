import Address from "../models/address.model.js";
export const addAddress = async (req, res) => {
  try {
    const {
      user,
      houseName,
      streetAddress,
      optionalAddress,
      city,
      state,
      zipCode,
      phoneNumber,
    } = req.body;
    const newAddress = new Address({
      user,
      houseName,
      streetAddress,
      optionalAddress,
      city,
      state,
      zipCode,
      phoneNumber,
    });

    await newAddress.save();
    res
      .status(201)
      .json({ message: "Address added successfully", address: newAddress });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAddress = async (req, res) => {
  try {
    const addresses = await Address.find({
      user: req.user._id,
      isVisible: true,
    });
    res.status(200).json(addresses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const deletedAddress = await Address.findByIdAndDelete(addressId);
    if (!deletedAddress) {
      return res.status(404).json({ message: "Address not found" });
    }
    res.json({ message: "Address deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error });
  }
};
export const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const {
      houseName,
      streetAddress,
      optionalAddress,
      city,
      state,
      zipCode,
      phoneNumber,
    } = req.body;
    const updatedAddress = await Address.findByIdAndUpdate(
      addressId,
      {
        houseName,
        streetAddress,
        optionalAddress,
        city,
        state,
        zipCode,
        phoneNumber,
      },
      { new: true }
    );
    if (!updatedAddress) {
      return res.status(404).json({ message: "Address not found" });
    }
    res.json(updatedAddress);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error });
  }
};
export const togleVisiblity = async (req, res) => {
  try {
    const { addressId } = req.params;
    const address = await Address.findById(addressId);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }
    address.isVisible = !address.isVisible;
    await address.save();
    res.json(address);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Delete visiblity of address Error", error: error });
  }
};
