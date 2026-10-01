import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  ArrowLeft,
  DollarSign,
  Briefcase,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { useExpenses } from "../context/ExpenseContext";

export default function AddIncome() {
  const navigate = useNavigate();
  const { addIncome } = useExpenses();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    source: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    category: "Salary",
    description: "",
  });

  const incomeCategories = [
    { name: "Salary", icon: "💰" },
    { name: "Freelance", icon: "💻" },
    { name: "Business", icon: "🏢" },
    { name: "Investment", icon: "📈" },
    { name: "Gift", icon: "🎁" },
    { name: "Other", icon: "📝" },
  ];

  const categoryIcons = {
    Salary: "💰",
    Freelance: "💻",
    Business: "🏢",
    Investment: "📈",
    Gift: "🎁",
    Other: "📝",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ Backend API call
      await addIncome({
        title: formData.source,
        source: formData.source,
        amount: formData.amount,
        category: formData.category,
        date: formData.date,
        description: formData.description,
        icon: categoryIcons[formData.category] || "💰",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Add income error:", error);
      alert(
        error.response?.data?.message ||
          "Failed to add income. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 rounded-xl hover:bg-accent transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold">Add Income</h1>
            <p className="text-muted-foreground">
              Record your earnings and track your revenue
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="overflow-hidden">
            <div className="gradient-success p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">New Income Entry</h2>
                  <p className="text-white/90 text-sm">
                    Add your earnings to track your financial growth
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Income Source
                </label>
                <Input
                  placeholder="e.g., Salary, Freelance Project, Business Income"
                  value={formData.source}
                  onChange={(e) =>
                    setFormData({ ...formData, source: e.target.value })
                  }
                  icon={<Briefcase className="w-4 h-4" />}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Amount</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  icon={<DollarSign className="w-4 h-4" />}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Category
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {incomeCategories.map((cat) => (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, category: cat.name })
                      }
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                        formData.category === cat.name
                          ? "border-green-500 bg-green-500/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <span className="text-xl">{cat.icon}</span>
                      <span className="text-sm font-medium">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  icon={<Calendar className="w-4 h-4" />}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows="3"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="Add any additional notes about this income..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  loading={loading}
                  className="flex-1 gradient-success"
                >
                  Add Income
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>

        <Card className="bg-muted/30">
          <h3 className="font-semibold mb-2">💡 Pro Tip</h3>
          <p className="text-sm text-muted-foreground">
            Regularly tracking your income helps you understand your cash flow
            better. Categorize your income sources to identify your most
            profitable streams!
          </p>
        </Card>
      </div>
    </Layout>
  );
}
