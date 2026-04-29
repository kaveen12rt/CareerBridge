import express from "express";
import {
  getInterviewSlotsByJob,
  getInterviewSlotById,
  createInterviewSlot,
  updateInterviewSlot,
  deleteInterviewSlot,
  bookInterviewSlot,
  cancelInterviewSlot,
  getAvailableSlots,
  getAllInterviewSlots,
} from "../../controllers/CompanyJobs/interviewSlotController.js";

const router = express.Router();

// Admin: all slots across all jobs (must be before /:id)
router.get("/admin/all", getAllInterviewSlots);

// GET /api/interview-slots/job/:jobId
router.get("/job/:jobId", getInterviewSlotsByJob);

// GET /api/interview-slots/job/:jobId/available
router.get("/job/:jobId/available", getAvailableSlots);

// GET /api/interview-slots/:id
router.get("/:id", getInterviewSlotById);

// POST /api/interview-slots
router.post("/", createInterviewSlot);

// PUT /api/interview-slots/:id
router.put("/:id", updateInterviewSlot);

// DELETE /api/interview-slots/:id
router.delete("/:id", deleteInterviewSlot);

// POST /api/interview-slots/:id/book
router.post("/:id/book", bookInterviewSlot);

// POST /api/interview-slots/:id/cancel
router.post("/:id/cancel", cancelInterviewSlot);

export default router;