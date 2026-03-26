const express = require("express");
const router = express.Router();
const paymentController = require("../../controllers/ApplicationManagement/paymentController");

router.post("/create", paymentController.createPayment);
router.get("/", paymentController.getAllPayments);
router.get("/student/:studentId", paymentController.getPaymentsByStudent);
router.get("/application/:applicationId", paymentController.getPaymentByApplication);
router.patch("/:id/status", paymentController.updatePaymentStatus);

module.exports = router;
