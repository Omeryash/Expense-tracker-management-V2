const prisma = require("../utils/prisma");

const getAccounts = async (req, res) => {
  try {
    const accounts = await prisma.account.findMany({
      where: { userId: req.userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    });

    res.json(accounts);
  } catch (error) {
    console.error("Get accounts error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const createAccount = async (req, res) => {
  try {
    const { name, type, balance, icon, color, isDefault } = req.body;

    if (!name || !type) {
      return res.status(400).json({ message: "Name and type required" });
    }

    const validTypes = ["bank", "wallet", "cash", "credit_card"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: "Invalid account type" });
    }

    if (isDefault) {
      await prisma.account.updateMany({
        where: { userId: req.userId },
        data: { isDefault: false },
      });
    }

    const account = await prisma.account.create({
      data: {
        name,
        type,
        balance: parseFloat(balance) || 0,
        icon: icon || "🏦",
        color: color || "#3B82F6",
        isDefault: isDefault || false,
        userId: req.userId,
      },
    });

    res.status(201).json(account);
  } catch (error) {
    console.error("Create account error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, balance, icon, color, isDefault } = req.body;

    const existing = await prisma.account.findFirst({
      where: { id: parseInt(id), userId: req.userId },
    });

    if (!existing) {
      return res.status(404).json({ message: "Account not found" });
    }

    if (isDefault && !existing.isDefault) {
      await prisma.account.updateMany({
        where: { userId: req.userId },
        data: { isDefault: false },
      });
    }

    const account = await prisma.account.update({
      where: { id: parseInt(id) },
      data: {
        name,
        type,
        balance: balance !== undefined ? parseFloat(balance) : undefined,
        icon,
        color,
        isDefault,
      },
    });

    res.json(account);
  } catch (error) {
    console.error("Update account error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.account.findFirst({
      where: { id: parseInt(id), userId: req.userId },
    });

    if (!existing) {
      return res.status(404).json({ message: "Account not found" });
    }

    const [expenseCount, incomeCount] = await Promise.all([
      prisma.expense.count({ where: { accountId: parseInt(id) } }),
      prisma.income.count({ where: { accountId: parseInt(id) } }),
    ]);

    if (expenseCount + incomeCount > 0) {
      return res.status(400).json({
        message: `Cannot delete account with ${expenseCount + incomeCount} transactions. Move them first.`,
      });
    }

    await prisma.account.delete({ where: { id: parseInt(id) } });

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
};
