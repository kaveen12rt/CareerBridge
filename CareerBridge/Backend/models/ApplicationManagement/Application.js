const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true
  },
  status: {
    type: String,
    enum: ["Applied", "InterviewBooked", "Withdrawn", "Cancelled", "Completed"],
    default: "Applied"
  },
  appliedDate: {
    type: Date,
    default: Date.now
  }
}, { strict: false });

module.exports = mongoose.models.Application || mongoose.model("Application", applicationSchema);
