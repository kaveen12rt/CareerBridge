import express from "express";
import {
  createContactMessage,
  getAllContactMessages,
} from "../controllers/contactController.js";
import { optionalAuth, authenticate, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", optionalAuth, createContactMessage);
router.get("/", authenticate, adminOnly, getAllContactMessages);

export default router;