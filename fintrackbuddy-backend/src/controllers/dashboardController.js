const prisma = require("../utils/prisma");

const getSummary = async (req, res) => {
  try {
    const [expenses, incomes] = await Promise.all([
      prisma.expense.findMany({ where: { userId: req.userId } }),
      prisma.income.findMany({ where: { userId: req.userId } }),
    ]);

    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

    res.json({
      income: totalIncome,
      expense: totalExpense,
      balance: totalIncome - totalExpense,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getExpenseStats = async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: { userId: req.userId },
    });

    const categoryMap = {};
    expenses.forEach((e) => {
      categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
    });

    res.json({
      categories: Object.keys(categoryMap),
      amounts: Object.values(categoryMap),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getSummary, getExpenseStats };
