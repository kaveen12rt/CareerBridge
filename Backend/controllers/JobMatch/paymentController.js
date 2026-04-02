import mongoose from "mongoose";
import Payment from "../../models/JobMatch/Payment.js";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/payments/application/:applicationId
// Fetch the payment record for a specific application.
// ─────────────────────────────────────────────────────────────────────────────
const getPaymentByApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({ message: "Invalid application ID." });
    }

    const payment = await Payment.findOne({ applicationId })
      .populate("jobId", "title companyName")
      .populate("applicationId", "status slotId");

    if (!payment) {
      return res
        .status(404)
        .json({ message: "No payment record found for this application." });
    }
    res.json(payment);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching payment record.", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/payments/student/:studentId
// All payment records for a student, newest first.
// ─────────────────────────────────────────────────────────────────────────────
const getStudentPayments = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid student ID." });
    }

    const payments = await Payment.find({ studentId })
      .populate("jobId", "title companyName")
      .populate("applicationId", "status")
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching payment records.", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/payments/:id/complete
// Mark a pending payment as completed (simulate successful payment).
// ─────────────────────────────────────────────────────────────────────────────
const markPaymentCompleted = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid payment ID." });
    }

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found." });
    }
    if (payment.status !== "pending") {
      return res.status(400).json({
        message: `Cannot complete a payment that is already "${payment.status}".`,
      });
    }

    payment.status = "completed";
    payment.paidAt = new Date();
    await payment.save();

    res.json({ message: "Payment marked as completed.", payment });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error completing payment.", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/payments/:id/cancel
// Manually cancel a payment record.
// ─────────────────────────────────────────────────────────────────────────────
const cancelPayment = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid payment ID." });
    }

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found." });
    }
    if (payment.status === "cancelled") {
      return res.status(400).json({ message: "Payment is already cancelled." });
    }

    payment.status = "cancelled";
    payment.cancelledAt = new Date();
    await payment.save();

    res.json({ message: "Payment cancelled.", payment });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error cancelling payment.", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/payments/admin/all
// All payment records for the admin dashboard, newest first.
// ─────────────────────────────────────────────────────────────────────────────
const getAllPayments = async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const payments = await Payment.find()
      .populate("studentId", "firstName lastName")
      .populate("jobId", "title companyName")
      .sort({ createdAt: -1 })
      .limit(Number(limit));
    res.json(payments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching all payments.", error: error.message });
  }
};

export {
  getPaymentByApplication,
  getStudentPayments,
  markPaymentCompleted,
  cancelPayment,
  getAllPayments,
};
