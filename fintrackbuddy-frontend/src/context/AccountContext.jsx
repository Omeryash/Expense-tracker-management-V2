import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AccountContext = createContext();

export const useAccounts = () => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error("useAccounts must be used within AccountProvider");
  }
  return context;
};

// ---------- Helpers ----------
const toArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.accounts)) return payload.accounts;
  if (Array.isArray(payload?.result)) return payload.result;
  return [];
};

const unwrapItem = (payload) => payload?.data ?? payload;

const withId = (item) => ({ ...item, id: item.id ?? item._id });

// ---------- Provider ----------
export const AccountProvider = ({ children }) => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAccounts = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setAccounts([]);
      return;
    }

    setLoading(true);
    try {
      const response = await api.get("/accounts");

      // Debug — remove after confirming
      // console.log("accounts response:", response.data);

      const list = toArray(response.data).map(withId);
      setAccounts(list);
    } catch (error) {
      console.error("Fetch accounts error:", error);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const addAccount = async (data) => {
    try {
      const response = await api.post("/accounts", data);
      const newAccount = withId(unwrapItem(response.data));

      // Agar isDefault true hai to purane default ko false karo
      setAccounts((prev) => {
        const list = Array.isArray(prev) ? prev : [];
        const cleared = newAccount.isDefault
          ? list.map((a) => ({ ...a, isDefault: false }))
          : list;
        return [...cleared, newAccount];
      });

      return newAccount;
    } catch (error) {
      console.error("Add account error:", error);
      throw error;
    }
  };

  const updateAccount = async (id, data) => {
    try {
      const response = await api.put(`/accounts/${id}`, data);
      const updated = withId(unwrapItem(response.data));

      setAccounts((prev) => {
        const list = Array.isArray(prev) ? prev : [];
        if (data.isDefault) {
          return list.map((a) => ({
            ...(a.id === id ? updated : a),
            isDefault: a.id === id,
          }));
        }
        return list.map((a) => (a.id === id ? updated : a));
      });

      return updated;
    } catch (error) {
      console.error("Update account error:", error);
      throw error;
    }
  };

  const deleteAccount = async (id) => {
    try {
      await api.delete(`/accounts/${id}`);
      setAccounts((prev) =>
        (Array.isArray(prev) ? prev : []).filter((a) => a.id !== id),
      );
    } catch (error) {
      console.error("Delete account error:", error);
      throw error;
    }
  };

  // ---------- Derived (safe) ----------
  const safeAccounts = Array.isArray(accounts) ? accounts : [];
  const defaultAccount =
    safeAccounts.find((a) => a.isDefault) || safeAccounts[0];
  const totalBalance = safeAccounts.reduce(
    (sum, a) => sum + (Number(a.balance) || 0),
    0,
  );

  return (
    <AccountContext.Provider
      value={{
        accounts: safeAccounts,
        defaultAccount,
        totalBalance,
        loading,
        addAccount,
        updateAccount,
        deleteAccount,
        refetch: fetchAccounts,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};
