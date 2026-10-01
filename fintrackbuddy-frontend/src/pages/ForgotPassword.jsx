import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { phone });
      setInfo(`OTP sent to ${phone}`);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/verify-otp", { phone, otp });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { phone, otp, newPassword });
      alert("Password reset successful! Please login.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 👇 Yeh fix hai — input text aur placeholder dono visible */}
      <style>{`
        .fp-input {
          width: 100%;
          padding: 0.75rem 1rem;
          margin-bottom: 1rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 1rem;
          outline: none;
          box-sizing: border-box;
          background: #ffffff !important;
          color: #111827 !important;
          caret-color: #111827;
        }
        .fp-input::placeholder {
          color: #9ca3af !important;
          opacity: 1 !important;
        }
        .fp-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
        }
      `}</style>

      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Reset Password</h2>

          {error && <p style={styles.error}>{error}</p>}
          {info && <p style={styles.info}>{info}</p>}

          {/* STEP 1 */}
          {step === 1 && (
            <form onSubmit={handleSendOtp}>
              <input
                type="tel"
                placeholder="Enter registered phone number"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                maxLength={10}
                required
                autoComplete="off"
                className="fp-input"
              />
              <button type="submit" disabled={loading} style={styles.button}>
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp}>
              <p style={styles.text}>
                OTP sent to <strong>{phone}</strong>
              </p>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                maxLength={6}
                required
                autoComplete="off"
                className="fp-input"
                style={{
                  textAlign: "center",
                  letterSpacing: "6px",
                  fontSize: "1.25rem",
                }}
              />
              <button type="submit" disabled={loading} style={styles.button}>
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtp("");
                  setInfo("");
                }}
                style={styles.linkBtn}
              >
                Change phone number
              </button>
            </form>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <form onSubmit={handleResetPassword}>
              <input
                type="password"
                placeholder="New password (min 6 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                required
                autoComplete="new-password"
                className="fp-input"
              />
              <button
                type="submit"
                disabled={loading}
                style={{ ...styles.button, background: "#16a34a" }}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

          <p style={styles.footerText}>
            <Link to="/login" style={styles.link}>
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f3f4f6",
    padding: "1rem",
  },
  card: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    width: "100%",
    maxWidth: "400px",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "700",
    marginBottom: "1.5rem",
    textAlign: "center",
    color: "#111827",
  },
  button: {
    width: "100%",
    padding: "0.75rem",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    marginBottom: "0.5rem",
  },
  linkBtn: {
    width: "100%",
    padding: "0.5rem",
    background: "transparent",
    color: "#6b7280",
    border: "none",
    fontSize: "0.875rem",
    cursor: "pointer",
    textDecoration: "underline",
  },
  error: {
    background: "#fee2e2",
    color: "#b91c1c",
    padding: "0.6rem",
    borderRadius: "6px",
    marginBottom: "1rem",
    fontSize: "0.875rem",
  },
  info: {
    background: "#dbeafe",
    color: "#1d4ed8",
    padding: "0.6rem",
    borderRadius: "6px",
    marginBottom: "1rem",
    fontSize: "0.875rem",
  },
  text: {
    fontSize: "0.875rem",
    color: "#6b7280",
    marginBottom: "1rem",
    textAlign: "center",
  },
  footerText: {
    textAlign: "center",
    marginTop: "1.5rem",
    fontSize: "0.875rem",
  },
  link: {
    color: "#2563eb",
    textDecoration: "none",
  },
};

export default ForgotPassword;
