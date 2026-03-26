const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  studentNumber: {
    type: String,
    unique: true,
    sparse: true
  }
}, { strict: false });

module.exports = mongoose.models.Student || mongoose.model("Student", studentSchema);
