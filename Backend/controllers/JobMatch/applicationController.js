import mongoose from "mongoose";
import Application, { ACTIVE_STATUSES } from "../../models/JobMatch/Application.js";
import InterviewSlot from "../../models/CompanyJobs/InterviewSlot.js";
import Job from "../../models/CompanyJobs/Job.js";
import Payment from "../../models/JobMatch/Payment.js";

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/applications
// Student submits a job application. Enforces the 2-active-application rule.
// ─────────────────────────────────────────────────────────────────────────────
const submitApplication = async (req, res) => {
  try {
    const { studentId, jobId, coverLetter } = req.body;

    if (!studentId || !jobId) {
      return res.status(400).json({ message: "studentId and jobId are required" });
    }
    if (
      !mongoose.Types.ObjectId.isValid(studentId) ||
      !mongoose.Types.ObjectId.isValid(jobId)
    ) {
      return res.status(400).json({ message: "Invalid studentId or jobId" });
    }

    // Prevent duplicate application to the same job.
    const alreadyApplied = await Application.findOne({ studentId, jobId });
    if (alreadyApplied) {
      return res.status(409).json({ message: "You have already applied for this job." });
    }

    // ── 2-active-application rule ──────────────────────────────────────────
    const activeCount = await Application.countDocuments({
      studentId,
      status: { $in: ACTIVE_STATUSES },
    });
    if (activeCount >= 2) {
      return res.status(403).json({
        message:
          "You already have 2 active applications. Please withdraw one before applying to a new job.",
        activeApplications: activeCount,
      });
    }

    // Verify the job exists and is still open.
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }
    if (job.status !== "active") {
      return res.status(400).json({ message: "This job is no longer accepting applications." });
    }

    const application = new Application({
      studentId,
      jobId,
      companyId: job.companyId,
      coverLetter: coverLetter || "",
      status: "pending",
    });

    const saved = await application.save();

    // Keep the job's applicant counter in sync.
    await Job.findByIdAndUpdate(jobId, { $inc: { applicationsCount: 1 } });

    res.status(201).json({
      message: "Application submitted successfully.",
      application: saved,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "You have already applied for this job." });
    }
    res.status(500).json({ message: "Error submitting application.", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/applications/student/:studentId
// All applications for the logged-in student, newest first.
// ─────────────────────────────────────────────────────────────────────────────
const getStudentApplications = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid student ID." });
    }

    const applications = await Application.find({ studentId })
      .populate("jobId", "title companyName location type department deadline companyImage")
      .populate("slotId", "date time type location meetingLink duration status")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching applications.", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/applications/job/:jobId
// Applications for a specific job – used by the company dashboard.
// ─────────────────────────────────────────────────────────────────────────────
const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid job ID." });
    }

    const applications = await Application.find({ jobId })
      .populate(
        "studentId",
        "firstName lastName email profileImage studentProfile.university studentProfile.major"
      )
      .populate("slotId", "date time type location status")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching job applications.", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/applications/:id
// Single application with full population.
// ─────────────────────────────────────────────────────────────────────────────
const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid application ID." });
    }

    const application = await Application.findById(id)
      .populate("jobId", "title companyName location type department deadline companyImage")
      .populate("studentId", "firstName lastName email profileImage studentProfile")
      .populate("slotId");

    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: "Error fetching application.", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/applications/:id/status
// Company updates the application status (reviewing → accepted → rejected).
// ─────────────────────────────────────────────────────────────────────────────
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const ALLOWED_TRANSITIONS = ["reviewing", "accepted", "rejected"];
    if (!ALLOWED_TRANSITIONS.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Company may set: ${ALLOWED_TRANSITIONS.join(", ")}.`,
      });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid application ID." });
    }

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }
    if (["withdrawn", "rejected"].includes(application.status)) {
      return res
        .status(400)
        .json({ message: "Cannot update a withdrawn or already rejected application." });
    }

    application.status = status;
    if (notes) application.notes = notes;
    await application.save();

    res.json({
      message: `Application status updated to "${status}".`,
      application,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating application status.", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/applications/:id/book-slot
// Student atomically locks an interview slot and schedules the interview.
// A payment record is created at this point.
// ─────────────────────────────────────────────────────────────────────────────
const bookInterviewSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { slotId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(slotId)) {
      return res.status(400).json({ message: "Invalid application ID or slot ID." });
    }

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }
    if (application.status !== "accepted") {
      return res.status(400).json({
        message: "An interview slot can only be booked after your application is accepted.",
      });
    }

    // ── Atomic slot locking ───────────────────────────────────────────────
    // The filter { isBooked: false, status: 'available' } ensures only one
    // concurrent request can succeed; everyone else gets null back.
    const slot = await InterviewSlot.findOneAndUpdate(
      { _id: slotId, isBooked: false, status: "available" },
      {
        isBooked: true,
        bookedBy: application.studentId,
        bookedAt: new Date(),
        status: "booked",
      },
      { new: true }
    );

    if (!slot) {
      return res.status(409).json({
        message:
          "This interview slot is no longer available. Please choose another slot.",
      });
    }

    // Safety check: slot must belong to the same job as the application.
    if (String(slot.jobId) !== String(application.jobId)) {
      // Undo the lock immediately and return an error.
      await InterviewSlot.findByIdAndUpdate(slotId, {
        isBooked: false,
        bookedBy: null,
        bookedAt: null,
        status: "available",
      });
      return res
        .status(400)
        .json({ message: "Slot does not belong to the job associated with this application." });
    }

    // Update the application.
    application.status = "interview_scheduled";
    application.slotId = slotId;
    await application.save();

    // Keep the job's interview counter in sync.
    await Job.findByIdAndUpdate(application.jobId, { $inc: { interviewsCount: 1 } });

    // ── Create the payment tracking record ───────────────────────────────
    const payment = new Payment({
      applicationId: application._id,
      studentId: application.studentId,
      jobId: application.jobId,
      amount: 0,
      currency: "LKR",
      status: "pending",
      transactionRef: `PAY-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase()}`,
    });
    await payment.save();

    res.json({
      message: "Interview slot booked successfully.",
      application,
      slot,
      payment,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error booking interview slot.", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/applications/:id/withdraw
// Student withdraws their active application at any stage.
// Releases any locked slot and cancels any pending payment.
// ─────────────────────────────────────────────────────────────────────────────
const withdrawApplication = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid application ID." });
    }

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }
    if (!ACTIVE_STATUSES.includes(application.status)) {
      return res
        .status(400)
        .json({ message: "Only active applications can be withdrawn." });
    }

    // Release the interview slot back to available.
    if (application.slotId) {
      await InterviewSlot.findByIdAndUpdate(application.slotId, {
        isBooked: false,
        bookedBy: null,
        bookedAt: null,
        status: "available",
      });
    }

    // Cancel the payment record if it exists and is still pending.
    await Payment.findOneAndUpdate(
      { applicationId: application._id, status: "pending" },
      { status: "cancelled", cancelledAt: new Date() }
    );

    application.status = "withdrawn";
    application.withdrawnAt = new Date();
    application.slotId = null;
    await application.save();

    res.json({ message: "Application withdrawn successfully.", application });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error withdrawing application.", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/applications/:id/cancel-interview
// Company cancels a scheduled interview.
// The application is reverted to "accepted" so the student can re-book.
// ─────────────────────────────────────────────────────────────────────────────
const cancelInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid application ID." });
    }

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }
    if (application.status !== "interview_scheduled") {
      return res
        .status(400)
        .json({ message: "No scheduled interview found for this application." });
    }

    // Release the slot.
    if (application.slotId) {
      await InterviewSlot.findByIdAndUpdate(application.slotId, {
        isBooked: false,
        bookedBy: null,
        bookedAt: null,
        status: "available",
      });
    }

    // Cancel the pending payment.
    await Payment.findOneAndUpdate(
      { applicationId: application._id, status: "pending" },
      { status: "cancelled", cancelledAt: new Date() }
    );

    // Revert application to accepted so the student can pick a new slot.
    application.status = "accepted";
    application.slotId = null;
    if (notes) application.notes = notes;
    await application.save();

    res.json({
      message: "Interview cancelled. Application reverted to 'accepted'; student may re-book.",
      application,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error cancelling interview.", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/applications/admin/stats
// Aggregate counts for the admin dashboard.
// ─────────────────────────────────────────────────────────────────────────────
const getAdminStats = async (req, res) => {
  try {
    const [total, active, interviewScheduled, paymentPending, paymentCompleted] =
      await Promise.all([
        Application.countDocuments(),
        Application.countDocuments({ status: { $in: ACTIVE_STATUSES } }),
        Application.countDocuments({ status: "interview_scheduled" }),
        Payment.countDocuments({ status: "pending" }),
        Payment.countDocuments({ status: "completed" }),
      ]);

    res.json({ total, active, interviewScheduled, paymentPending, paymentCompleted });
  } catch (error) {
    res.status(500).json({ message: "Error fetching admin stats.", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/applications/admin/all
// All applications with student + job populated for the admin table.
// ─────────────────────────────────────────────────────────────────────────────
const getAllApplications = async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const apps = await Application.find()
      .populate("studentId", "firstName lastName email")
      .populate("jobId", "title companyName")
      .sort({ createdAt: -1 })
      .limit(Number(limit));
    res.json(apps);
  } catch (error) {
    res.status(500).json({ message: "Error fetching applications.", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────────
// PUT /api/applications/admin/:id/status
// Admin force-updates an application status. More permissive than company endpoint.
// Auto-releases interview slot and cancels payment when downgrading from interview_scheduled.
// ─────────────────────────────────────────────────────────────────────────────────
const adminUpdateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const ALLOWED = ["pending", "reviewing", "accepted", "rejected"];
    if (!ALLOWED.includes(status)) {
      return res.status(400).json({
        message: `Admin allowed statuses: ${ALLOWED.join(", ")}.`,
      });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid application ID." });
    }

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }

    // Release interview slot and cancel payment when demoting from interview_scheduled.
    if (
      application.status === "interview_scheduled" &&
      application.slotId
    ) {
      await InterviewSlot.findByIdAndUpdate(application.slotId, {
        isBooked: false,
        bookedBy: null,
        bookedAt: null,
        status: "available",
      });
      await Payment.findOneAndUpdate(
        { applicationId: application._id, status: "pending" },
        { status: "cancelled", cancelledAt: new Date() }
      );
      application.slotId = null;
    }

    application.status = status;
    if (notes !== undefined) application.notes = notes;
    await application.save();

    res.json({ message: `Application status set to "${status}".`, application });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating application status.", error: error.message });
  }
};

export {
  submitApplication,
  getStudentApplications,
  getJobApplications,
  getApplicationById,
  updateApplicationStatus,
  bookInterviewSlot,
  withdrawApplication,
  cancelInterview,
  getAdminStats,
  getAllApplications,
  adminUpdateApplicationStatus,
}; 
