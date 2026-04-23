import express from 'express';
import { authenticate } from '../../middlewares/authMiddleware.js';
import {
  getPremiumStatus,
  purchasePremium,
  getPurchaseHistory,
} from '../../controllers/JobMatch/premiumPurchaseController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET  /api/job-match/premium/status   — check if current user is premium
router.get('/premium/status', getPremiumStatus);

// POST /api/job-match/premium/purchase — process card payment
router.post('/premium/purchase', purchasePremium);

// GET  /api/job-match/premium/history  — admin: all purchases
router.get('/premium/history', getPurchaseHistory);

export default router;
