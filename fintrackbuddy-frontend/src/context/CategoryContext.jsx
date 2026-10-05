import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
import { AuthContext } from "./AuthContext";

const CategoryContext = createContext();

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error("useCategories must be used within CategoryProvider");
  }
  return context;
};

export const CategoryProvider = ({ children }) => {
  const { token } = useContext(AuthContext);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    if (!token) {
      setCategories([]);
      return;
    }

    setLoading(true);
    try {
      const response = await api.get("/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Fetch categories error:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Token change hone pe dobara fetch karo
  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const addCategory = async (data) => {
    const response = await api.post("/categories", data);
    setCategories((prev) => [...prev, response.data]);
    return response.data;
  };

  const updateCategory = async (id, data) => {
    const response = await api.put(`/categories/${id}`, data);
    setCategories((prev) => prev.map((c) => (c.id === id ? response.data : c)));
    return response.data;
  };

  const deleteCategory = async (id) => {
    await api.delete(`/categories/${id}`);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const expenseCategories = categories.filter((c) => c.type === "expense");
  const incomeCategories = categories.filter((c) => c.type === "income");

  return (
    <CategoryContext.Provider
      value={{
        categories,
        expenseCategories,
        incomeCategories,
        loading,
        addCategory,
        updateCategory,
        deleteCategory,
        refetch: fetchCategories,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};
