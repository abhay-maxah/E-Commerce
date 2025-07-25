import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"]
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      minlength: [8, "Password must be at least 8 characters"],
    },
    image: {
      type: String
    },
    cartItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        selectedWeight: {
          type: String,
          required: true,
        },
        selectedPrice: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
      }
    ],
    savedForLaterItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        selectedWeight: {
          type: String,
          required: true,
        },
        selectedPrice: {
          type: Number,
          required: true,
        },
      }
    ],
    role: {
      type: String,
      enum: ["user", "admin"],  
      default: "user"
    },
    premium: {
      type: Boolean,
      default: false
    },
  },
  {
    timestamps: true
  }
);

// Indexes
userSchema.index({ name: 1 });  // Index on name


// Pre-save hook for hashing password before saving to database
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare Password Method
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
