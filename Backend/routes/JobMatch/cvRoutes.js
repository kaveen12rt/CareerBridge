import express from "express";
import { authenticate } from "../../middlewares/authMiddleware.js";
import {
  getTemplate,
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  previewCV,
} from "../../controllers/JobMatch/cvController.js";

const router = express.Router();

// All CV routes require authentication
router.use(authenticate);

// GET  /api/job-match/cv/:studentId  — studentId kept in URL for backwards compat with frontend
router.get('/cv/:studentId', getTemplates);

// GET  /api/job-match/cv/template/:id
router.get('/cv/template/:id', getTemplate);

// POST /api/job-match/cv/:studentId
router.post('/cv/:studentId', createTemplate);

// PUT  /api/job-match/cv/template/:id
router.put('/cv/template/:id', updateTemplate);

// DELETE /api/job-match/cv/template/:id
router.delete('/cv/template/:id', deleteTemplate);

// GET  /api/job-match/cv/preview/:id
router.get('/cv/preview/:id', previewCV);

export default router;
