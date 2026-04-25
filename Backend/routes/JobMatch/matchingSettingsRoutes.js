import express from 'express';
import { authenticate } from '../../middlewares/authMiddleware.js';
import {
  getSettings,
  upsertSettings,
  clearSettings,
  previewMatches
} from '../../controllers/JobMatch/matchingSettingsController.js';

const router = express.Router();

// All settings routes require authentication
router.use(authenticate);

// GET    /api/job-match/settings
router.get('/settings', getSettings);

// PUT    /api/job-match/settings
router.put('/settings', upsertSettings);

// DELETE /api/job-match/settings
router.delete('/settings', clearSettings);

// GET    /api/job-match/preview
router.get('/preview', previewMatches);

export default router;
