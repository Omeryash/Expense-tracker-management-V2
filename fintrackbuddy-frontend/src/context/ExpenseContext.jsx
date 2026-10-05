import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
import { AuthContext } from "./AuthContext";

const ExpenseContext = createContext();

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error("useExpenses must be used within ExpenseProvider");
  }
  return context;
};

export const ExpenseProvider = ({ children }) => {
  const { token } = useContext(AuthContext);

  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!token) {
      setExpenses([]);
      setIncomes([]);
      return;
    }

    setLoading(true);
    try {
      const [expRes, incRes] = await Promise.all([
        api.get("/expenses"),
        api.get("/incomes"),
      ]);

      setIncomes(incRes.data);

      const allData = [
        ...expRes.data.map((e) => ({ ...e, type: "expense" })),
        ...incRes.data.map((i) => ({
          ...i,
          type: "income",
          title: i.source,
        })),
      ];

      setExpenses(allData);
    } catch (error) {
      console.error("Fetch error:", error);
      setExpenses([]);
      setIncomes([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Token change hone pe dobara fetch karo
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const addExpense = async (data) => {
    try {
      const response = await api.post("/expenses", data);
      const newExpense = { ...response.data, type: "expense" };
      setExpenses((prev) => [newExpense, ...prev]);
      return newExpense;
    } catch (error) {
      console.error("Add expense error:", error);
      throw error;
    }
  };

  const addIncome = async (data) => {
    try {
      const response = await api.post("/incomes", {
        source: data.title || data.source,
        amount: data.amount,
        category: data.category,
        date: data.date,
        icon: data.icon,
      });
      const newIncome = {
        ...response.data,
        type: "income",
        title: response.data.source,
      };
      setExpenses((prev) => [newIncome, ...prev]);
      setIncomes((prev) => [response.data, ...prev]);
      return newIncome;
    } catch (error) {
      console.error("Add income error:", error);
      throw error;
    }
  };

  const updateExpense = async (id, data) => {
    try {
      const type = data.type || "expense";
      const endpoint = type === "income" ? "incomes" : "expenses";

      const updateData =
        type === "income"
          ? { ...data, source: data.source || data.title }
          : data;

      const response = await api.put(`/${endpoint}/${id}`, updateData);

      setExpenses((prev) =>
        prev.map((e) =>
          e.id === id
            ? {
                ...response.data,
                type,
                title:
                  type === "income"
                    ? response.data.source
                    : response.data.title,
              }
            : e,
        ),
      );
    } catch (error) {
      console.error("Update error:", error);
      throw error;
    }
  };

  const deleteExpense = async (id) => {
    try {
      const item = expenses.find((e) => e.id === id);
      const type = item?.type || "expense";
      const endpoint = type === "income" ? "incomes" : "expenses";

      await api.delete(`/${endpoint}/${id}`);

      setExpenses((prev) => prev.filter((e) => e.id !== id));
      if (type === "income") {
        setIncomes((prev) => prev.filter((i) => i.id !== id));
      }
    } catch (error) {
      console.error("Delete error:", error);
      throw error;
    }
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        incomes,
        loading,
        addExpense,
        addIncome,
        updateExpense,
        deleteExpense,
        refetch: fetchData,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};
