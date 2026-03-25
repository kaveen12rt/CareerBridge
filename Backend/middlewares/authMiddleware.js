import jwt from "jsonwebtoken";
import User from "../models/UserManagement/User.js";

export const authenticate = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ==================== ENV ADMIN TOKEN ====================
    if (
      decoded.isEnvAdmin &&
      decoded.role === "admin" &&
      decoded.email === process.env.ADMIN_EMAIL
    ) {
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        role: "admin",
        firstName: "Admin",
        lastName: "",
        isEmailVerified: true,
      };

      return next();
    }

    // ==================== NORMAL DATABASE USER TOKEN ====================
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. User not found.",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Your account has been deactivated.",
      });
    }

    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      isEmailVerified: user.isEmailVerified,
    };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
    }

    console.error("Authentication error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during authentication",
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Access denied. User not authenticated.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(" or ")}`,
      });
    }

    next();
  };
};

export const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Access denied. User not authenticated.",
    });
  }

  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: "Email verification required.",
    });
  }

  next();
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (
      decoded.isEnvAdmin &&
      decoded.role === "admin" &&
      decoded.email === process.env.ADMIN_EMAIL
    ) {
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        role: "admin",
        firstName: "Admin",
        lastName: "",
        isEmailVerified: true,
      };
      return next();
    }

    const user = await User.findById(decoded.userId);

    if (user && user.isActive) {
      req.user = {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.isEmailVerified,
      };
    }

    next();
  } catch (error) {
    next();
  }
};

// Compatibility exports
export const userOnly = authorize("student", "company", "user");
export const studentOnly = authorize("student");
export const companyOnly = authorize("company");
export const adminOnly = authorize("admin");
export const userOrAdmin = authorize("student", "company", "user", "admin");

const requestCounts = new Map();

export const rateLimiter = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();

    for (const [ip, data] of requestCounts.entries()) {
      if (data.resetTime < now) {
        requestCounts.delete(ip);
      }
    }

    let ipData = requestCounts.get(key);
    if (!ipData || ipData.resetTime < now) {
      ipData = { count: 0, resetTime: now + windowMs };
      requestCounts.set(key, ipData);
    }

    ipData.count++;

    if (ipData.count > maxRequests) {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please try again later.",
        retryAfter: Math.ceil((ipData.resetTime - now) / 1000),
      });
    }

    next();
  };
};