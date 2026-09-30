import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const ExpenseContext = createContext();

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error("useExpenses must be used within ExpenseProvider");
  }
  return context;
};

// ---------- Helpers ----------
// Backend might return: [...], { data: [...] }, { expenses: [...] }, { incomes: [...] }, { result: [...] }
const toArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.expenses)) return payload.expenses;
  if (Array.isArray(payload?.incomes)) return payload.incomes;
  if (Array.isArray(payload?.result)) return payload.result;
  return [];
};

// For single-item responses (add/update)
const unwrapItem = (payload) => payload?.data ?? payload;

// Normalize MongoDB _id → id so all your .find/.filter work
const withId = (item) => ({ ...item, id: item.id ?? item._id });

// ---------- Provider ----------
export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
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

      // Debug — remove later
      // console.log("expRes.data:", expRes.data);
      // console.log("incRes.data:", incRes.data);

      const expensesArr = toArray(expRes.data).map(withId);
      const incomesArr = toArray(incRes.data).map(withId);

      setIncomes(incomesArr);

      // Combine: expenses + incomes into one array
      const allData = [
        ...expensesArr.map((e) => ({ ...e, type: "expense" })),
        ...incomesArr.map((i) => ({
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

  useEffect(() => {
    fetchData();
  }, []);

  const addExpense = async (data) => {
    try {
      const response = await api.post("/expenses", data);
      const newExpense = {
        ...withId(unwrapItem(response.data)),
        type: "expense",
      };
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

      const raw = withId(unwrapItem(response.data));
      const newIncome = {
        ...raw,
        type: "income",
        title: raw.source,
      };

      setExpenses((prev) => [newIncome, ...prev]);
      setIncomes((prev) => [raw, ...prev]);
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
      const raw = withId(unwrapItem(response.data));

      setExpenses((prev) =>
        prev.map((e) =>
          e.id === id
            ? {
                ...raw,
                type,
                title: type === "income" ? raw.source : raw.title,
              }
            : e,
        ),
      );

      if (type === "income") {
        setIncomes((prev) => prev.map((i) => (i.id === id ? raw : i)));
      }
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
