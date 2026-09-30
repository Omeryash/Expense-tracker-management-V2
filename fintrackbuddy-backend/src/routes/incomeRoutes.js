const express = require("express");
const router = express.Router();
const {
  getIncomes,
  createIncome,
  updateIncome,
  deleteIncome,
} = require("../controllers/incomeController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/", getIncomes);
router.post("/", createIncome);
router.put("/:id", updateIncome);
router.delete("/:id", deleteIncome);

module.exports = router;
