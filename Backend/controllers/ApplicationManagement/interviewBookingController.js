const InterviewSlot = require("../../models/ApplicationManagement/InterviewSlot");

exports.bookInterview = async (req, res) => {

  try {

    const { slotId, studentId } = req.body;

    const slot = await InterviewSlot.findById(slotId);

    if (slot.isBooked) {
      return res.status(400).json({
        message: "Slot already booked"
      });
    }

    slot.studentId = studentId;
    slot.isBooked = true;

    await slot.save();

    res.json({
      message: "Interview slot booked successfully",
      slot
    });

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};