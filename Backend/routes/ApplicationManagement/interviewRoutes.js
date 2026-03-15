const express = require("express");
const router = express.Router();

const interviewController = require("../../controllers/ApplicationManagement/interviewBookingController");

router.post("/book", interviewController.bookInterview);

module.exports = router;