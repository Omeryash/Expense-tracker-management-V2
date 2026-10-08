const prisma = require("../utils/prisma");

// ============================================
// ✅ GET ALL NOTIFICATIONS
// ============================================
const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      take: 50, // Last 50 notifications
    });

    res.json(notifications);
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================================
// ✅ GET UNREAD COUNT
// ============================================
const getUnreadCount = async (req, res) => {
  try {
    const count = await prisma.notification.count({
      where: {
        userId: req.userId,
        isRead: false,
      },
    });

    res.json({ count });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================================
// ✅ MARK AS READ
// ============================================
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
      where: {
        id: parseInt(id),
        userId: req.userId,
      },
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    const updated = await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { isRead: true },
    });

    res.json(updated);
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================================
// ✅ MARK ALL AS READ
// ============================================
const markAllAsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: {
        userId: req.userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark all as read error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================================
// ✅ DELETE NOTIFICATION
// ============================================
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
      where: {
        id: parseInt(id),
        userId: req.userId,
      },
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    await prisma.notification.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Notification deleted" });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================================
// ✅ DELETE ALL NOTIFICATIONS
// ============================================
const deleteAllNotifications = async (req, res) => {
  try {
    await prisma.notification.deleteMany({
      where: { userId: req.userId },
    });

    res.json({ message: "All notifications deleted" });
  } catch (error) {
    console.error("Delete all notifications error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================================
// ✅ CREATE NOTIFICATION (Helper Function)
// ============================================
const createNotification = async (
  userId,
  title,
  message,
  type = "info",
  icon = "🔔",
  link = null,
) => {
  try {
    // Check if user has notifications enabled
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { notificationsEnabled: true },
    });

    if (!user || !user.notificationsEnabled) {
      return null; // User ne notifications off kiye hue hain
    }

    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type,
        icon,
        link,
        userId,
      },
    });

    return notification;
  } catch (error) {
    console.error("Create notification error:", error);
    return null;
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  createNotification,
};
