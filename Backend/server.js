const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Import routes
const jobRoutes = require('./routes/CompanyJobs/jobRoutes');
const interviewSlotRoutes = require('./routes/CompanyJobs/interviewSlotRoutes');
const jobSearchRoutes = require('./routes/JobMatch/jobSearchRoutes');
const matchingSettingsRoutes = require('./routes/JobMatch/matchingSettingsRoutes');
const cvRoutes = require('./routes/JobMatch/cvRoutes');

// Root route
app.get("/", (req, res) => {
  res.json({ message: "CareerBridge API is running" });
});

// API routes
app.use('/api/jobs', jobRoutes);
app.use('/api/interview-slots', interviewSlotRoutes);
app.use('/api/job-match', jobSearchRoutes);
app.use('/api/job-match', matchingSettingsRoutes);
app.use('/api/job-match', cvRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});