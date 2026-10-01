import { useState } from "react";
import { Layout } from "../components/layout/Layout";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Calendar as CalendarIcon,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { useExpenses } from "../context/ExpenseContext";

export default function Expenses() {
  const { expenses, addExpense, updateExpense, deleteExpense } = useExpenses();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "Food",
    date: new Date().toISOString().split("T")[0],
  });

  const categories = [
    "All",
    "Food",
    "Transport",
    "Entertainment",
    "Bills",
    "Shopping",
  ];

  const categoryIcons = {
    Food: "🍕",
    Transport: "🚗",
    Entertainment: "🎬",
    Bills: "📄",
    Shopping: "🛍️",
  };

  const onlyExpenses = expenses.filter((e) => e.type === "expense");

  const filteredExpenses = onlyExpenses.filter((expense) => {
    const matchesSearch = expense.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || expense.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalExpense = onlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const averageExpense =
    onlyExpenses.length > 0 ? totalExpense / onlyExpenses.length : 0;
  const highestExpense =
    onlyExpenses.length > 0
      ? Math.max(...onlyExpenses.map((e) => e.amount))
      : 0;

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({
      title: "",
      amount: "",
      category: "Food",
      date: new Date().toISOString().split("T")[0],
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (expense) => {
    setEditingId(expense.id);
    setFormData({
      title: expense.title,
      amount: expense.amount.toString(),
      category: expense.category,
      date: expense.date,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this expense?")) {
      deleteExpense(id);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title || !formData.amount) {
      alert("Please fill all required fields");
      return;
    }

    if (editingId) {
      updateExpense(editingId, {
        ...formData,
        icon: categoryIcons[formData.category] || "💸",
      });
    } else {
      addExpense({
        ...formData,
        icon: categoryIcons[formData.category] || "💸",
        type: "expense",
      });
    }

    setFormData({
      title: "",
      amount: "",
      category: "Food",
      date: new Date().toISOString().split("T")[0],
    });
    setEditingId(null);
    setIsModalOpen(false);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Expenses</h1>
            <p className="text-muted-foreground">
              Track and manage your spending
            </p>
          </div>
          <Button onClick={handleAddClick} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Expense
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="gradient-danger text-white">
            <p className="text-sm opacity-90">Total Expenses</p>
            <p className="text-2xl font-bold mt-1">
              ${totalExpense.toLocaleString()}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-muted-foreground">Average Expense</p>
            <p className="text-2xl font-bold mt-1">
              ${averageExpense.toFixed(2)}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-muted-foreground">Highest Expense</p>
            <p className="text-2xl font-bold mt-1">${highestExpense}</p>
          </Card>
          <Card>
            <p className="text-sm text-muted-foreground">Total Entries</p>
            <p className="text-2xl font-bold mt-1">{onlyExpenses.length}</p>
          </Card>
        </div>

        <Card>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap
                    ${
                      selectedCategory === cat
                        ? "gradient-primary text-white shadow-lg"
                        : "bg-muted text-muted-foreground hover:bg-accent"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <div className="space-y-3">
          {filteredExpenses.map((expense, index) => (
            <motion.div
              key={expense.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="group hover:shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-xl">
                        {expense.icon}
                      </div>
                      <div>
                        <p className="font-semibold">{expense.title}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{expense.category}</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            <span>{expense.date}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-xl font-bold text-red-600">
                      ${expense.amount}
                    </p>
                    <div className="flex gap-2 md:opacity-0 md:group-hover:opacity-100 transition">
                      <button
                        onClick={() => handleEditClick(expense)}
                        className="p-2 rounded-lg hover:bg-accent transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="p-2 rounded-lg hover:bg-destructive/10 transition text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredExpenses.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-muted-foreground">No expenses found</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-xl font-bold">
                {editingId ? "Edit Expense" : "Add New Expense"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg hover:bg-accent transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-5 space-y-4 max-h-[70vh] overflow-y-auto"
            >
              <Input
                label="Title"
                placeholder="e.g., Grocery Shopping"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />

              <Input
                label="Amount"
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                required
              />

              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    "Food",
                    "Transport",
                    "Entertainment",
                    "Bills",
                    "Shopping",
                  ].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, category: cat })
                      }
                      className={`p-3 rounded-xl border-2 transition-all text-sm font-medium flex flex-col items-center gap-1
                        ${
                          formData.category === cat
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                    >
                      <span className="text-xl">{categoryIcons[cat]}</span>
                      <span>{cat}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label="Date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  {editingId ? "Update Expense" : "Add Expense"}
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
      )}
    </Layout>
  );
}
