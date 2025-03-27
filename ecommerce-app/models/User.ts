import mongoose, { Schema, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: String,
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: String,
    emailVerified: Date,
    image: String,
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    verificationToken: String,
    verificationTokenExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    // Added fields
    isBlacklisted: {
      type: Boolean,
      default: false, // Default to false, will be set to true if penalized
    },
    cart: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product", // Reference to the product model
        },
        auctionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Auction", // Reference to the auction
        },
        addedAt: {
          type: Date,
          default: Date.now, // Track when the item was added
        },
      },
    ],
  },
  { timestamps: true }
);

const User = models.User || mongoose.model("User", UserSchema);
export default User;
