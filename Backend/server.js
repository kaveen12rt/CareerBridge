import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import authRoutes from "./routes/UserManagement/authRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import jobRoutes from "./routes/CompanyJobs/jobRoutes.js";
import interviewSlotRoutes from "./routes/CompanyJobs/interviewSlotRoutes.js";
import applicationRoutes from "./routes/JobMatch/applicationRoutes.js";
import paymentRoutes from "./routes/JobMatch/paymentRoutes.js";
import cvRoutes from "./routes/JobMatch/cvRoutes.js";
import matchingSettingsRoutes from "./routes/JobMatch/matchingSettingsRoutes.js";
import premiumPurchaseRoutes from "./routes/JobMatch/premiumPurchaseRoutes.js";

// Load environment variables
dotenv.config();

const app = express();

// MIDDLEWARE
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// ROUTES
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CareerBridge API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/interview-slots", interviewSlotRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/job-match", cvRoutes);
app.use("/api/job-match", matchingSettingsRoutes);
app.use("/api/job-match", premiumPurchaseRoutes);

// 404 HANDLER
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ERROR HANDLER
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// DATABASE CONNECTION
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

// START SERVER
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 CareerBridge API running on port ${PORT}`);
    console.log(`📧 Email: ${process.env.GMAIL_USER}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  });
};

startServer();

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  process.exit(1);
});

export default app;