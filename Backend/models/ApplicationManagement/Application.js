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
    enum: ["Applied", "InterviewBooked", "Withdrawn", "Completed"],
    default: "Applied"
  },

  appliedDate: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Application", applicationSchema);