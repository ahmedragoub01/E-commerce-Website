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
  },
  { timestamps: true }
);

const User = models.User || mongoose.model("User", UserSchema);
export default User;
