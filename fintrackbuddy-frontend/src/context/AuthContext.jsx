import { createContext, useState } from "react";
import api from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // ✅ Login function
  const login = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // ✅ Logout function
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  // ✅ Change Password function
  const changePassword = async (currentPassword, newPassword) => {
    const response = await api.put("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  };

  // ============================================
  // ✅ NEW: Update Profile
  // ============================================
  const updateProfile = async (data) => {
    const response = await api.put("/auth/profile", data);
    setUser(response.data.user);
    localStorage.setItem("user", JSON.stringify(response.data.user));
    return response.data;
  };

  // ============================================
  // ✅ NEW: Upload Avatar
  // ============================================
  const uploadAvatar = async (file) => {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await api.post("/auth/profile/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    setUser(response.data.user);
    localStorage.setItem("user", JSON.stringify(response.data.user));
    return response.data;
  };

  // ============================================
  // ✅ NEW: Remove Avatar
  // ============================================
  const removeAvatar = async () => {
    const response = await api.delete("/auth/profile/avatar");
    setUser(response.data.user);
    localStorage.setItem("user", JSON.stringify(response.data.user));
    return response.data;
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        changePassword,
        updateProfile,
        uploadAvatar,
        removeAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
