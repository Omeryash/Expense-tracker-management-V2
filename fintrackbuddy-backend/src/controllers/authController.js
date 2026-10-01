const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const prisma = require("../utils/prisma");
const sendSms = require("../utils/sendSms");

// ─────────────────────────────────────────────
// REGISTER (updated — phone accept karta hai)
// ─────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Phone diya hai to duplicate check
    if (phone) {
      const phoneTaken = await prisma.user.findUnique({
        where: { phone },
      });
      if (phoneTaken) {
        return res.status(400).json({ message: "Phone already registered" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone: phone || null,
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

// ─────────────────────────────────────────────
// LOGIN (unchanged)
// ─────────────────────────────────────────────
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
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────
// GET ME (updated — phone bhi bhejta hai)
// ─────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
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

// ═════════════════════════════════════════════
// FORGOT PASSWORD FLOW (NEW)
// ═════════════════════════════════════════════

// ─────────────────────────────────────────────
// STEP 1: OTP bhejo
// POST /api/auth/forgot-password
// body: { phone }
// ─────────────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: "Phone number required" });
    }

    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "No account found with this phone number" });
    }

    // ⏱️ Rate limit: 60 seconds
    if (
      user.resetOtpLastSentAt &&
      Date.now() - new Date(user.resetOtpLastSentAt).getTime() < 60_000
    ) {
      const remaining = Math.ceil(
        (60_000 - (Date.now() - new Date(user.resetOtpLastSentAt).getTime())) /
          1000,
      );
      return res.status(429).json({
        message: `Please wait ${remaining}s before requesting a new OTP`,
      });
    }

    // 🎲 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // 🔒 bcrypt hash
    const hash = await bcrypt.hash(otp, 10);

    // 💾 DB mein save
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetOtpHash: hash,
        resetOtpExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 min
        resetOtpAttempts: 0,
        resetOtpLastSentAt: new Date(),
      },
    });

    // 📱 SMS bhejo
    await sendSms(
      phone,
      `Your FinTrackBuddy password reset OTP is ${otp}. Valid for 10 minutes.`,
    );

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("forgotPassword error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────
// STEP 2: OTP verify karo
// POST /api/auth/verify-otp
// body: { phone, otp }
// ─────────────────────────────────────────────
const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: "Phone and OTP required" });
    }

    const user = await prisma.user.findUnique({ where: { phone } });

    if (!user || !user.resetOtpHash || !user.resetOtpExpiry) {
      return res.status(400).json({ message: "No OTP request found" });
    }

    // ⏰ Expiry check
    if (new Date(user.resetOtpExpiry) < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // 🚫 Attempts limit
    if (user.resetOtpAttempts >= 3) {
      return res
        .status(429)
        .json({ message: "Too many wrong attempts. Request a new OTP." });
    }

    // ✅ bcrypt compare
    const match = await bcrypt.compare(otp, user.resetOtpHash);

    if (!match) {
      await prisma.user.update({
        where: { id: user.id },
        data: { resetOtpAttempts: { increment: 1 } },
      });
      return res.status(400).json({ message: "Invalid OTP" });
    }

    res.json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("verifyOtp error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────
// STEP 3: Naya password set karo
// POST /api/auth/reset-password
// body: { phone, otp, newPassword }
// ─────────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { phone, otp, newPassword } = req.body;

    if (!phone || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const user = await prisma.user.findUnique({ where: { phone } });

    if (!user || !user.resetOtpHash || !user.resetOtpExpiry) {
      return res.status(400).json({ message: "No OTP request found" });
    }

    if (new Date(user.resetOtpExpiry) < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    if (user.resetOtpAttempts >= 3) {
      return res.status(429).json({ message: "Too many wrong attempts" });
    }

    // 🔍 OTP dobara verify
    const match = await bcrypt.compare(otp, user.resetOtpHash);

    if (!match) {
      await prisma.user.update({
        where: { id: user.id },
        data: { resetOtpAttempts: { increment: 1 } },
      });
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // 🔐 Naya password hash
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 💾 Update + OTP fields clear
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

    res.json({ message: "Password reset successfully. Please login." });
  } catch (error) {
    console.error("resetPassword error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  register,
  login,
  getMe,
  forgotPassword,
  verifyOtp,
  resetPassword,
};
