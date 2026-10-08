import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useContext } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import { CategoryProvider } from "./context/CategoryContext";
import { AccountProvider } from "./context/AccountContext";
import { ExpenseProvider } from "./context/ExpenseContext";
import { NotificationProvider } from "./context/NotificationContext"; // ✅ NEW
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import AddIncome from "./pages/AddIncome";
import Transactions from "./pages/Transactions";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Categories from "./pages/Categories";
import Accounts from "./pages/Accounts";

function ProtectedRoute({ children }) {
  const { token } = useContext(AuthContext);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <Expenses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-income"
          element={
            <ProtectedRoute>
              <AddIncome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <Categories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accounts"
          element={
            <ProtectedRoute>
              <Accounts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CurrencyProvider>
          <NotificationProvider>
            {" "}
            {/* ✅ NEW */}
            <CategoryProvider>
              <AccountProvider>
                <ExpenseProvider>
                  <AppRoutes />
                </ExpenseProvider>
              </AccountProvider>
            </CategoryProvider>
          </NotificationProvider>{" "}
          {/* ✅ NEW */}
        </CurrencyProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
