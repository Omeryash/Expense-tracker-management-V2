import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import {
  Bell,
  Shield,
  Globe,
  Moon,
  Sun,
  CreditCard,
  Download,
  LogOut,
  CheckCircle2,
  XCircle,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useCurrency } from "../context/CurrencyContext";
import { useExpenses } from "../context/ExpenseContext";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api"; // ✅ NEW
import { motion, AnimatePresence } from "framer-motion";

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { currency, setCurrency, currencies } = useCurrency();
  const { expenses } = useExpenses();
  const { changePassword, user, enable2FA, disable2FA } =
    useContext(AuthContext);
  const navigate = useNavigate();

  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    pushNotifications: false,
    language: "English",
  });

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    user?.twoFactorEnabled || false,
  );

  // ✅ NEW: Notifications enabled state
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    user?.notificationsEnabled ?? true,
  );
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFALoading, setTwoFALoading] = useState(false);

  const [messageData, setMessageData] = useState({
    type: "success",
    title: "",
    message: "",
  });

  // ✅ Sync user 2FA state when user changes
  useEffect(() => {
    setTwoFactorEnabled(user?.twoFactorEnabled || false);
  }, [user?.twoFactorEnabled]);

  // ✅ Sync notifications state when user changes
  useEffect(() => {
    setNotificationsEnabled(user?.notificationsEnabled ?? true);
  }, [user?.notificationsEnabled]);

  // Change password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const showMessage = (type, title, message) => {
    setMessageData({ type, title, message });
    setShowMessageModal(true);
  };

  // ============================================
  // ✅ NEW: Handle Notifications Toggle
  // ============================================
  const handleNotificationsToggle = async () => {
    const newValue = !notificationsEnabled;
    setNotificationsLoading(true);

    try {
      const response = await api.put("/auth/notifications-toggle", {
        notificationsEnabled: newValue,
      });

      setNotificationsEnabled(newValue);

      // Update user in localStorage
      const updatedUser = {
        ...user,
        notificationsEnabled: newValue,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      showMessage(
        "success",
        newValue ? "Notifications ON" : "Notifications OFF",
        newValue
          ? "You will receive notifications from now."
          : "You won't receive any new notifications.",
      );
    } catch (error) {
      const msg =
        error.response?.data?.message || "Failed to update notifications";
      showMessage("error", "Failed", msg);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // ============================================
  // ✅ Handle 2FA Toggle Click
  // ============================================
  const handle2FAToggleClick = () => {
    setShow2FAModal(true);
  };

  // ============================================
  // ✅ Confirm 2FA Enable/Disable
  // ============================================
  const handleConfirm2FA = async () => {
    setTwoFALoading(true);

    try {
      if (twoFactorEnabled) {
        await disable2FA();
        setTwoFactorEnabled(false);
        setShow2FAModal(false);
        showMessage(
          "success",
          "2FA Disabled",
          "Two-factor authentication has been turned off. You won't need OTP for login now.",
        );
      } else {
        await enable2FA();
        setTwoFactorEnabled(true);
        setShow2FAModal(false);
        showMessage(
          "success",
          "2FA Enabled!",
          "Two-factor authentication is now active. You'll need to enter an OTP every time you login.",
        );
      }
    } catch (error) {
      const msg =
        error.response?.data?.message || "Failed to update 2FA settings";
      setShow2FAModal(false);
      showMessage("error", "Failed", msg);
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");

    if (!passwordData.currentPassword) {
      setPasswordError("Please enter your current password");
      return;
    }
    if (!passwordData.newPassword) {
      setPasswordError("Please enter a new password");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError("New password must be different from current");
      return;
    }

    setPasswordLoading(true);

    try {
      await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
      );
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      showMessage(
        "success",
        "Password Changed!",
        "Your password has been updated successfully.",
      );
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to change password";
      setPasswordError(msg);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleOpenPasswordModal = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordError("");
    setShowPasswordModal(true);
  };

  const handleExport = () => {
    if (expenses.length === 0) {
      alert("No data available to export");
      return;
    }

    const headers = ["Date", "Title", "Category", "Type", "Amount", "Status"];
    const rows = expenses.map((t) => [
      t.date,
      `"${t.title}"`,
      t.category,
      t.type,
      t.amount,
      t.status || "completed",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `fintrackbuddy_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setShowExportModal(true);
  };

  const sections = [
    {
      title: "Appearance",
      icon: theme === "dark" ? Moon : Sun,
      description: "Choose your preferred theme",
      action: (
        <button
          onClick={toggleTheme}
          className="px-4 py-2 rounded-xl bg-muted hover:bg-accent transition text-sm font-medium"
        >
          {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      ),
    },
    {
      title: "Notifications",
      icon: Bell,
      description: notificationsEnabled
        ? "You will receive notifications"
        : "Notifications are turned off",
      action: (
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={handleNotificationsToggle}
            disabled={notificationsLoading}
            className="sr-only peer"
          />
          <div
            className={`w-11 h-6 rounded-full peer-focus:outline-none peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${
              notificationsLoading ? "opacity-50" : ""
            } ${notificationsEnabled ? "bg-primary" : "bg-muted"}`}
          ></div>
        </label>
      ),
    },
    {
      title: "Email Alerts",
      icon: Globe,
      description: "Receive email alerts for important updates",
      action: (
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.emailAlerts}
            onChange={() =>
              setSettings({ ...settings, emailAlerts: !settings.emailAlerts })
            }
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
      ),
    },
    {
      title: "Security",
      icon: twoFactorEnabled ? ShieldCheck : Shield,
      description: twoFactorEnabled
        ? "Two-factor authentication is ON"
        : "Two-factor authentication is OFF",
      action: (
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={twoFactorEnabled}
            onChange={handle2FAToggleClick}
            className="sr-only peer"
          />
          <div
            className={`w-11 h-6 rounded-full peer-focus:outline-none peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${
              twoFactorEnabled ? "bg-green-500" : "bg-muted"
            }`}
          ></div>
        </label>
      ),
    },
    {
      title: "Currency",
      icon: CreditCard,
      description: `Currently: ${currencies[currency]?.name || "US Dollar"}`,
      action: (
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="px-4 py-2 rounded-xl bg-muted hover:bg-accent transition text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          {Object.values(currencies).map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} ({c.symbol})
            </option>
          ))}
        </select>
      ),
    },
    {
      title: "Export Data",
      icon: Download,
      description: "Download your financial data",
      action: (
        <Button variant="outline" size="sm" onClick={handleExport}>
          Export
        </Button>
      ),
    },
  ];

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Customize your application preferences
          </p>
        </div>

        {/* ✅ Change Password Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Change Password</h3>
                <p className="text-sm text-muted-foreground">
                  Update your account password
                </p>
              </div>
            </div>
            <Button
              onClick={handleOpenPasswordModal}
              variant="outline"
              size="sm"
            >
              Change
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="flex items-center justify-between p-6 hover:shadow-lg transition-all">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-xl ${
                      section.title === "Security" && twoFactorEnabled
                        ? "bg-green-500/10"
                        : section.title === "Notifications" &&
                            notificationsEnabled
                          ? "bg-primary/10"
                          : "bg-muted"
                    }`}
                  >
                    <section.icon
                      className={`w-5 h-5 ${
                        section.title === "Security" && twoFactorEnabled
                          ? "text-green-500"
                          : section.title === "Notifications" &&
                              notificationsEnabled
                            ? "text-primary"
                            : ""
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">{section.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {section.description}
                    </p>
                  </div>
                </div>
                {section.action}
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="border-destructive/50">
          <div className="text-center py-6">
            <h3 className="font-semibold text-destructive mb-2">
              ⚠️ Danger Zone
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Permanently delete your account and all associated data
            </p>
            <Button
              variant="danger"
              className="flex items-center gap-2 mx-auto"
              onClick={() => setShowDeleteModal(true)}
            >
              <LogOut className="w-4 h-4" />
              Delete Account
            </Button>
          </div>
        </Card>
      </div>

      {/* ✅ 2FA Confirmation Modal */}
      <AnimatePresence>
        {show2FAModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !twoFALoading && setShow2FAModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
              >
                <div className="p-6 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.15, stiffness: 200 }}
                    className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-5 ${
                      twoFactorEnabled ? "bg-red-500/10" : "bg-primary/10"
                    }`}
                  >
                    {twoFactorEnabled ? (
                      <ShieldOff className="w-10 h-10 text-red-500" />
                    ) : (
                      <ShieldCheck className="w-10 h-10 text-primary" />
                    )}
                  </motion.div>

                  <h3 className="text-2xl font-bold mb-2">
                    {twoFactorEnabled ? "Disable 2FA?" : "Enable 2FA?"}
                  </h3>

                  <p className="text-muted-foreground text-sm mb-6">
                    {twoFactorEnabled
                      ? "Your account will be less secure. You won't need OTP for login. You can re-enable it anytime."
                      : "You'll need to enter an OTP from your device every time you login. This adds an extra layer of security."}
                  </p>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShow2FAModal(false)}
                      disabled={twoFALoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      className={`flex-1 ${
                        twoFactorEnabled ? "bg-red-500 hover:bg-red-600" : ""
                      }`}
                      onClick={handleConfirm2FA}
                      loading={twoFALoading}
                    >
                      {twoFactorEnabled ? "Yes, Disable" : "Yes, Enable"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPasswordModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Lock className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold">Change Password</h2>
                  </div>
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className="p-2 rounded-lg hover:bg-accent"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleChangePassword} className="p-5 space-y-4">
                  {passwordError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-600 dark:text-red-400">
                      ⚠️ {passwordError}
                    </div>
                  )}

                  <Input
                    label="Current Password"
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Enter your current password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    icon={
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="focus:outline-none"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    }
                    required
                  />

                  <Input
                    label="New Password"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Minimum 6 characters"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    icon={
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="focus:outline-none"
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    }
                    required
                  />

                  <Input
                    label="Confirm New Password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter new password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    icon={
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="focus:outline-none"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    }
                    required
                  />

                  {passwordData.newPassword && (
                    <div className="p-3 bg-muted/50 rounded-xl text-xs space-y-1">
                      <p className="font-medium text-muted-foreground mb-2">
                        Password Requirements:
                      </p>
                      <div className="flex items-center gap-2">
                        <span
                          className={
                            passwordData.newPassword.length >= 6
                              ? "text-green-500"
                              : "text-red-500"
                          }
                        >
                          {passwordData.newPassword.length >= 6 ? "✅" : "❌"}
                        </span>
                        <span>At least 6 characters</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={
                            passwordData.currentPassword !==
                            passwordData.newPassword
                              ? "text-green-500"
                              : "text-red-500"
                          }
                        >
                          {passwordData.currentPassword !==
                          passwordData.newPassword
                            ? "✅"
                            : "❌"}
                        </span>
                        <span>Different from current password</span>
                      </div>
                      {passwordData.confirmPassword && (
                        <div className="flex items-center gap-2">
                          <span
                            className={
                              passwordData.newPassword ===
                              passwordData.confirmPassword
                                ? "text-green-500"
                                : "text-red-500"
                            }
                          >
                            {passwordData.newPassword ===
                            passwordData.confirmPassword
                              ? "✅"
                              : "❌"}
                          </span>
                          <span>Passwords match</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="submit"
                      loading={passwordLoading}
                      className="flex-1"
                    >
                      Update Password
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPasswordModal(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Export Success Modal */}
      <AnimatePresence>
        {showExportModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExportModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", duration: 0.4 }}
                className="relative w-full max-w-md max-h-[90vh] overflow-y-auto pointer-events-auto"
              >
                <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                  <div className="p-6 sm:p-8 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        delay: 0.15,
                        stiffness: 200,
                      }}
                      className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-green-500/10 rounded-full mb-4 sm:mb-5"
                    >
                      <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" />
                    </motion.div>

                    <h3 className="text-xl sm:text-2xl font-bold mb-2">
                      Export Complete!
                    </h3>

                    <p className="text-muted-foreground text-sm mb-5 sm:mb-6">
                      Your data has been successfully exported as a CSV file.
                      Check your downloads folder.
                    </p>

                    <div className="bg-muted/50 rounded-xl p-3 mb-5 sm:mb-6 text-left">
                      <p className="text-xs text-muted-foreground mb-1">
                        File name:
                      </p>
                      <p className="text-sm font-mono break-all">
                        fintrackbuddy_export_
                        {new Date().toISOString().split("T")[0]}.csv
                      </p>
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => setShowExportModal(false)}
                    >
                      Got it
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Message Modal */}
      <AnimatePresence>
        {showMessageModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMessageModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]"
            />
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", duration: 0.4 }}
                className="relative w-full max-w-sm"
              >
                <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                  <div className="p-8 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        delay: 0.15,
                        stiffness: 200,
                      }}
                      className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-5 ${
                        messageData.type === "success"
                          ? "bg-green-500/10"
                          : "bg-red-500/10"
                      }`}
                    >
                      {messageData.type === "success" ? (
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                      ) : (
                        <XCircle className="w-10 h-10 text-red-500" />
                      )}
                    </motion.div>

                    <h3 className="text-2xl font-bold mb-2">
                      {messageData.title}
                    </h3>

                    <p className="text-muted-foreground text-sm mb-6">
                      {messageData.message}
                    </p>

                    <Button
                      className="w-full"
                      onClick={() => setShowMessageModal(false)}
                    >
                      OK
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account?"
      >
        <div className="space-y-5">
          <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <div className="text-2xl">⚠️</div>
            <div>
              <p className="font-semibold text-destructive mb-1">
                This action cannot be undone
              </p>
              <p className="text-sm text-muted-foreground">
                All your transactions, income records, and account data will be
                permanently deleted.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                localStorage.removeItem("expenses");
                localStorage.removeItem("currency");
                setShowDeleteModal(false);
                navigate("/login");
              }}
            >
              Yes, Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
