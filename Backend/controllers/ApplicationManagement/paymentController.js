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