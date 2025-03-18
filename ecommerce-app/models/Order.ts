import mongoose, { Schema, models } from 'mongoose';

const OrderItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
  },
  quantity: Number,
  price: Number,
});

const OrderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [OrderItemSchema],
  total: Number,
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  paymentIntentId: String,
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  deliveryDate: Date, // New field for expected delivery date
  notes: String, // New field for additional notes or instructions
  discount: {
    type: Number,
    default: 0, // New field for discount applied to the order
  },
}, { timestamps: true });

const Order = models.Order || mongoose.model('Order', OrderSchema);
export default Order;