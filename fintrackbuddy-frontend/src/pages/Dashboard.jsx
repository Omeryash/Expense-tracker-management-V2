import { useContext } from "react";
import { Layout } from "../components/layout/Layout";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
} from "lucide-react";
import { motion } from "framer-motion";
import { ExpensePieChart } from "../components/charts/ExpensePieChart";
import { MonthlyBarChart } from "../components/charts/MonthlyBarChart";
import { AuthContext } from "../context/AuthContext";
import { useExpenses } from "../context/ExpenseContext";
import { useCurrency } from "../context/CurrencyContext";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const { expenses } = useExpenses();
  const { formatAmount, symbol } = useCurrency();

  const totalIncome = expenses
    .filter((e) => e.type === "income")
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpense = expenses
    .filter((e) => e.type === "expense")
    .reduce((sum, e) => sum + e.amount, 0);

  const balance = totalIncome - totalExpense;

  const recentTransactions = expenses.slice(0, 5);

  const statCards = [
    {
      title: "Total Income",
      amount: totalIncome,
      change: "+12.5%",
      trend: "up",
      icon: TrendingUp,
      gradient: "gradient-success",
      color: "text-green-600",
    },
    {
      title: "Total Expense",
      amount: totalExpense,
      change: "+8.2%",
      trend: "down",
      icon: TrendingDown,
      gradient: "gradient-danger",
      color: "text-red-600",
    },
    {
      title: "Balance",
      amount: balance,
      change: "+15.3%",
      trend: "up",
      icon: Wallet,
      gradient: "gradient-primary",
      color: "text-blue-600",
    },
  ];

  return (
    <Layout>
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold mb-2"
        >
          Dashboard
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground"
        >
          Welcome back, {user?.name || "User"}! Here's your financial overview
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden group">
              <div
                className={`absolute top-0 right-0 w-32 h-32 ${card.gradient} opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`}
              />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-muted">
                    <card.icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                  <span
                    className={`flex items-center gap-1 text-sm font-medium ${
                      card.trend === "up" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {card.change}
                    {card.trend === "up" ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {card.title}
                </p>
                {/* ✅ Yahan formatAmount use karo */}
                <p className="text-3xl font-bold">
                  {formatAmount(card.amount)}
                </p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-0 overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold">Expense Distribution</h3>
            <p className="text-sm text-muted-foreground">By category</p>
          </div>
          <div className="p-6">
            <ExpensePieChart />
          </div>
        </Card>

        <Card className="p-0 overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold">Monthly Overview</h3>
            <p className="text-sm text-muted-foreground">Income vs Expenses</p>
          </div>
          <div className="p-6">
            <MonthlyBarChart />
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Recent Transactions</h3>
            <p className="text-sm text-muted-foreground">
              Your latest activity
            </p>
          </div>
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </div>

        <div className="space-y-3">
          {recentTransactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-4 rounded-xl hover:bg-accent transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl">
                  {transaction.icon}
                </div>
                <div>
                  <p className="font-medium">{transaction.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {transaction.category} • {transaction.date}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* ✅ Yahan bhi formatAmount */}
                <p
                  className={`font-semibold ${
                    transaction.type === "income"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {formatAmount(Math.abs(transaction.amount))}
                </p>
                <button className="opacity-0 group-hover:opacity-100 transition">
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </motion.div>
          ))}

          {recentTransactions.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No transactions yet. Start adding expenses or income!
            </p>
          )}
        </div>
      </Card>
    </Layout>
  );
}
