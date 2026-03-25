import express from "express";
import {
  getAllFeedback,
  getMyFeedback,
  createFeedback,
  updateFeedback,
  deleteFeedback,
} from "../controllers/feedbackController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getAllFeedback);
router.get("/mine", authenticate, getMyFeedback);
router.post("/", authenticate, createFeedback);
router.put("/:feedbackId", authenticate, updateFeedback);
router.delete("/:feedbackId", authenticate, deleteFeedback);

export default router;