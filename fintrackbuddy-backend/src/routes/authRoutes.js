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

// ✅ NEW: Profile Management
router.put("/profile", authMiddleware, updateProfile);
router.post(
  "/profile/avatar",
  authMiddleware,
  upload.single("avatar"),
  uploadAvatar,
);
router.delete("/profile/avatar", authMiddleware, removeAvatar);

module.exports = router;
