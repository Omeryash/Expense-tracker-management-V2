const express = require("express");
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
} = require("../controllers/notificationController");
const authMiddleware = require("../middleware/authMiddleware");

// ✅ Saare routes protected hain
router.use(authMiddleware);

// GET all notifications
router.get("/", getNotifications);

// GET unread count
router.get("/unread-count", getUnreadCount);

// PUT mark single as read
router.put("/:id/read", markAsRead);

// PUT mark all as read
router.put("/read-all", markAllAsRead);

// DELETE single notification
router.delete("/:id", deleteNotification);

// DELETE all notifications
router.delete("/", deleteAllNotifications);

module.exports = router;
