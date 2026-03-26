const express = require("express");
const router = express.Router();
const interviewController = require("../../controllers/ApplicationManagement/interviewBookingController");

router.post("/slots", interviewController.createSlot);
router.post("/book", interviewController.bookInterview);
router.get("/slots/job/:jobId", interviewController.getAvailableSlots);
router.get("/slots/job/:jobId/all", interviewController.getAllSlotsByJob);
router.get("/slots/student/:studentId", interviewController.getSlotsByStudent);
router.patch("/slots/:slotId/cancel", interviewController.cancelBooking);

module.exports = router;
