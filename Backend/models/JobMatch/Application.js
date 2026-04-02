import mongoose from "mongoose";

/**
 * Statuses that count as an "active" application for the 2-application rule.
 * Rejected / withdrawn / cancelled do NOT count.
 */
export const ACTIVE_STATUSES = ["pending", "reviewing", "accepted", "interview_scheduled"];

const applicationSchema = new mongoose.Schema(
  {
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
    // Denormalised from Job so company can query its own applications without a join.
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",             // just submitted, awaiting company review
        "reviewing",           // company is actively reviewing
        "accepted",            // company accepted; student must book a slot
        "rejected",            // company rejected
        "withdrawn",           // student withdrew before a decision
        "interview_scheduled", // student has booked an interview slot
      ],
      default: "pending",
    },
    // Set once the student books an interview slot.
    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InterviewSlot",
      default: null,
    },
    coverLetter: {
      type: String,
      trim: true,
      maxlength: [2000, "Cover letter cannot exceed 2000 characters"],
    },
    // Timestamped when the student explicitly withdraws.
    withdrawnAt: { type: Date, default: null },
    // Free-text note added by the company (reason for status changes etc.).
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

// Prevent the same student from submitting multiple applications to the same job.
applicationSchema.index({ studentId: 1, jobId: 1 }, { unique: true });

// Query performance for common lookups.
applicationSchema.index({ studentId: 1, status: 1 });
applicationSchema.index({ companyId: 1, status: 1 });
applicationSchema.index({ jobId: 1, status: 1 });

const Application = mongoose.model("Application", applicationSchema);
export default Application;
