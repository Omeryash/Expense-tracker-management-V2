import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  XCircle,
  X,
  Shield,
  ArrowLeft,
  KeyRound,
  RefreshCw,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { AuthContext } from "../context/AuthContext";
import { Logo } from "../components/common/Logo";
import api from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const { login, verifyLoginOtp } = useContext(AuthContext);

  // ✅ Login form state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({ email: "", password: "" });

  // ✅ 2FA state
  const [requires2FA, setRequires2FA] = useState(false);
  const [userId, setUserId] = useState(null);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [userEmail, setUserEmail] = useState("");

  // ✅ Resend OTP state
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // ============================================
  // ✅ Step 1: Login Submit
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      // ✅ Check if 2FA is required
      if (response.data.requires2FA) {
        setRequires2FA(true);
        setUserId(response.data.userId);
        setUserEmail(formData.email);
        setOtp("");
        setOtpError("");
        setLoading(false);
        return;
      }

      // ✅ Normal login (no 2FA)
      const { token, user } = response.data;
      login(token, user);
      navigate("/dashboard");
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || "Login failed. Please try again.",
      );
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // ✅ Step 2: Verify OTP
  // ============================================
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpError("");

    if (otp.length !== 6) {
      setOtpError("Please enter 6-digit OTP");
      return;
    }

    setOtpLoading(true);

    try {
      await verifyLoginOtp(userId, otp);
      navigate("/dashboard");
    } catch (err) {
      setOtpError(
        err.response?.data?.message || "Invalid OTP. Please try again.",
      );
    } finally {
      setOtpLoading(false);
    }
  };

  // ============================================
  // ✅ Step 3: Resend OTP
  // ============================================
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    setResendLoading(true);
    setOtpError("");

    try {
      const response = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      if (response.data.requires2FA) {
        setUserId(response.data.userId);
        setOtp("");
        // Start 30-second cooldown
        setResendCooldown(30);
        const timer = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err) {
      setOtpError(
        err.response?.data?.message ||
          "Failed to resend OTP. Please try again.",
      );
    } finally {
      setResendLoading(false);
    }
  };

  // ============================================
  // ✅ Back to Login
  // ============================================
  const handleBackToLogin = () => {
    setRequires2FA(false);
    setUserId(null);
    setOtp("");
    setOtpError("");
    setFormData({ email: "", password: "" });
    setResendCooldown(0);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950" />

      {/* Animated orbs */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, -100, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 -left-40 w-96 h-96 rounded-full blur-3xl opacity-30"
        style={{
          background: "radial-gradient(circle, #3B82F6 0%, transparent 70%)",
        }}
      />
      <motion.div
        animate={{
          x: [0, -100, 0],
          y: [0, 100, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 -right-40 w-[500px] h-[500px] rounded-full blur-3xl opacity-30"
        style={{
          background: "radial-gradient(circle, #8B5CF6 0%, transparent 70%)",
        }}
      />
      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, 50, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-3xl opacity-20"
        style={{
          background: "radial-gradient(circle, #06B6D4 0%, transparent 70%)",
        }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Floating dots */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md px-6 z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8 flex justify-center">
          <Logo size="lg" showText={true} />
        </div>

        {/* ============================================ */}
        {/* LOGIN CARD */}
        {/* ============================================ */}
        {!requires2FA && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="backdrop-blur-xl bg-white/5 rounded-2xl shadow-2xl p-8 border border-white/10"
          >
            <h2 className="text-2xl font-bold mb-6 text-white">Welcome Back</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email Address"
                type="email"
                name="email"
                autoComplete="username email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />

              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                icon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                }
                required
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-border" />
                  <span className="text-sm text-gray-400">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-sm text-blue-400 hover:text-blue-300 hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <Button type="submit" loading={loading} className="w-full">
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Don't have an account?{" "}
                <button
                  onClick={() => navigate("/signup")}
                  className="text-blue-400 font-semibold hover:text-blue-300 hover:underline"
                >
                  Create Account
                </button>
              </p>
            </div>
          </motion.div>
        )}

        {/* ============================================ */}
        {/* 2FA OTP CARD */}
        {/* ============================================ */}
        {requires2FA && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="backdrop-blur-xl bg-white/5 rounded-2xl shadow-2xl p-8 border border-white/10"
          >
            {/* Back button */}
            <button
              type="button"
              onClick={handleBackToLogin}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition mb-5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>

            {/* Icon */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-4"
              >
                <Shield className="w-8 h-8 text-primary" />
              </motion.div>

              <h2 className="text-2xl font-bold text-white mb-2">
                Two-Factor Authentication
              </h2>
              <p className="text-sm text-gray-400">
                Enter the 6-digit code sent to your device
              </p>
              {userEmail && (
                <p className="text-xs text-gray-500 mt-1">
                  for <span className="text-primary">{userEmail}</span>
                </p>
              )}
            </div>

            {/* Info box */}
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl mb-5">
              <div className="flex items-start gap-2">
                <KeyRound className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-300">
                  📟 Check your <strong>backend terminal</strong> for the OTP
                  code (for development only)
                </p>
              </div>
            </div>

            {/* OTP form */}
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Enter OTP
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  maxLength={6}
                  autoFocus
                  className="w-full text-center text-2xl tracking-[0.5em] font-bold px-4 py-4 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              {otpError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">
                  ⚠️ {otpError}
                </div>
              )}

              <Button
                type="submit"
                loading={otpLoading}
                disabled={otp.length !== 6}
                className="w-full"
              >
                Verify OTP
              </Button>
            </form>

            {/* ✅ Resend OTP */}
            <div className="mt-5 text-center">
              <p className="text-sm text-gray-500 mb-2">
                Didn't receive the code?
              </p>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendLoading || resendCooldown > 0}
                className={`inline-flex items-center gap-2 text-sm font-medium transition ${
                  resendCooldown > 0
                    ? "text-gray-500 cursor-not-allowed"
                    : "text-primary hover:text-primary/80"
                }`}
              >
                <RefreshCw
                  className={`w-4 h-4 ${resendLoading ? "animate-spin" : ""}`}
                />
                {resendLoading
                  ? "Sending..."
                  : resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : "Resend OTP"}
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Error Modal */}
      <AnimatePresence>
        {showErrorModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowErrorModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-sm"
              >
                <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden relative">
                  <button
                    onClick={() => setShowErrorModal(false)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-accent transition z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="p-8 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        delay: 0.15,
                        stiffness: 200,
                      }}
                      className="inline-flex items-center justify-center w-20 h-20 bg-red-500/10 rounded-full mb-5"
                    >
                      <XCircle className="w-10 h-10 text-red-500" />
                    </motion.div>

                    <h3 className="text-2xl font-bold mb-2 text-white">
                      Login Failed
                    </h3>

                    <p className="text-gray-400 text-sm mb-6">{errorMessage}</p>

                    <Button
                      className="w-full"
                      onClick={() => setShowErrorModal(false)}
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
