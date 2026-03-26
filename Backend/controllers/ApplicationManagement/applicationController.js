const Application = require("../../models/ApplicationManagement/Application");

exports.applyJob = async (req, res) => {

  try {

    const { studentId, jobId } = req.body;

    const activeApplications = await Application.countDocuments({
      studentId,
      status: "Applied"
    });

    if (activeApplications >= 2) {
      return res.status(400).json({
        message: "Only 2 active applications allowed"
      });
    }

    const application = new Application({
      studentId,
      jobId
    });

    await application.save();

    res.status(201).json(application);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};