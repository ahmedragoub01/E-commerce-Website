import mongoose, { Schema, models } from "mongoose";

const CartSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: [{ product: { type: Schema.Types.ObjectId, ref: "Product" }, quantity: Number, price: Number }],
    total: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Cart = models.Cart || mongoose.model("Cart", CartSchema);
export default Cart;
