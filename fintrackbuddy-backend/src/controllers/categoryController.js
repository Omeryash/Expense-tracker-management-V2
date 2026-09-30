const prisma = require("../utils/prisma");

// Default categories
const DEFAULT_EXPENSE_CATEGORIES = [
  { name: "Food", icon: "🍕", color: "#EF4444" },
  { name: "Transport", icon: "🚗", color: "#3B82F6" },
  { name: "Shopping", icon: "🛍️", color: "#8B5CF6" },
  { name: "Bills", icon: "📄", color: "#F59E0B" },
  { name: "Entertainment", icon: "🎬", color: "#EC4899" },
  { name: "Healthcare", icon: "🏥", color: "#10B981" },
  { name: "Education", icon: "📚", color: "#6366F1" },
  { name: "Other", icon: "📁", color: "#6B7280" },
];

const DEFAULT_INCOME_CATEGORIES = [
  { name: "Salary", icon: "💰", color: "#10B981" },
  { name: "Freelance", icon: "💻", color: "#3B82F6" },
  { name: "Business", icon: "🏢", color: "#8B5CF6" },
  { name: "Investment", icon: "📈", color: "#F59E0B" },
  { name: "Gift", icon: "🎁", color: "#EC4899" },
  { name: "Other", icon: "📝", color: "#6B7280" },
];

// Get all categories
const getCategories = async (req, res) => {
  try {
    const { type } = req.query;

    const where = { userId: req.userId };
    if (type) where.type = type;

    let categories = await prisma.category.findMany({
      where,
      orderBy: { createdAt: "asc" },
    });

    // Agar koi category nahi hai, to default create karo
    if (categories.length === 0) {
      const defaults = [];

      for (const cat of DEFAULT_EXPENSE_CATEGORIES) {
        defaults.push({
          ...cat,
          type: "expense",
          isDefault: true,
          userId: req.userId,
        });
      }

      for (const cat of DEFAULT_INCOME_CATEGORIES) {
        defaults.push({
          ...cat,
          type: "income",
          isDefault: true,
          userId: req.userId,
        });
      }

      await prisma.category.createMany({ data: defaults });

      categories = await prisma.category.findMany({
        where,
        orderBy: { createdAt: "asc" },
      });
    }

    res.json(categories);
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create category
const createCategory = async (req, res) => {
  try {
    const { name, icon, color, type } = req.body;

    if (!name || !type) {
      return res.status(400).json({ message: "Name and type required" });
    }

    if (!["expense", "income"].includes(type)) {
      return res
        .status(400)
        .json({ message: "Type must be expense or income" });
    }

    // Check duplicate
    const existing = await prisma.category.findFirst({
      where: {
        userId: req.userId,
        name: { equals: name, mode: "insensitive" },
        type,
      },
    });

    if (existing) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = await prisma.category.create({
      data: {
        name,
        icon: icon || "📁",
        color: color || "#3B82F6",
        type,
        isDefault: false,
        userId: req.userId,
      },
    });

    res.status(201).json(category);
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, color } = req.body;

    const existing = await prisma.category.findFirst({
      where: { id: parseInt(id), userId: req.userId },
    });

    if (!existing) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (existing.isDefault) {
      return res.status(400).json({ message: "Cannot edit default category" });
    }

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { name, icon, color },
    });

    res.json(category);
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.category.findFirst({
      where: { id: parseInt(id), userId: req.userId },
    });

    if (!existing) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (existing.isDefault) {
      return res
        .status(400)
        .json({ message: "Cannot delete default category" });
    }

    await prisma.category.delete({ where: { id: parseInt(id) } });

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
