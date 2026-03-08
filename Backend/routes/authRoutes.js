import express from "express";
import {
  register,
  login,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  changePassword,
  checkAuth,
  logout,
  deleteAccount,
  getAllUsers,
  toggleUserStatus,
} from "../controllers/authController.js";
import {
  authenticate,
  requireEmailVerification,
  studentOnly,
  companyOnly,
  rateLimiter,
  adminOnly, // <-- import adminOnly
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(rateLimiter(100, 15 * 60 * 1000));

// PUBLIC ROUTES
router.post("/register", register);
router.post("/login", login);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// PROTECTED ROUTES
router.get("/check-auth", authenticate, checkAuth);
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);
router.put("/change-password", authenticate, changePassword);
router.post("/logout", authenticate, logout);
router.delete("/account", authenticate, deleteAccount);

// ROLE-SPECIFIC ROUTES
router.get(
  "/student/dashboard",
  authenticate,
  requireEmailVerification,
  studentOnly,
  (req, res) => {
    res.json({
      success: true,
      message: "Student dashboard",
      data: { role: "student", userId: req.user.id },
    });
  }
);

router.get(
  "/company/dashboard",
  authenticate,
  requireEmailVerification,
  companyOnly,
  (req, res) => {
    res.json({
      success: true,
      message: "Company dashboard",
      data: { role: "company", userId: req.user.id },
    });
  }
);

// ADMIN ROUTES
router.get("/users", authenticate, adminOnly, getAllUsers);
router.patch(
  "/users/:userId/toggle-status",
  authenticate,
  adminOnly,
  toggleUserStatus
);

// Optional: Admin dashboard test route
router.get(
  "/admin/dashboard",
  authenticate,
  requireEmailVerification,
  adminOnly,
  (req, res) => {
    res.json({
      success: true,
      message: "Admin dashboard",
      data: { role: "admin", userId: req.user.id },
    });
  }
);

export default router;