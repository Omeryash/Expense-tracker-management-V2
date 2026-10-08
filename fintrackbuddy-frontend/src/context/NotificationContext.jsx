import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../services/api";
import { AuthContext } from "./AuthContext";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider",
    );
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { token } = useContext(AuthContext);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // ============================================
  // ✅ Fetch all notifications
  // ============================================
  const fetchNotifications = useCallback(async () => {
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setLoading(true);
    try {
      const response = await api.get("/notifications");
      setNotifications(response.data);

      // Count unread
      const unread = response.data.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Fetch notifications error:", error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ✅ Token change hone pe fetch karo
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ✅ Auto-refresh every 5 seconds (turant update ke liye)
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000); // ✅ 5 seconds (pehle 30 tha)

    return () => clearInterval(interval);
  }, [token, fetchNotifications]);

  // ============================================
  // ✅ Mark single as read
  // ============================================
  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (error) {
      console.error("Mark as read error:", error);
    }
  };

  // ============================================
  // ✅ Mark all as read
  // ============================================
  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all");

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Mark all as read error:", error);
    }
  };

  // ============================================
  // ✅ Delete single notification
  // ============================================
  const deleteNotification = async (id) => {
    try {
      const notif = notifications.find((n) => n.id === id);
      const wasUnread = notif && !notif.isRead;

      await api.delete(`/notifications/${id}`);

      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(prev - 1, 0));
      }
    } catch (error) {
      console.error("Delete notification error:", error);
    }
  };

  // ============================================
  // ✅ Delete all notifications
  // ============================================
  const deleteAllNotifications = async () => {
    try {
      await api.delete("/notifications");

      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error("Delete all notifications error:", error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
