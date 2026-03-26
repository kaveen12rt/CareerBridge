const Application = require("../../models/ApplicationManagement/Application");

exports.applyJob = async (req, res) => {
  try {
    const { studentId, jobId } = req.body;
    const activeApplications = await Application.countDocuments({
      studentId,
      status: { $in: ["Applied", "InterviewBooked"] }
    });
    if (activeApplications >= 2) {
      return res.status(400).json({ message: "Only 2 active applications allowed" });
    }
    const application = new Application({ studentId, jobId });
    await application.save();
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find();
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getApplicationsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const applications = await Application.find({ studentId });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.withdrawApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id);
    if (!application) return res.status(404).json({ message: "Application not found" });
    if (application.status !== "Applied") {
      return res.status(400).json({ message: "Only Applied applications can be withdrawn" });
    }
    application.status = "Withdrawn";
    await application.save();
    res.json({ message: "Application withdrawn", application });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.cancelApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id);
    if (!application) return res.status(404).json({ message: "Application not found" });
    application.status = "Cancelled";
    await application.save();
    res.json({ message: "Application cancelled", application });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
