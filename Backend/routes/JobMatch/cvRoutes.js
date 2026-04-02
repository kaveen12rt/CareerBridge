import express from "express";
import {
  getTemplate,
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  previewCV,
} from "../../controllers/JobMatch/cvController.js";

const router = express.Router();

// GET /api/job-match/cv/:studentId
router.get('/cv/:studentId', getTemplates);

// GET /api/job-match/cv/template/:id
router.get('/cv/template/:id', getTemplate);

// POST /api/job-match/cv/:studentId
router.post('/cv/:studentId', createTemplate);

// PUT /api/job-match/cv/template/:id
router.put('/cv/template/:id', updateTemplate);

// DELETE /api/job-match/cv/template/:id
router.delete('/cv/template/:id', deleteTemplate);

// GET /api/job-match/cv/preview/:id
router.get('/cv/preview/:id', previewCV);

export default router;
