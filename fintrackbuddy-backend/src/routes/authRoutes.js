const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMe,
  forgotPassword,
  verifyOtp,
  resetPassword,
  changePassword,
  updateProfile,
  uploadAvatar,
  removeAvatar,
  verifyLoginOtp,
  enable2FA,
  disable2FA,
  get2FAStatus,
  toggleNotifications, // ✅ NEW
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// ── Auth ──
router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getMe);

// ✅ Change Password (user already logged in)
router.put("/change-password", authMiddleware, changePassword);

// ── Password Reset (OTP flow) ──
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

// ── Profile Management ──
router.put("/profile", authMiddleware, updateProfile);
router.post(
  "/profile/avatar",
  authMiddleware,
  upload.single("avatar"),
  uploadAvatar,
);
router.delete("/profile/avatar", authMiddleware, removeAvatar);

// ✅ Two-Factor Authentication (2FA)
router.post("/verify-login-otp", verifyLoginOtp);
router.post("/2fa/enable", authMiddleware, enable2FA);
router.post("/2fa/disable", authMiddleware, disable2FA);
router.get("/2fa/status", authMiddleware, get2FAStatus);

// ✅ NEW: Notifications toggle
router.put("/notifications-toggle", authMiddleware, toggleNotifications);

module.exports = router;
