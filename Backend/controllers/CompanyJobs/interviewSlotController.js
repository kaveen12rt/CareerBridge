import InterviewSlot from "../../models/CompanyJobs/InterviewSlot.js";
import Job from "../../models/CompanyJobs/Job.js";
import mongoose from "mongoose";

// GET all slots for a job
const getInterviewSlotsByJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid job ID" });
    }

    const slots = await InterviewSlot.find({ jobId }).sort({ date: 1, time: 1 });
    res.json(slots);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching interview slots",
      error: error.message,
    });
  }
};

// GET available slots for a job
const getAvailableSlots = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid job ID" });
    }

    const slots = await InterviewSlot.find({
      jobId,
      isBooked: false,
      status: "available",
    }).sort({ date: 1, time: 1 });

    res.json(slots);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching available slots",
      error: error.message,
    });
  }
};

// GET single slot by ID
const getInterviewSlotById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid interview slot ID" });
    }

    const slot = await InterviewSlot.findById(id);

    if (!slot) {
      return res.status(404).json({ message: "Interview slot not found" });
    }

    res.json(slot);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching interview slot",
      error: error.message,
    });
  }
};

// CREATE new slot
const createInterviewSlot = async (req, res) => {
  try {
    const {
      jobId,
      date,
      time,
      duration,
      type,
      location,
      meetingLink,
      notes,
    } = req.body;

    if (!jobId || !date || !time) {
      return res.status(400).json({
        message: "jobId, date, and time are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid job ID" });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const slot = new InterviewSlot({
      jobId,
      date,
      time,
      duration,
      type,
      location,
      meetingLink,
      notes,
    });

    const savedSlot = await slot.save();
    res.status(201).json(savedSlot);
  } catch (error) {
    res.status(500).json({
      message: "Error creating interview slot",
      error: error.message,
    });
  }
};

// UPDATE slot
const updateInterviewSlot = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid interview slot ID" });
    }

    const slot = await InterviewSlot.findById(id);

    if (!slot) {
      return res.status(404).json({ message: "Interview slot not found" });
    }

    const updatedSlot = await InterviewSlot.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json(updatedSlot);
  } catch (error) {
    res.status(500).json({
      message: "Error updating interview slot",
      error: error.message,
    });
  }
};

// DELETE slot
const deleteInterviewSlot = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid interview slot ID" });
    }

    const slot = await InterviewSlot.findById(id);

    if (!slot) {
      return res.status(404).json({ message: "Interview slot not found" });
    }

    await InterviewSlot.findByIdAndDelete(id);

    res.json({ message: "Interview slot deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting interview slot",
      error: error.message,
    });
  }
};

// BOOK slot
const bookInterviewSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { bookedBy } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid interview slot ID" });
    }

    const slot = await InterviewSlot.findById(id);

    if (!slot) {
      return res.status(404).json({ message: "Interview slot not found" });
    }

    if (slot.isBooked) {
      return res.status(400).json({ message: "Interview slot is already booked" });
    }

    slot.isBooked = true;
    slot.bookedBy = bookedBy || null;
    slot.bookedAt = new Date();
    slot.status = "booked";

    await slot.save();

    res.json({
      message: "Interview slot booked successfully",
      slot,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error booking interview slot",
      error: error.message,
    });
  }
};

// CANCEL booking
const cancelInterviewSlot = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid interview slot ID" });
    }

    const slot = await InterviewSlot.findById(id);

    if (!slot) {
      return res.status(404).json({ message: "Interview slot not found" });
    }

    slot.isBooked = false;
    slot.bookedBy = null;
    slot.bookedAt = null;
    slot.status = "available";

    await slot.save();

    res.json({
      message: "Interview booking cancelled successfully",
      slot,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error cancelling interview booking",
      error: error.message,
    });
  }
};

export {
  getInterviewSlotsByJob,
  getInterviewSlotById,
  createInterviewSlot,
  updateInterviewSlot,
  deleteInterviewSlot,
  bookInterviewSlot,
  cancelInterviewSlot,
  getAvailableSlots,
};