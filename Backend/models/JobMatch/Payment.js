import mongoose from "mongoose";

/**
 * A simulated payment record linked to an application's recruitment journey.
 * Created automatically when a student books an interview slot (status moves to
 * "interview_scheduled"). The amount field is intentionally zero by default so
 * integration with a real payment gateway can populate it later.
 */
const paymentSchema = new mongoose.Schema(
  {
    // One-to-one with Application after an interview is scheduled.
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      unique: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    currency: { type: String, default: "LKR" },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },
    // Simulated transaction reference for traceability.
    transactionRef: { type: String, trim: true },
    // Populated when status moves to "completed".
    paidAt: { type: Date, default: null },
    // Populated when status moves to "cancelled".
    cancelledAt: { type: Date, default: null },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

paymentSchema.index({ applicationId: 1 });
paymentSchema.index({ studentId: 1, status: 1 });

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
