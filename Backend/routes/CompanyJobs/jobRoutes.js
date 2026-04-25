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
import { authenticate, companyOnly } from "../../middlewares/authMiddleware.js";

const router = express.Router();

// GET /api/jobs - Get all jobs
router.get("/", getAllJobs);

// GET /api/jobs/:id - Get single job
router.get("/:id", getJobById);

// POST /api/jobs - Create new job
router.post("/", authenticate, companyOnly, createJob);

// PUT /api/jobs/:id - Update job
router.put("/:id", authenticate, companyOnly, updateJob);

// DELETE /api/jobs/:id - Delete job
router.delete("/:id", authenticate, companyOnly, deleteJob);

// POST /api/jobs/sample - Create sample jobs for testing (company only)
router.post("/sample", authenticate, companyOnly, createSampleJobs);

// GET /api/jobs/stats - Get jobs statistics for dashboard (company only)
router.get("/stats", authenticate, companyOnly, getJobsStats);
export default router;