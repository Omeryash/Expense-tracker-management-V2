const prisma = require("../utils/prisma");
const { createNotification } = require("./notificationController"); // ✅ NEW

const getExpenses = async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: { userId: req.userId },
      orderBy: { date: "desc" },
    });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const createExpense = async (req, res) => {
  try {
    const { title, amount, category, date, description, icon } = req.body;

    if (!title || !amount || !category || !date) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const expense = await prisma.expense.create({
      data: {
        title,
        amount: parseFloat(amount),
        category,
        date: new Date(date),
        description: description || "",
        icon: icon || "💸",
        userId: req.userId,
      },
    });

    // ✅ Auto notification: Expense added
    await createNotification(
      req.userId,
      "Expense Added 💸",
      `${title} - ₹${parseFloat(amount).toLocaleString()}`,
      "info",
      icon || "💸",
      "/expenses",
    );

    res.status(201).json(expense);
  } catch (error) {
    console.error("Create expense error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, category, date, description, icon } = req.body;

    const existing = await prisma.expense.findFirst({
      where: { id: parseInt(id), userId: req.userId },
    });

    if (!existing) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const expense = await prisma.expense.update({
      where: { id: parseInt(id) },
      data: {
        title,
        amount: parseFloat(amount),
        category,
        date: new Date(date),
        description,
        icon,
      },
    });

    // ✅ Auto notification: Expense updated
    await createNotification(
      req.userId,
      "Expense Updated ✏️",
      `${title} - ₹${parseFloat(amount).toLocaleString()}`,
      "info",
      "✏️",
      "/expenses",
    );

    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.expense.findFirst({
      where: { id: parseInt(id), userId: req.userId },
    });

    if (!existing) {
      return res.status(404).json({ message: "Expense not found" });
    }

    await prisma.expense.delete({ where: { id: parseInt(id) } });

    // ✅ Auto notification: Expense deleted
    await createNotification(
      req.userId,
      "Expense Deleted 🗑️",
      `${existing.title} (₹${existing.amount.toLocaleString()}) removed`,
      "warning",
      "🗑️",
      "/expenses",
    );

    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getExpenses, createExpense, updateExpense, deleteExpense };
