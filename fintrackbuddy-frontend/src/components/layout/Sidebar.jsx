import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  History,
  BarChart3,
  User,
  Settings,
  Tag,
  CreditCard,
  X,
} from "lucide-react";
import { useExpenses } from "../../context/ExpenseContext";
import { useCurrency } from "../../context/CurrencyContext";

const navItems = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/expenses", icon: Wallet, label: "Expenses" },
  { path: "/add-income", icon: TrendingUp, label: "Add Income" },
  { path: "/transactions", icon: History, label: "Transactions" },
  { path: "/analytics", icon: BarChart3, label: "Analytics" },
  { path: "/categories", icon: Tag, label: "Categories" },
  { path: "/accounts", icon: CreditCard, label: "Accounts" },
  { path: "/profile", icon: User, label: "Profile" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export const Sidebar = ({ isOpen, onClose }) => {
  const { expenses } = useExpenses();
  const { formatAmount } = useCurrency();

  // ✅ Current month ka data
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const monthlyData = expenses.filter((item) => {
    const itemDate = new Date(item.date);
    return (
      itemDate.getMonth() === currentMonth &&
      itemDate.getFullYear() === currentYear
    );
  });

  const monthlyIncome = monthlyData
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);

  const monthlyExpense = monthlyData
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  const monthlySavings = monthlyIncome - monthlyExpense;

  const savingsPercentage =
    monthlyIncome > 0
      ? Math.min(Math.max((monthlySavings / monthlyIncome) * 100, 0), 100)
      : 0;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">
              FinTrackBuddy
            </h1>
            <p className="text-xs text-muted-foreground">Premium Finance</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-accent transition"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
              ${
                isActive
                  ? "gradient-primary text-white shadow-lg"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }
            `}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ✅ Dynamic Monthly Savings */}
      <div className="p-6 border-t border-border">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                monthlySavings >= 0 ? "bg-green-500/20" : "bg-red-500/20"
              }`}
            >
              <TrendingUp
                className={`w-5 h-5 ${
                  monthlySavings >= 0 ? "text-green-500" : "text-red-500"
                }`}
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Monthly Savings</p>
              <p
                className={`text-lg font-bold truncate ${
                  monthlySavings >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {formatAmount(monthlySavings)}
              </p>
            </div>
          </div>
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                monthlySavings >= 0 ? "bg-green-500" : "bg-red-500"
              }`}
              style={{ width: `${savingsPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="hidden lg:block fixed left-0 top-0 h-screen w-72 border-r border-border bg-card/50 backdrop-blur-xl z-30"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="lg:hidden fixed left-0 top-0 h-screen w-72 border-r border-border bg-card z-50 shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
