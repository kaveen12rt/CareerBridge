const express = require("express");
const router = express.Router();
const applicationController = require("../../controllers/ApplicationManagement/applicationController");

router.post("/apply", applicationController.applyJob);
router.get("/", applicationController.getAllApplications);
router.get("/student/:studentId", applicationController.getApplicationsByStudent);
router.patch("/:id/withdraw", applicationController.withdrawApplication);
router.patch("/:id/cancel", applicationController.cancelApplication);

module.exports = router;
