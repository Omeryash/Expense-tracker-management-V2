const express = require("express");
const router = express.Router();
const { chatWithAI } = require("../controllers/chatController");
const authMiddleware = require("../middleware/authMiddleware");

// ✅ Protected route
router.post("/", authMiddleware, chatWithAI);

module.exports = router;
