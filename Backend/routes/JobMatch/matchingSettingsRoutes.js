const express = require('express');
const router = express.Router();
const {
  getSettings,
  upsertSettings,
  clearSettings,
  previewMatches
} = require('../../controllers/JobMatch/matchingSettingsController');

// GET /api/job-match/settings/:studentId
router.get('/settings/:studentId', getSettings);

// PUT /api/job-match/settings/:studentId
router.put('/settings/:studentId', upsertSettings);

// DELETE /api/job-match/settings/:studentId
router.delete('/settings/:studentId', clearSettings);

// GET /api/job-match/preview/:studentId
router.get('/preview/:studentId', previewMatches);

module.exports = router;
