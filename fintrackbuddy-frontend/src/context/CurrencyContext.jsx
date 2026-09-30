import { createContext, useContext, useState, useEffect } from "react";

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return context;
};

const CURRENCIES = {
  USD: { symbol: "$", code: "USD", name: "US Dollar" },
  EUR: { symbol: "€", code: "EUR", name: "Euro" },
  GBP: { symbol: "£", code: "GBP", name: "British Pound" },
  INR: { symbol: "₹", code: "INR", name: "Indian Rupee" },
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem("currency") || "USD";
  });

  useEffect(() => {
    localStorage.setItem("currency", currency);
  }, [currency]);

  const symbol = CURRENCIES[currency]?.symbol || "$";
  const currencyInfo = CURRENCIES[currency] || CURRENCIES.USD;

  // ✅ Format amount with currency symbol
  const formatAmount = (amount) => {
    const num = Number(amount) || 0;
    return `${symbol}${num.toLocaleString()}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        symbol,
        currencyInfo,
        currencies: CURRENCIES,
        formatAmount,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};
