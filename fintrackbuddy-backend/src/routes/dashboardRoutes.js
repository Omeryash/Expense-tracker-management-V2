const express = require("express");
const router = express.Router();
const {
  getSummary,
  getExpenseStats,
} = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/summary", getSummary);
router.get("/expense-stats", getExpenseStats);

module.exports = router;
