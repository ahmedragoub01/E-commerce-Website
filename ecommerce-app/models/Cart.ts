import mongoose, { Schema, models } from 'mongoose';

const CartItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  note: {
    type: String,
    default: '', // Optional field for user notes
  },
});

const CartSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [CartItemSchema],
  total: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

const Cart = models.Cart || mongoose.model('Cart', CartSchema);
export default Cart;