const Payment = require("../../models/ApplicationManagement/Payment");

exports.createPayment = async (req, res) => {
  try {
    const payment = new Payment(req.body);
    await payment.save();
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find();
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPaymentsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const payments = await Payment.find({ studentId });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPaymentByApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const payment = await Payment.findOne({ applicationId });
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;
    const payment = await Payment.findByIdAndUpdate(id, { paymentStatus }, { new: true });
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.json({ message: "Payment status updated", payment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
