import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../../models/UserManagement/User.js";
import {
  getVerificationEmailTemplate,
  getPasswordResetEmailTemplate,
  getWelcomeEmailTemplate,
} from "../../utils/emailTemplates.js";

// ==================== EMAIL CONFIGURATION ====================
const createTransporter = () => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  transporter.verify((error) => {
    if (error) {
      console.error("❌ Email transporter error:", error.message);
    } else {
      console.log("✅ Email server is ready to send messages");
    }
  });

  return transporter;
};

const sendEmail = async (to, template) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"CareerBridge" <${process.env.GMAIL_USER}>`,
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`📧 Email sent successfully to: ${to}`);
    console.log(`📬 Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    return false;
  }
};

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const setCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// ==================== REGISTER ====================
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!["student", "company"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be either 'student' or 'company'",
      });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*?_+\-])[A-Za-z\d!@#$%^&*?_+\-]{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      firstName,
      lastName,
      email: normalizedEmail,
      password: hashedPassword,
      role,
    });

    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    const emailTemplate = getVerificationEmailTemplate(user, verificationUrl);
    await sendEmail(normalizedEmail, emailTemplate);

    res.status(201).json({
      success: true,
      message:
        "Registration successful! Please check your email to verify your account.",
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
        },
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during registration",
      error: error.message,
    });
  }
};

// ==================== LOGIN ====================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // ==================== ENV ADMIN LOGIN ====================
    if (
      normalizedEmail === process.env.ADMIN_EMAIL?.trim().toLowerCase() &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = generateToken({
        userId: "env-admin",
        email: process.env.ADMIN_EMAIL,
        role: "admin",
        isEnvAdmin: true,
      });

      setCookie(res, token);

      return res.status(200).json({
        success: true,
        message: "Welcome back, Admin!",
        redirectUrl: "/admin",
        data: {
          token,
          user: {
            id: "env-admin",
            firstName: "Admin",
            lastName: "",
            email: process.env.ADMIN_EMAIL,
            role: "admin",
            isEmailVerified: true,
            profileCompleted: true,
          },
        },
      });
    }

    // ==================== NORMAL DATABASE USER LOGIN ====================
    const user = await User.findByEmailWithPassword(normalizedEmail);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Your account has been deactivated.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    setCookie(res, token);

    let redirectUrl = "/";
    let message = "Welcome back!";

    if (user.role === "admin") {
      redirectUrl = "/admin";
      message = "Welcome back, Admin!";
    } else if (user.role === "student") {
      redirectUrl = "/";
      message = "Welcome back, Student!";
    } else if (user.role === "company") {
      redirectUrl = "/";
      message = "Welcome back, Company!";
    }

    res.status(200).json({
      success: true,
      message,
      redirectUrl,
      data: {
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          profileCompleted: user.profileCompleted,
          lastLogin: user.lastLogin,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during login",
      error: error.message,
    });
  }
};

// ==================== VERIFY EMAIL ====================
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findByVerificationToken(token);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    const welcomeTemplate = getWelcomeEmailTemplate(
      user,
      process.env.FRONTEND_URL
    );
    await sendEmail(user.email, welcomeTemplate);

    res.status(200).json({
      success: true,
      message: "Email verified successfully! You can now login.",
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
        },
      },
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during email verification",
      error: error.message,
    });
  }
};

// ==================== RESEND VERIFICATION EMAIL ====================
export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    const emailTemplate = getVerificationEmailTemplate(user, verificationUrl);
    const emailSent = await sendEmail(normalizedEmail, emailTemplate);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email",
      });
    }

    res.status(200).json({
      success: true,
      message: "Verification email sent successfully!",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ==================== FORGOT PASSWORD ====================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If the email exists, a password reset link will be sent.",
      });
    }

    const resetToken = user.generatePasswordResetToken();
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const emailTemplate = getPasswordResetEmailTemplate(user, resetUrl);
    const emailSent = await sendEmail(normalizedEmail, emailTemplate);

    if (!emailSent) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      return res.status(500).json({
        success: false,
        message: "Failed to send password reset email",
      });
    }

    res.status(200).json({
      success: true,
      message: "Password reset email sent successfully!",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ==================== RESET PASSWORD ====================
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "New password is required",
      });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*?_+\-])[A-Za-z\d!@#$%^&*?_+\-]{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
      });
    }

    const user = await User.findByResetToken(token);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully! You can now login.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ==================== GET PROFILE ====================
export const getProfile = async (req, res) => {
  try {
    if (req.user.id === "env-admin") {
      return res.status(200).json({
        success: true,
        data: {
          user: {
            id: "env-admin",
            firstName: "Admin",
            lastName: "",
            fullName: "Admin",
            email: process.env.ADMIN_EMAIL,
            role: "admin",
            isEmailVerified: true,
            profileCompleted: true,
            profileImage: "",
            lastLogin: null,
            createdAt: null,
          },
        },
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          profileCompleted: user.profileCompleted,
          profileImage: user.profileImage,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          ...(user.role === "student" && {
            studentProfile: user.studentProfile,
          }),
          ...(user.role === "company" && {
            companyProfile: user.companyProfile,
          }),
        },
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ==================== UPDATE PROFILE ====================
export const updateProfile = async (req, res) => {
  try {
    if (req.user.id === "env-admin") {
      return res.status(400).json({
        success: false,
        message: "Env admin profile cannot be updated from this route.",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { firstName, lastName, email, profileImage } = req.body;

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (profileImage) user.profileImage = profileImage;

    if (email && email.trim().toLowerCase() !== user.email) {
      const normalizedEmail = email.trim().toLowerCase();
      const existingUser = await User.findOne({ email: normalizedEmail });

      if (existingUser && existingUser._id.toString() !== req.user.id) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }

      user.email = normalizedEmail;
      user.isEmailVerified = false;

      const verificationToken = user.generateEmailVerificationToken();
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
      const emailTemplate = getVerificationEmailTemplate(
        user,
        verificationUrl
      );
      await sendEmail(normalizedEmail, emailTemplate);
    }

    if (user.role === "student" && req.body.studentProfile) {
      user.studentProfile = {
        ...user.studentProfile,
        ...req.body.studentProfile,
      };
    }

    if (user.role === "company" && req.body.companyProfile) {
      user.companyProfile = {
        ...user.companyProfile,
        ...req.body.companyProfile,
      };
    }

    if (user.role === "student") {
      const sp = user.studentProfile || {};
      user.profileCompleted = !!(
        sp.university &&
        sp.major &&
        sp.skills?.length > 0
      );
    } else if (user.role === "company") {
      const cp = user.companyProfile || {};
      user.profileCompleted = !!(
        cp.companyName &&
        cp.industry &&
        cp.description
      );
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          profileCompleted: user.profileCompleted,
          ...(user.role === "student" && {
            studentProfile: user.studentProfile,
          }),
          ...(user.role === "company" && {
            companyProfile: user.companyProfile,
          }),
        },
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ==================== CHANGE PASSWORD ====================
export const changePassword = async (req, res) => {
  try {
    if (req.user.id === "env-admin") {
      return res.status(400).json({
        success: false,
        message: "Env admin password cannot be changed from this route.",
      });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*?_+\-])[A-Za-z\d!@#$%^&*?_+\-]{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 8 characters with uppercase, lowercase, number, and special character",
      });
    }

    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ==================== CHECK AUTH ====================
export const checkAuth = async (req, res) => {
  try {
    if (req.user.id === "env-admin") {
      return res.status(200).json({
        success: true,
        data: {
          user: {
            id: "env-admin",
            firstName: "Admin",
            lastName: "",
            email: process.env.ADMIN_EMAIL,
            role: "admin",
            isEmailVerified: true,
            profileCompleted: true,
          },
        },
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          profileCompleted: user.profileCompleted,
          ...(user.role === "student" && {
            studentProfile: user.studentProfile,
          }),
          ...(user.role === "company" && {
            companyProfile: user.companyProfile,
          }),
        },
      },
    });
  } catch (error) {
    console.error("Check auth error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ==================== LOGOUT ====================
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ==================== DELETE ACCOUNT ====================
export const deleteAccount = async (req, res) => {
  try {
    if (req.user.id === "env-admin") {
      return res.status(400).json({
        success: false,
        message: "Env admin account cannot be deleted from this route.",
      });
    }

    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required to delete account",
      });
    }

    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Password is incorrect",
      });
    }

    await User.findByIdAndDelete(req.user.id);

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ==================== GET ALL USERS ====================
export const getAllUsers = async (req, res) => {
  try {
    const { role, isActive, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const users = await User.find(filter)
      .skip(skip)
      .limit(parseInt(limit, 10))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          pages: Math.ceil(total / parseInt(limit, 10)),
        },
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ==================== TOGGLE USER STATUS ====================
export const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${
        user.isActive ? "activated" : "deactivated"
      } successfully`,
      data: { user },
    });
  } catch (error) {
    console.error("Toggle user status error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ==================== DELETE OWN PROFILE DATA ====================
export const deleteOwnProfileData = async (req, res) => {
  try {
    if (req.user.id === "env-admin") {
      return res.status(400).json({
        success: false,
        message: "Env admin profile data cannot be deleted from this route.",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.studentProfile = {
      university: "",
      major: "",
      graduationYear: undefined,
      skills: [],
      certifications: [],
      resume: "",
      bio: "",
    };

    user.companyProfile = {
      companyName: "",
      industry: "",
      website: "",
      description: "",
      location: "",
      employeeCount: "",
      logo: "",
    };

    user.profileCompleted = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile data deleted successfully",
    });
  } catch (error) {
    console.error("Delete own profile data error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ==================== ADMIN UPDATE USER PROFILE DATA ====================
export const adminUpdateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, email, studentProfile, companyProfile } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (email !== undefined) user.email = email.trim().toLowerCase();

    if (user.role === "student" && studentProfile) {
      user.studentProfile = {
        ...user.studentProfile,
        ...studentProfile,
      };
    }

    if (user.role === "company" && companyProfile) {
      user.companyProfile = {
        ...user.companyProfile,
        ...companyProfile,
      };
    }

    if (user.role === "student") {
      const sp = user.studentProfile || {};
      user.profileCompleted = !!(
        sp.university &&
        sp.major &&
        sp.skills?.length > 0
      );
    } else if (user.role === "company") {
      const cp = user.companyProfile || {};
      user.profileCompleted = !!(
        cp.companyName &&
        cp.industry &&
        cp.description
      );
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      data: { user },
    });
  } catch (error) {
    console.error("Admin update user profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ==================== ADMIN DELETE USER PROFILE DATA ====================
export const adminDeleteUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "student") {
      user.studentProfile = {
        university: "",
        major: "",
        graduationYear: undefined,
        skills: [],
        certifications: [],
        resume: "",
        bio: "",
      };
    }

    if (user.role === "company") {
      user.companyProfile = {
        companyName: "",
        industry: "",
        website: "",
        description: "",
        location: "",
        employeeCount: "",
        logo: "",
      };
    }

    user.profileCompleted = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User profile data deleted successfully",
    });
  } catch (error) {
    console.error("Admin delete user profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};