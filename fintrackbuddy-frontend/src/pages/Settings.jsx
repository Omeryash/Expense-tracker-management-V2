import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
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
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useCurrency } from "../context/CurrencyContext";
import { useExpenses } from "../context/ExpenseContext";
import { motion, AnimatePresence } from "framer-motion";

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { currency, setCurrency, currencies } = useCurrency();
  const { expenses } = useExpenses();
  const navigate = useNavigate();

  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    pushNotifications: false,
    twoFactor: false,
    language: "English",
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

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
      description: "Manage your notification preferences",
      action: (
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.notifications}
            onChange={() =>
              setSettings({
                ...settings,
                notifications: !settings.notifications,
              })
            }
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
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
      icon: Shield,
      description: "Two-factor authentication",
      action: (
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.twoFactor}
            onChange={() =>
              setSettings({ ...settings, twoFactor: !settings.twoFactor })
            }
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
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
                  <div className="p-3 rounded-xl bg-muted">
                    <section.icon className="w-5 h-5" />
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

      {/* ✅ Export Success Modal - PERFECTLY CENTERED */}
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
