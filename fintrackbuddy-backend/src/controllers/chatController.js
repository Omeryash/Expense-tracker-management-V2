const { groq } = require("@ai-sdk/groq");
const { generateText } = require("ai");
const prisma = require("../utils/prisma");

// ============================================
// ✅ AI Chat Handler
// ============================================
const chatWithAI = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    // ✅ User ka financial data fetch karo
    const [expenses, incomes] = await Promise.all([
      prisma.expense.findMany({
        where: { userId: req.userId },
        orderBy: { date: "desc" },
        take: 20,
      }),
      prisma.income.findMany({
        where: { userId: req.userId },
        orderBy: { date: "desc" },
        take: 20,
      }),
    ]);

    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
    const balance = totalIncome - totalExpense;

    const categoryTotals = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

    const categoryBreakdown = Object.entries(categoryTotals)
      .map(([cat, amt]) => `${cat}: ₹${amt.toFixed(2)}`)
      .join(", ");

    const systemPrompt = `You are FinTrackBuddy AI, a helpful financial assistant.

User's Financial Context:
- Total Income: ₹${totalIncome.toFixed(2)}
- Total Expense: ₹${totalExpense.toFixed(2)}
- Balance: ₹${balance.toFixed(2)}
- Recent Expense Categories: ${categoryBreakdown || "No expenses yet"}

Guidelines:
- Answer in a helpful, friendly tone
- Use Hinglish (Hindi + English mix) if user writes in Hinglish
- Give practical financial advice
- Keep responses short and clear
- Use emojis occasionally to be friendly
- If user asks about their money, use the context above
- Never make up numbers - use only the provided data`;

    // ✅ System prompt alag, messages alag
    const messages = [
      ...(history || []).slice(-10),
      { role: "user", content: message },
    ];

    const { text } = await generateText({
      model: groq("openai/gpt-oss-120b"),
      instructions: systemPrompt, // ✅ YEH CHANGE
      messages,
    });

    res.json({
      reply: text,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({
      message: "Failed to get AI response",
      error: error.message,
    });
  }
};

module.exports = { chatWithAI };
