import mongoose, { Schema, models } from 'mongoose';

const BidSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const AuctionSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    startingPrice: {
      type: Number,
      required: true,
    },
    currentPrice: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    bids: [BidSchema],
    winner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['upcoming', 'active', 'ended', 'completed'],
      default: 'upcoming',
    },
    isPaid: {
      type: Boolean,
      default: false, // Default to unpaid until the winner completes payment
    },
  },
  { timestamps: true }
);

const Auction = models.Auction || mongoose.model('Auction', AuctionSchema);
export default Auction;
