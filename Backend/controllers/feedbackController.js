import Feedback from "../models/Feedback.js";
import User from "../models/UserManagement/User.js";

export const getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate("user", "firstName lastName email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { feedback },
    });
  } catch (error) {
    console.error("Get all feedback error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load feedback",
      error: error.message,
    });
  }
};

export const getMyFeedback = async (req, res) => {
  try {
    if (req.user.id === "env-admin") {
      return res.status(400).json({
        success: false,
        message: "Admin feedback is not supported here.",
      });
    }

    const feedback = await Feedback.findOne({ user: req.user.id }).populate(
      "user",
      "firstName lastName email role"
    );

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "No feedback found for this user.",
      });
    }

    res.status(200).json({
      success: true,
      data: { feedback },
    });
  } catch (error) {
    console.error("Get my feedback error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load your feedback",
      error: error.message,
    });
  }
};

export const createFeedback = async (req, res) => {
  try {
    if (req.user.id === "env-admin") {
      return res.status(400).json({
        success: false,
        message: "Admin cannot create feedback here.",
      });
    }

    const { rating, message } = req.body;

    if (!rating || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Rating and message are required.",
      });
    }

    const existing = await Feedback.findOne({ user: req.user.id });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted feedback. Please edit it instead.",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const feedback = await Feedback.create({
      user: req.user.id,
      rating: Number(rating),
      message: message.trim(),
    });

    const populatedFeedback = await Feedback.findById(feedback._id).populate(
      "user",
      "firstName lastName email role"
    );

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully.",
      data: { feedback: populatedFeedback },
    });
  } catch (error) {
    console.error("Create feedback error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create feedback",
      error: error.message,
    });
  }
};

export const updateFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { rating, message } = req.body;

    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found.",
      });
    }

    if (String(feedback.user) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own feedback.",
      });
    }

    if (!rating || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Rating and message are required.",
      });
    }

    feedback.rating = Number(rating);
    feedback.message = message.trim();
    await feedback.save();

    const updatedFeedback = await Feedback.findById(feedback._id).populate(
      "user",
      "firstName lastName email role"
    );

    res.status(200).json({
      success: true,
      message: "Feedback updated successfully.",
      data: { feedback: updatedFeedback },
    });
  } catch (error) {
    console.error("Update feedback error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update feedback",
      error: error.message,
    });
  }
};

export const deleteFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;

    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found.",
      });
    }

    if (String(feedback.user) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own feedback.",
      });
    }

    await Feedback.findByIdAndDelete(feedbackId);

    res.status(200).json({
      success: true,
      message: "Feedback deleted successfully.",
    });
  } catch (error) {
    console.error("Delete feedback error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete feedback",
      error: error.message,
    });
  }
};