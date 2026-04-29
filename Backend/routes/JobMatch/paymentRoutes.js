import express from "express";
import {
  getPaymentByApplication,
  getStudentPayments,
  markPaymentCompleted,
  cancelPayment,
  getAllPayments,
} from "../../controllers/JobMatch/paymentController.js";

const router = express.Router();

// ── Admin: all payments ─────────────────────────────────────────────────────
router.get("/admin/all", getAllPayments);

// ── Payment record for a specific application ───────────────────────────────
router.get("/application/:applicationId", getPaymentByApplication);

// ── All payment records for a student ───────────────────────────────────────
router.get("/student/:studentId", getStudentPayments);

// ── Mark payment as completed (simulate successful payment gateway callback) ─
router.put("/:id/complete", markPaymentCompleted);

// ── Manually cancel a payment record ────────────────────────────────────────
router.put("/:id/cancel", cancelPayment);

export default router;
