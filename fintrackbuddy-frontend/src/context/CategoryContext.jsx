import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const CategoryContext = createContext();

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error("useCategories must be used within CategoryProvider");
  }
  return context;
};

// ---------- Helpers ----------
const toArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.categories)) return payload.categories;
  if (Array.isArray(payload?.result)) return payload.result;
  return [];
};

const unwrapItem = (payload) => payload?.data ?? payload;

const withId = (item) => ({ ...item, id: item.id ?? item._id });

// ---------- Provider ----------
export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCategories([]);
      return;
    }

    setLoading(true);
    try {
      const response = await api.get("/categories");

      // Debug — remove after confirming
      // console.log("categories response:", response.data);

      const list = toArray(response.data).map(withId);
      setCategories(list);
    } catch (error) {
      console.error("Fetch categories error:", error);
      setCategories([]); // never leave it undefined
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async (data) => {
    try {
      const response = await api.post("/categories", data);
      const newCategory = withId(unwrapItem(response.data));
      setCategories((prev) => [...prev, newCategory]);
      return newCategory;
    } catch (error) {
      console.error("Add category error:", error);
      throw error;
    }
  };

  const updateCategory = async (id, data) => {
    try {
      const response = await api.put(`/categories/${id}`, data);
      const updated = withId(unwrapItem(response.data));
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
      return updated;
    } catch (error) {
      console.error("Update category error:", error);
      throw error;
    }
  };

  const deleteCategory = async (id) => {
    try {
      await api.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Delete category error:", error);
      throw error;
    }
  };

  // ---------- Derived (safe) ----------
  const safeCategories = Array.isArray(categories) ? categories : [];
  const expenseCategories = safeCategories.filter((c) => c.type === "expense");
  const incomeCategories = safeCategories.filter((c) => c.type === "income");

  return (
    <CategoryContext.Provider
      value={{
        categories: safeCategories,
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
