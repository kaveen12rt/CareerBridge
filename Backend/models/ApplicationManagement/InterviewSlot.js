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

  interviewDate: {
    type: String,
    required: true
  },

  interviewTime: {
    type: String,
    required: true
  },

  isBooked: {
    type: Boolean,
    default: false
  }

});

module.exports = mongoose.model("InterviewSlot", interviewSlotSchema);