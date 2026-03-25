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
  deleteOwnProfileData,
  adminUpdateUserProfile,
  adminDeleteUserProfile,
} from "../../controllers/UserManagement/authController.js";

import {
  authenticate,
  requireEmailVerification,
  adminOnly,
  rateLimiter,
} from "../../middlewares/authMiddleware.js";

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
router.delete("/profile-details", authenticate, deleteOwnProfileData);
router.put("/change-password", authenticate, changePassword);
router.post("/logout", authenticate, logout);
router.delete("/account", authenticate, deleteAccount);

// ADMIN ROUTES
router.get("/users", authenticate, adminOnly, getAllUsers);

router.put(
  "/users/:userId/profile",
  authenticate,
  adminOnly,
  adminUpdateUserProfile
);

router.delete(
  "/users/:userId/profile",
  authenticate,
  adminOnly,
  adminDeleteUserProfile
);

router.patch(
  "/users/:userId/toggle-status",
  authenticate,
  adminOnly,
  toggleUserStatus
);

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