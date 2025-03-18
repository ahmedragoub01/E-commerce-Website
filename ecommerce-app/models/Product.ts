import mongoose, { Schema, models } from 'mongoose';

const ProductSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  price: {
    type: Number,
    required: true,
  },
  images: [String],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  inventory: {
    type: Number,
    default: 0,
  },
  isAuction: {
    type: Boolean,
    default: false,
  },
  auctionEndDate: Date,
  currentBid: Number,
}, { timestamps: true });

const Product = models.Product || mongoose.model('Product', ProductSchema);
export default Product;