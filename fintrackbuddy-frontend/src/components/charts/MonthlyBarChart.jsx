import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useExpenses } from "../../context/ExpenseContext";
import { useCurrency } from "../../context/CurrencyContext";

export const MonthlyBarChart = () => {
  const { expenses } = useExpenses();
  const { symbol } = useCurrency();

  // ✅ Real data se month-wise income/expense calculate karo
  const monthlyData = expenses.reduce((acc, expense) => {
    const month = new Date(expense.date).toLocaleString("en-US", {
      month: "short",
    });
    if (!acc[month]) {
      acc[month] = { month, income: 0, expense: 0 };
    }
    if (expense.type === "income") {
      acc[month].income += expense.amount;
    } else {
      acc[month].expense += expense.amount;
    }
    return acc;
  }, {});

  const data = Object.values(monthlyData);

  // ✅ Agar data khaali hai to empty state dikhao
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        <div className="text-center">
          <p className="text-4xl mb-2">📊</p>
          <p>No monthly data yet</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
        <YAxis stroke="hsl(var(--muted-foreground))" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "12px",
          }}
          // ✅ Tooltip mein currency symbol
          formatter={(value) => `${symbol}${value.toLocaleString()}`}
        />
        <Legend />
        <Bar
          dataKey="income"
          fill="#10B981"
          radius={[8, 8, 0, 0]}
          name="Income"
        />
        <Bar
          dataKey="expense"
          fill="#EF4444"
          radius={[8, 8, 0, 0]}
          name="Expense"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
