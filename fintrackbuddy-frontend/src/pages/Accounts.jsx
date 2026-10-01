import { useState } from "react";
import { Layout } from "../components/layout/Layout";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  Plus,
  Edit2,
  Trash2,
  Wallet,
  Star,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccounts } from "../context/AccountContext";
import { useCurrency } from "../context/CurrencyContext";

const ACCOUNT_TYPES = [
  { value: "bank", label: "Bank", icon: "🏦" },
  { value: "wallet", label: "Wallet", icon: "📱" },
  { value: "cash", label: "Cash", icon: "💵" },
  { value: "credit_card", label: "Credit Card", icon: "💳" },
];

export default function Accounts() {
  const { accounts, addAccount, updateAccount, deleteAccount, totalBalance } =
    useAccounts();
  const { formatAmount } = useCurrency();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageData, setMessageData] = useState({
    type: "error",
    title: "",
    message: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    type: "bank",
    balance: "",
    icon: "🏦",
    color: "#3B82F6",
    isDefault: false,
  });

  const showMessage = (type, title, message) => {
    setMessageData({ type, title, message });
    setShowMessageModal(true);
  };

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({
      name: "",
      type: "bank",
      balance: "",
      icon: "🏦",
      color: "#3B82F6",
      isDefault: accounts.length === 0,
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (acc) => {
    setEditingId(acc.id);
    setFormData({
      name: acc.name,
      type: acc.type,
      balance: acc.balance.toString(),
      icon: acc.icon,
      color: acc.color,
      isDefault: acc.isDefault,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this account?")) {
      try {
        await deleteAccount(id);
        showMessage(
          "success",
          "Account Deleted",
          "Account removed successfully",
        );
      } catch (error) {
        const errMsg = error.response?.data?.message || "Failed to delete";
        showMessage("error", "Cannot Delete", errMsg);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showMessage("error", "Invalid Name", "Please enter an account name");
      return;
    }

    try {
      const payload = {
        ...formData,
        balance: parseFloat(formData.balance) || 0,
      };

      if (editingId) {
        await updateAccount(editingId, payload);
        showMessage(
          "success",
          "Account Updated",
          `${formData.name} has been updated`,
        );
      } else {
        await addAccount(payload);
        showMessage(
          "success",
          "Account Added",
          `${formData.name} has been created`,
        );
      }
      setTimeout(() => setIsModalOpen(false), 1500);
    } catch (error) {
      const errMsg = error.response?.data?.message || "Failed to save";
      showMessage("error", "Failed to Save", errMsg);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Accounts</h1>
            <p className="text-muted-foreground">
              Manage your bank accounts and wallets
            </p>
          </div>
          <Button onClick={handleAddClick} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Account
          </Button>
        </div>

        <Card className="gradient-primary text-white p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Wallet className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm opacity-90">Total Balance</p>
              <p className="text-3xl font-bold">{formatAmount(totalBalance)}</p>
              <p className="text-xs opacity-75 mt-1">
                Across {accounts.length} account
                {accounts.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </Card>

        {accounts.length === 0 ? (
          <Card className="text-center py-12">
            <Wallet className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No Accounts Yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your first bank account or wallet
            </p>
            <Button onClick={handleAddClick}>Add Account</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accounts.map((acc, index) => (
              <motion.div
                key={acc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group hover:shadow-xl transition-all relative overflow-hidden">
                  <div
                    className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20"
                    style={{ backgroundColor: acc.color }}
                  />
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                          style={{ backgroundColor: `${acc.color}20` }}
                        >
                          {acc.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{acc.name}</p>
                            {acc.isDefault && (
                              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground capitalize">
                            {acc.type.replace("_", " ")}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => handleEditClick(acc)}
                          className="p-1.5 rounded-lg hover:bg-accent"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(acc.id)}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Balance
                      </p>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: acc.color }}
                      >
                        {formatAmount(acc.balance)}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
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
                  <h2 className="text-xl font-bold">
                    {editingId ? "Edit Account" : "Add Account"}
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 rounded-lg hover:bg-accent"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-5">
                  <Input
                    label="Account Name"
                    placeholder="e.g., SBI Savings, Paytm Wallet"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Account Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {ACCOUNT_TYPES.map((t) => (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              type: t.value,
                              icon: t.icon,
                            })
                          }
                          className={`p-3 rounded-xl border-2 transition text-sm font-medium ${
                            formData.type === t.value
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          {t.icon} {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Input
                    label="Initial Balance"
                    type="number"
                    placeholder="0.00"
                    value={formData.balance}
                    onChange={(e) =>
                      setFormData({ ...formData, balance: e.target.value })
                    }
                  />

                  <label className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isDefault: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded"
                    />
                    <div>
                      <p className="text-sm font-medium">Set as default</p>
                      <p className="text-xs text-muted-foreground">
                        Default account will be pre-selected in forms
                      </p>
                    </div>
                  </label>

                  <div className="flex gap-3 pt-2">
                    <Button type="submit" className="flex-1">
                      {editingId ? "Update" : "Add Account"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsModalOpen(false)}
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

      {/* Message Modal */}
      <AnimatePresence>
        {showMessageModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMessageModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", duration: 0.4 }}
                className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
              >
                <div className="p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.15, stiffness: 200 }}
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
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </Layout>
  );
}
