const InterviewSlot = require("../../models/ApplicationManagement/InterviewSlot");
const Application = require("../../models/ApplicationManagement/Application");

exports.createSlot = async (req, res) => {
  try {
    const { jobId, interviewDate, interviewTime, date, time } = req.body;
    const slot = new InterviewSlot({
      jobId,
      date: date || interviewDate,
      time: time || interviewTime
    });
    await slot.save();
    res.status(201).json(slot);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAvailableSlots = async (req, res) => {
  try {
    const { jobId } = req.params;
    const slots = await InterviewSlot.find({ jobId, isBooked: false });
    res.json(slots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllSlotsByJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const slots = await InterviewSlot.find({ jobId });
    res.json(slots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.bookInterview = async (req, res) => {
  try {
    const { slotId, studentId, applicationId } = req.body;
    const slot = await InterviewSlot.findById(slotId);
    if (!slot) return res.status(404).json({ message: "Slot not found" });
    if (slot.isBooked) return res.status(400).json({ message: "Slot already booked" });
    slot.studentId = studentId;
    slot.isBooked = true;
    await slot.save();
    if (applicationId) {
      await Application.findByIdAndUpdate(applicationId, { status: "InterviewBooked" });
    }
    res.json({ message: "Interview slot booked successfully", slot });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSlotsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const slots = await InterviewSlot.find({ studentId, isBooked: true });
    res.json(slots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { slotId } = req.params;
    const slot = await InterviewSlot.findById(slotId);
    if (!slot) return res.status(404).json({ message: "Slot not found" });
    slot.studentId = null;
    slot.isBooked = false;
    await slot.save();
    res.json({ message: "Booking cancelled", slot });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
