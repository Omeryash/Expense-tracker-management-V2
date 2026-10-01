import { useState } from "react";
import { Layout } from "../components/layout/Layout";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Plus, Edit2, Trash2, Tag, CheckCircle2, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCategories } from "../context/CategoryContext";

const ICON_OPTIONS = [
  "🍕",
  "🚗",
  "🛍️",
  "📄",
  "🎬",
  "🏥",
  "📚",
  "💪",
  "🎮",
  "✈️",
  "🐾",
  "💡",
  "📱",
  "🏠",
  "💰",
  "💻",
  "🏢",
  "📈",
  "🎁",
  "📝",
];
const COLOR_OPTIONS = [
  "#EF4444",
  "#3B82F6",
  "#8B5CF6",
  "#F59E0B",
  "#EC4899",
  "#10B981",
  "#6366F1",
  "#6B7280",
];

export default function Categories() {
  const { categories, addCategory, updateCategory, deleteCategory } =
    useCategories();
  const [activeTab, setActiveTab] = useState("expense");
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
    icon: "📁",
    color: "#3B82F6",
    type: "expense",
  });

  const filteredCategories = categories.filter((c) => c.type === activeTab);
  const expenseCount = categories.filter((c) => c.type === "expense").length;
  const incomeCount = categories.filter((c) => c.type === "income").length;

  const showMessage = (type, title, message) => {
    setMessageData({ type, title, message });
    setShowMessageModal(true);
  };

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({
      name: "",
      icon: "📁",
      color: "#3B82F6",
      type: activeTab,
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (cat) => {
    setEditingId(cat.id);
    setFormData({
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      type: cat.type,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this category?")) {
      try {
        await deleteCategory(id);
        showMessage(
          "success",
          "Category Deleted",
          "Category removed successfully",
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
      showMessage("error", "Invalid Name", "Please enter a category name");
      return;
    }

    try {
      if (editingId) {
        await updateCategory(editingId, formData);
        showMessage(
          "success",
          "Category Updated",
          `${formData.name} has been updated`,
        );
      } else {
        await addCategory(formData);
        showMessage(
          "success",
          "Category Added",
          `${formData.name} has been created`,
        );
      }
      setTimeout(() => setIsModalOpen(false), 1500);
    } catch (error) {
      const errMsg = error.response?.data?.message || "Failed to save category";
      showMessage("error", "Failed to Save", errMsg);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Categories</h1>
            <p className="text-muted-foreground">
              Organize your expenses and income
            </p>
          </div>
          <Button onClick={handleAddClick} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Category
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="gradient-primary text-white">
            <p className="text-sm opacity-90">Total Categories</p>
            <p className="text-2xl font-bold mt-1">{categories.length}</p>
          </Card>
          <Card>
            <p className="text-sm text-muted-foreground">Expense Categories</p>
            <p className="text-2xl font-bold mt-1">{expenseCount}</p>
          </Card>
          <Card>
            <p className="text-sm text-muted-foreground">Income Categories</p>
            <p className="text-2xl font-bold mt-1">{incomeCount}</p>
          </Card>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("expense")}
            className={`px-6 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === "expense"
                ? "gradient-danger text-white shadow-lg"
                : "bg-muted hover:bg-accent"
            }`}
          >
            💸 Expense ({expenseCount})
          </button>
          <button
            onClick={() => setActiveTab("income")}
            className={`px-6 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === "income"
                ? "gradient-success text-white shadow-lg"
                : "bg-muted hover:bg-accent"
            }`}
          >
            💰 Income ({incomeCount})
          </button>
        </div>

        {filteredCategories.length === 0 ? (
          <Card className="text-center py-12">
            <Tag className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No Categories</h3>
            <p className="text-muted-foreground mb-4">
              Start by adding your first category
            </p>
            <Button onClick={handleAddClick}>Add Category</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredCategories.map((cat, index) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card className="group hover:shadow-xl transition-all">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${cat.color}20` }}
                    >
                      {cat.icon}
                    </div>
                    <div>
                      <p className="font-semibold">{cat.name}</p>
                      {cat.isDefault && (
                        <span className="text-xs text-muted-foreground">
                          Default
                        </span>
                      )}
                    </div>

                    {!cat.isDefault && (
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => handleEditClick(cat)}
                          className="p-1.5 rounded-lg hover:bg-accent transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
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
                    {editingId ? "Edit Category" : "Add Category"}
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
                    label="Category Name"
                    placeholder="e.g., Gym, Pet Care"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />

                  {!editingId && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Type</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, type: "expense" })
                          }
                          className={`p-3 rounded-xl border-2 transition ${
                            formData.type === "expense"
                              ? "border-red-500 bg-red-500/10"
                              : "border-border"
                          }`}
                        >
                          💸 Expense
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, type: "income" })
                          }
                          className={`p-3 rounded-xl border-2 transition ${
                            formData.type === "income"
                              ? "border-green-500 bg-green-500/10"
                              : "border-border"
                          }`}
                        >
                          💰 Income
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Icon</label>
                    <div className="grid grid-cols-8 gap-2">
                      {ICON_OPTIONS.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => setFormData({ ...formData, icon })}
                          className={`p-2 rounded-lg text-xl transition ${
                            formData.icon === icon
                              ? "bg-primary/20 ring-2 ring-primary"
                              : "hover:bg-accent"
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Color</label>
                    <div className="flex gap-2 flex-wrap">
                      {COLOR_OPTIONS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormData({ ...formData, color })}
                          className={`w-10 h-10 rounded-full transition ${
                            formData.color === color
                              ? "ring-2 ring-offset-2 ring-primary"
                              : ""
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-xl">
                    <p className="text-xs text-muted-foreground mb-2">
                      Preview
                    </p>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                        style={{ backgroundColor: `${formData.color}20` }}
                      >
                        {formData.icon}
                      </div>
                      <span className="font-medium">
                        {formData.name || "Category Name"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button type="submit" className="flex-1">
                      {editingId ? "Update" : "Add Category"}
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
