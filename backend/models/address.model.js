import mongoose from "mongoose";
const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  houseName: {
    type: String,
    required:[true,"HouseName is required"]
  },
  streetAddress: {
    type: String,
    required:[true,"StreetAddress is required"]
  },
  optionalAddress: {
    type: String,
  },
  city: {
    type: String,
    required:[true,"City Name is required"]

  },
  state: {
    type: String,
    required:[true,"State Name is required"]
  },
  zipCode: {
    type: Number,
    required:[true,"ZipCode is required"]
  },
  phoneNumber: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^\d{10,}$/.test(v); // Ensures at least 10 digits
      },
      message: "Phone number must be at least 10 digits long",
    },
  },
});

const Address = mongoose.model("Address", addressSchema);
export default Address;
