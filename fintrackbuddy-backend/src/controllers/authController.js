const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const prisma = require("../utils/prisma");

// Register
const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Check phone duplicate
    if (phone) {
      const existingPhone = await prisma.user.findUnique({
        where: { phone },
      });
      if (existingPhone) {
        return res
          .status(400)
          .json({ message: "Phone number already registered" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone: phone || null,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ✅ 2FA Check
    if (user.twoFactorEnabled) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

      await prisma.user.update({
        where: { id: user.id },
        data: {
          twoFactorOtpHash: otpHash,
          twoFactorOtpExpiry: new Date(Date.now() + 5 * 60 * 1000),
          twoFactorOtpAttempts: 0,
        },
      });

      // ✅ OTP terminal mein print karo (development ke liye)
      console.log(`\n🔐 2FA OTP for ${user.email}: ${otp}\n`);

      return res.json({
        message: "2FA required",
        requires2FA: true,
        userId: user.id,
      });
    }

    // No 2FA — direct login
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        bio: user.bio,
        avatar: user.avatar,
        twoFactorEnabled: user.twoFactorEnabled, // ✅ ADD
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get current user
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        location: true,
        bio: true,
        avatar: true,
        twoFactorEnabled: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Change Password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: "New password must be different from current password",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: req.userId },
      data: { password: hashedNewPassword },
    });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================================
// FORGOT PASSWORD (Phone-based OTP)
// ============================================
const forgotPassword = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: "Invalid phone number format" });
    }

    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      return res.status(404).json({
        message: "No account found with this phone number",
      });
    }

    if (user.resetOtpLastSentAt) {
      const timeDiff = Date.now() - new Date(user.resetOtpLastSentAt).getTime();
      if (timeDiff < 60000) {
        const waitSec = Math.ceil((60000 - timeDiff) / 1000);
        return res.status(429).json({
          message: `Please wait ${waitSec} seconds before requesting again`,
        });
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetOtpHash: otpHash,
        resetOtpExpiry: new Date(Date.now() + 10 * 60 * 1000),
        resetOtpAttempts: 0,
        resetOtpLastSentAt: new Date(),
      },
    });

    // ✅ OTP terminal mein print (development)
    console.log(`\n🔐 Password Reset OTP for ${phone}: ${otp}\n`);

    res.json({
      message: "OTP sent successfully",
      otp: otp,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        message: "Phone and OTP are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.resetOtpAttempts >= 5) {
      return res.status(429).json({
        message: "Too many attempts. Please request a new OTP.",
      });
    }

    if (
      !user.resetOtpExpiry ||
      Date.now() > new Date(user.resetOtpExpiry).getTime()
    ) {
      return res
        .status(400)
        .json({ message: "OTP expired. Please request a new one." });
    }

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    if (otpHash !== user.resetOtpHash) {
      await prisma.user.update({
        where: { id: user.id },
        data: { resetOtpAttempts: user.resetOtpAttempts + 1 },
      });

      const remaining = 4 - user.resetOtpAttempts;
      return res.status(400).json({
        message: `Invalid OTP. ${remaining} attempts remaining.`,
      });
    }

    const resetToken = jwt.sign(
      { userId: user.id, phone: user.phone, purpose: "password-reset" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );

    res.json({
      message: "OTP verified successfully",
      resetToken,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        message: "Reset token and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({
        message: "Invalid or expired reset token",
      });
    }

    if (decoded.purpose !== "password-reset") {
      return res.status(400).json({ message: "Invalid reset token" });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetOtpHash: null,
        resetOtpExpiry: null,
        resetOtpAttempts: 0,
        resetOtpLastSentAt: null,
      },
    });

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================================
// UPDATE PROFILE
// ============================================
const updateProfile = async (req, res) => {
  try {
    const { name, phone, location, bio } = req.body;

    if (name !== undefined && name.trim().length === 0) {
      return res.status(400).json({ message: "Name cannot be empty" });
    }

    if (phone !== undefined && phone !== null && phone !== "") {
      if (!/^\d{10}$/.test(phone)) {
        return res.status(400).json({ message: "Phone must be 10 digits" });
      }

      const existingPhone = await prisma.user.findFirst({
        where: {
          phone,
          NOT: { id: req.userId },
        },
      });

      if (existingPhone) {
        return res.status(400).json({ message: "Phone number already in use" });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: {
        name: name !== undefined ? name : undefined,
        phone: phone !== undefined ? (phone === "" ? null : phone) : undefined,
        location: location !== undefined ? location : undefined,
        bio: bio !== undefined ? bio : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        location: true,
        bio: true,
        avatar: true,
        twoFactorEnabled: true,
        createdAt: true,
      },
    });

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================================
// UPLOAD AVATAR
// ============================================
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const avatarPath = `/uploads/${req.file.filename}`;

    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: { avatar: avatarPath },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        location: true,
        bio: true,
        avatar: true,
        twoFactorEnabled: true,
      },
    });

    res.json({
      message: "Avatar uploaded successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Upload avatar error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================================
// REMOVE AVATAR
// ============================================
const removeAvatar = async (req, res) => {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: { avatar: null },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        location: true,
        bio: true,
        avatar: true,
        twoFactorEnabled: true,
      },
    });

    res.json({
      message: "Avatar removed successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Remove avatar error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================================
// ✅ VERIFY LOGIN OTP (2FA Login)
// ============================================
const verifyLoginOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        message: "User ID and OTP are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.twoFactorOtpAttempts >= 5) {
      return res.status(429).json({
        message: "Too many attempts. Please login again.",
      });
    }

    if (
      !user.twoFactorOtpExpiry ||
      Date.now() > new Date(user.twoFactorOtpExpiry).getTime()
    ) {
      return res.status(400).json({
        message: "OTP expired. Please login again.",
      });
    }

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    if (otpHash !== user.twoFactorOtpHash) {
      await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorOtpAttempts: user.twoFactorOtpAttempts + 1 },
      });

      const remaining = 4 - user.twoFactorOtpAttempts;
      return res.status(400).json({
        message: `Invalid OTP. ${remaining} attempts remaining.`,
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorOtpHash: null,
        twoFactorOtpExpiry: null,
        twoFactorOtpAttempts: 0,
      },
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        bio: user.bio,
        avatar: user.avatar,
        twoFactorEnabled: user.twoFactorEnabled, // ✅ ADD
      },
    });
  } catch (error) {
    console.error("Verify login OTP error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================================
// ✅ ENABLE 2FA
// ============================================
const enable2FA = async (req, res) => {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: { twoFactorEnabled: true },
      select: {
        id: true,
        name: true,
        email: true,
        twoFactorEnabled: true,
      },
    });

    res.json({
      message: "2FA enabled successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Enable 2FA error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================================
// ✅ DISABLE 2FA
// ============================================
const disable2FA = async (req, res) => {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: {
        twoFactorEnabled: false,
        twoFactorOtpHash: null,
        twoFactorOtpExpiry: null,
        twoFactorOtpAttempts: 0,
      },
      select: {
        id: true,
        name: true,
        email: true,
        twoFactorEnabled: true,
      },
    });

    res.json({
      message: "2FA disabled successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Disable 2FA error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================================
// ✅ GET 2FA STATUS
// ============================================
const get2FAStatus = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        twoFactorEnabled: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      twoFactorEnabled: user.twoFactorEnabled,
    });
  } catch (error) {
    console.error("Get 2FA status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  register,
  login,
  getMe,
  changePassword,
  forgotPassword,
  verifyOtp,
  resetPassword,
  updateProfile,
  uploadAvatar,
  removeAvatar,
  verifyLoginOtp,
  enable2FA,
  disable2FA,
  get2FAStatus,
};
