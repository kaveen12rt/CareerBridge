import express from "express";
import {
  submitApplication,
  getStudentApplications,
  getJobApplications,
  getApplicationById,
  updateApplicationStatus,
  bookInterviewSlot,
  withdrawApplication,
  cancelInterview,
  getAdminStats,
  getAllApplications,
  adminUpdateApplicationStatus,
} from "../../controllers/JobMatch/applicationController.js";

const router = express.Router();

// ── Admin endpoints (must be before /:id to avoid ObjectId mismatch) ───────────
router.get("/admin/stats",        getAdminStats);
router.get("/admin/all",          getAllApplications);
router.put("/admin/:id/status",   adminUpdateApplicationStatus);

// ── Submit a new application ────────────────────────────────────────────────
router.post("/", submitApplication);

// ── Student views their own applications ────────────────────────────────────
router.get("/student/:studentId", getStudentApplications);

// ── Company views all applications for a job ────────────────────────────────
router.get("/job/:jobId", getJobApplications);

// ── Single application detail ────────────────────────────────────────────────
router.get("/:id", getApplicationById);

// ── Company: accept / review / reject ───────────────────────────────────────
router.put("/:id/status", updateApplicationStatus);

// ── Student: book an interview slot (atomic lock) ───────────────────────────
router.put("/:id/book-slot", bookInterviewSlot);

// ── Student: withdraw the application ───────────────────────────────────────
router.put("/:id/withdraw", withdrawApplication);

// ── Company: cancel a scheduled interview ───────────────────────────────────
router.put("/:id/cancel-interview", cancelInterview);

export default router;
