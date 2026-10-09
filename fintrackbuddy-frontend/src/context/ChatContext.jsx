import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
import { AuthContext } from "./AuthContext";

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { token } = useContext(AuthContext);

  // ✅ LocalStorage se chat history load karo
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("chatHistory");
    return saved ? JSON.parse(saved) : [];
  });

  const [loading, setLoading] = useState(false);

  // ✅ Har change pe save karo
  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(messages));
  }, [messages]);

  // ✅ Token change hone pe clear karo (logout)
  useEffect(() => {
    if (!token) {
      setMessages([]);
      localStorage.removeItem("chatHistory");
    }
  }, [token]);

  // ============================================
  // ✅ Send Message
  // ============================================
  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;

    // User message add karo
    const userMessage = {
      id: Date.now(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      // History bhejo (last 10 messages)
      const history = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await api.post("/chat", {
        message: text,
        history,
      });

      // AI reply add karo
      const aiMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: response.data.reply,
        timestamp: response.data.timestamp,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat error:", error);

      const errorMessage = {
        id: Date.now() + 2,
        role: "assistant",
        content:
          error.response?.data?.message ||
          "Sorry, I couldn't process that. Please try again.",
        isError: true,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Clear chat
  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem("chatHistory");
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        loading,
        sendMessage,
        clearChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
