import mongoose from "mongoose";
const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  houseName: {
    type: String,
    required: [true, "HouseName is required"],
  },
  streetAddress: {
    type: String,
    required: [true, "StreetAddress is required"],
  },
  optionalAddress: {
    type: String,
  },
  isVisible: {
    type: Boolean,
    default: true,
  },
  city: {
    type: String,
    required: [true, "City Name is required"],
  },
  state: {
    type: String,
    required: [true, "State Name is required"],
  },
  zipCode: {
    type: Number,
    required: [true, "ZipCode is required"],
  },
  phoneNumber: {
    type: String,
    required: true,
    maxlength: 10,
    minlength: 10,
  },
},);

const Address = mongoose.model("Address", addressSchema);
export default Address;
