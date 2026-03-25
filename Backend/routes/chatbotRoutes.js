import express from "express";
import {
  getChatSession,
  sendChatMessage,
  clearChatSession,
} from "../controllers/chatbotController.js";
import { optionalAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/session/:sessionId", optionalAuth, getChatSession);
router.post("/message", optionalAuth, sendChatMessage);
router.delete("/session/:sessionId", optionalAuth, clearChatSession);

export default router;