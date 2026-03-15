const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({

  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },

  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Application",
    required: true
  },

  amount: {
    type: Number,
    required: true
  },

  paymentStatus: {
    type: String,
    enum: ["Pending", "Completed", "Failed"],
    default: "Pending"
  },

  paymentDate: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Payment", paymentSchema);