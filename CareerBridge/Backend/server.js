const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/applications", require("./routes/ApplicationManagement/applicationRoutes"));
app.use("/api/interviews", require("./routes/ApplicationManagement/interviewRoutes"));
app.use("/api/payments", require("./routes/ApplicationManagement/paymentRoutes"));
app.use("/api/students", require("./routes/ApplicationManagement/studentRoutes"));
app.use("/api/jobs", require("./routes/ApplicationManagement/jobRoutes"));

app.get("/", (req, res) => {
  res.json({ message: "CareerBridge API is running" });
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => console.error(err));
