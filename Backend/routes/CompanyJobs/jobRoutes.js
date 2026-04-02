import express from "express";
import {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getJobsStats,
  createSampleJobs,
} from "../../controllers/CompanyJobs/jobController.js";

const router = express.Router();

// GET /api/jobs - Get all jobs
router.get("/", getAllJobs);

// POST /api/jobs/sample - Create sample jobs for testing
router.post("/sample", createSampleJobs);

// GET /api/jobs/stats - Get jobs statistics for dashboard
router.get("/stats", getJobsStats);

// GET /api/jobs/:id - Get single job
router.get("/:id", getJobById);

// POST /api/jobs - Create new job
router.post("/", createJob);

// PUT /api/jobs/:id - Update job
router.put("/:id", updateJob);

// DELETE /api/jobs/:id - Delete job
router.delete("/:id", deleteJob);

export default router;