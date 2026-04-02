const express = require('express');
const router = express.Router();
const {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  previewCV
} = require('../../controllers/JobMatch/cvController');

// GET /api/job-match/cv/:studentId
router.get('/cv/:studentId', getTemplates);

// POST /api/job-match/cv/:studentId
router.post('/cv/:studentId', createTemplate);

// PUT /api/job-match/cv/template/:id
router.put('/cv/template/:id', updateTemplate);

// DELETE /api/job-match/cv/template/:id
router.delete('/cv/template/:id', deleteTemplate);

// GET /api/job-match/cv/preview/:id
router.get('/cv/preview/:id', previewCV);

module.exports = router;
