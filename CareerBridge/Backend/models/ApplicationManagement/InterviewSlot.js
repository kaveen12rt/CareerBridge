const mongoose = require("mongoose");

const interviewSlotSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student"
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  isBooked: {
    type: Boolean,
    default: false
  }
}, { strict: false });

module.exports = mongoose.models.InterviewSlot || mongoose.model("InterviewSlot", interviewSlotSchema);
