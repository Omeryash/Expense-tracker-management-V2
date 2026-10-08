const prisma = require("../utils/prisma");
const { createNotification } = require("./notificationController"); // ✅ NEW

const getIncomes = async (req, res) => {
  try {
    const incomes = await prisma.income.findMany({
      where: { userId: req.userId },
      orderBy: { date: "desc" },
    });
    res.json(incomes);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const createIncome = async (req, res) => {
  try {
    const { source, amount, category, date, icon } = req.body;

    if (!source || !amount || !category || !date) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const income = await prisma.income.create({
      data: {
        source,
        amount: parseFloat(amount),
        category,
        date: new Date(date),
        icon: icon || "💰",
        userId: req.userId,
      },
    });

    // ✅ Auto notification: Income added
    await createNotification(
      req.userId,
      "Income Added 💰",
      `${source} - ₹${parseFloat(amount).toLocaleString()}`,
      "success",
      icon || "💰",
      "/transactions",
    );

    res.status(201).json(income);
  } catch (error) {
    console.error("Create income error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const { source, amount, category, date, icon } = req.body;

    const existing = await prisma.income.findFirst({
      where: { id: parseInt(id), userId: req.userId },
    });

    if (!existing) {
      return res.status(404).json({ message: "Income not found" });
    }

    const income = await prisma.income.update({
      where: { id: parseInt(id) },
      data: {
        source,
        amount: parseFloat(amount),
        category,
        date: new Date(date),
        icon,
      },
    });

    // ✅ Auto notification: Income updated
    await createNotification(
      req.userId,
      "Income Updated ✏️",
      `${source} - ₹${parseFloat(amount).toLocaleString()}`,
      "info",
      "✏️",
      "/transactions",
    );

    res.json(income);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const deleteIncome = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.income.findFirst({
      where: { id: parseInt(id), userId: req.userId },
    });

    if (!existing) {
      return res.status(404).json({ message: "Income not found" });
    }

    await prisma.income.delete({ where: { id: parseInt(id) } });

    // ✅ Auto notification: Income deleted
    await createNotification(
      req.userId,
      "Income Deleted 🗑️",
      `${existing.source} (₹${existing.amount.toLocaleString()}) removed`,
      "warning",
      "🗑️",
      "/transactions",
    );

    res.json({ message: "Income deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getIncomes, createIncome, updateIncome, deleteIncome };
