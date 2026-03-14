const express = require("express");
const router = express.Router();

const applicationController = require("../../controllers/ApplicationManagement/applicationController");

router.post("/apply", applicationController.applyJob);

module.exports = router;