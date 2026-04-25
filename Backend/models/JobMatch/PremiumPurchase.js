import mongoose from 'mongoose';

/**
 * Records a premium template pack purchase for a user.
 * Uses simulated card processing — no real gateway integration.
 */
const premiumPurchaseSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ['premium_templates'],
      default: 'premium_templates',
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'LKR',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    // Last 4 digits of card — never store full card numbers
    cardLast4: {
      type: String,
      trim: true,
      default: '',
    },
    cardHolder: {
      type: String,
      trim: true,
      default: '',
    },
    transactionRef: {
      type: String,
      trim: true,
      default: '',
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

premiumPurchaseSchema.index({ userId: 1, status: 1 });

const PremiumPurchase = mongoose.model('PremiumPurchase', premiumPurchaseSchema);
export default PremiumPurchase;
