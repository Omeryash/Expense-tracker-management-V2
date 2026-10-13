import { useState } from "react";
import { Layout } from "../components/layout/Layout";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  Search,
  Download,
  Eye,
  Trash2,
  ArrowUpDown,
  Calendar as CalendarIcon,
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useExpenses } from "../context/ExpenseContext";

export default function Transactions() {
  const { expenses, deleteExpense } = useExpenses();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ✅ NEW: View Modal state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // ✅ NEW: Delete Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);

  // ✅ NEW: Message Modal state
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageData, setMessageData] = useState({
    type: "success",
    title: "",
    message: "",
  });

  const showMessage = (type, title, message) => {
    setMessageData({ type, title, message });
    setShowMessageModal(true);
  };

  const getTotalIncome = () =>
    expenses
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

  const getTotalExpense = () =>
    expenses
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

  const getBalance = () => getTotalIncome() - getTotalExpense();

  const filteredTransactions = expenses
    .filter((transaction) => {
      const matchesSearch =
        transaction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType =
        filterType === "all" || transaction.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === "date") return new Date(b.date) - new Date(a.date);
      if (sortBy === "amount") return b.amount - a.amount;
      return 0;
    });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    endIndex,
  );

  const handleFilterChange = (type) => {
    setFilterType(type);
    setCurrentPage(1);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // ✅ NEW: View Details Click
  const handleViewClick = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  // ✅ NEW: Delete Click (open modal)
  const handleDeleteClick = (transaction) => {
    setTransactionToDelete(transaction);
    setShowDeleteModal(true);
  };

  // ✅ NEW: Confirm Delete
  const handleConfirmDelete = async () => {
    try {
      await deleteExpense(transactionToDelete.id);

      // Adjust page if last item on last page deleted
      if (paginatedTransactions.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }

      setShowDeleteModal(false);
      setTransactionToDelete(null);

      showMessage("success", "Deleted!", "Transaction removed successfully.");
    } catch (error) {
      setShowDeleteModal(false);
      setTransactionToDelete(null);
      showMessage("error", "Failed", "Could not delete transaction.");
    }
  };

  // ✅ CSV Export Function
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      alert("No transactions to export");
      return;
    }

    const headers = ["Date", "Title", "Category", "Type", "Amount", "Status"];

    const rows = filteredTransactions.map((t) => [
      t.date,
      `"${t.title}"`,
      t.category,
      t.type,
      t.amount,
      t.status,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `transactions_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const stats = [
    {
      label: "Total Income",
      value: `$${getTotalIncome().toLocaleString()}`,
      change: "+12%",
      color: "text-green-600",
    },
    {
      label: "Total Expense",
      value: `$${getTotalExpense().toLocaleString()}`,
      change: "+8%",
      color: "text-red-600",
    },
    {
      label: "Balance",
      value: `$${getBalance().toLocaleString()}`,
      change: "+15%",
      color: "text-blue-600",
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Transaction History</h1>
            <p className="text-muted-foreground">
              View and manage all your financial activities
            </p>
          </div>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleExportCSV}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="text-center">
                <p className="text-sm text-muted-foreground mb-1">
                  {stat.label}
                </p>
                <p className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {stat.change} from last month
                </p>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title or category..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleFilterChange("all")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                    filterType === "all"
                      ? "gradient-primary text-white"
                      : "bg-muted hover:bg-accent"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => handleFilterChange("income")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                    filterType === "income"
                      ? "gradient-success text-white"
                      : "bg-muted hover:bg-accent"
                  }`}
                >
                  Income
                </button>
                <button
                  onClick={() => handleFilterChange("expense")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                    filterType === "expense"
                      ? "gradient-danger text-white"
                      : "bg-muted hover:bg-accent"
                  }`}
                >
                  Expense
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2 border-t border-border">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <button
                onClick={() => setSortBy("date")}
                className={`flex items-center gap-1 text-sm px-3 py-1 rounded-lg transition ${
                  sortBy === "date"
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-accent"
                }`}
              >
                <CalendarIcon className="w-3 h-3" />
                Date
                <ArrowUpDown className="w-3 h-3" />
              </button>
              <button
                onClick={() => setSortBy("amount")}
                className={`flex items-center gap-1 text-sm px-3 py-1 rounded-lg transition ${
                  sortBy === "amount"
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-accent"
                }`}
              >
                Amount
                <ArrowUpDown className="w-3 h-3" />
              </button>
            </div>
          </div>
        </Card>

        <div className="space-y-3">
          {paginatedTransactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card className="group hover:shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                        transaction.type === "income"
                          ? "bg-green-500/10"
                          : "bg-red-500/10"
                      }`}
                    >
                      {transaction.icon}
                    </div>
                    <div>
                      <p className="font-semibold">{transaction.title}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{transaction.category}</span>
                        <span>•</span>
                        <span>{transaction.date}</span>
                        <span>•</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            transaction.status === "completed"
                              ? "bg-green-500/10 text-green-600"
                              : "bg-yellow-500/10 text-yellow-600"
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p
                      className={`text-xl font-bold ${
                        transaction.type === "income"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"} $
                      {transaction.amount}
                    </p>
                    <div className="flex gap-2 md:opacity-0 md:group-hover:opacity-100 transition">
                      {/* ✅ Eye icon → View details */}
                      <button
                        onClick={() => handleViewClick(transaction)}
                        className="p-2 rounded-lg hover:bg-accent transition"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {/* ✅ Trash icon → Custom modal */}
                      <button
                        onClick={() => handleDeleteClick(transaction)}
                        className="p-2 rounded-lg hover:bg-destructive/10 transition text-destructive"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredTransactions.length === 0 && (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold mb-2">
              No Transactions Found
            </h3>
            <p className="text-muted-foreground">
              {searchTerm
                ? "Try adjusting your search or filters"
                : "Start by adding your first transaction"}
            </p>
          </Card>
        )}

        {filteredTransactions.length > 0 && totalPages > 1 && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">
                {startIndex + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-foreground">
                {Math.min(endIndex, filteredTransactions.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">
                {filteredTransactions.length}
              </span>{" "}
              transactions
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg bg-muted hover:bg-accent transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg transition ${
                      currentPage === page
                        ? "gradient-primary text-white shadow-lg"
                        : "bg-muted hover:bg-accent"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg bg-muted hover:bg-accent transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ✅ View Details Modal */}
      <AnimatePresence>
        {showDetailModal && selectedTransaction && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetailModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", duration: 0.4 }}
                className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
              >
                {/* Header */}
                <div
                  className={`p-6 ${
                    selectedTransaction.type === "income"
                      ? "gradient-success"
                      : "gradient-danger"
                  } text-white relative`}
                >
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/20 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-3xl">
                      {selectedTransaction.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">
                        {selectedTransaction.title}
                      </h3>
                      <p className="text-white/80 text-sm">
                        {selectedTransaction.category}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-xl">
                    <span className="text-sm text-muted-foreground">
                      Amount
                    </span>
                    <span
                      className={`text-xl font-bold ${
                        selectedTransaction.type === "income"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {selectedTransaction.type === "income" ? "+" : "-"} ₹
                      {selectedTransaction.amount.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-xl">
                    <span className="text-sm text-muted-foreground">Type</span>
                    <span className="font-semibold capitalize">
                      {selectedTransaction.type}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-xl">
                    <span className="text-sm text-muted-foreground">
                      Category
                    </span>
                    <span className="font-semibold">
                      {selectedTransaction.category}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-xl">
                    <span className="text-sm text-muted-foreground">Date</span>
                    <span className="font-semibold">
                      {new Date(selectedTransaction.date).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-xl">
                    <span className="text-sm text-muted-foreground">
                      Status
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        selectedTransaction.status === "completed"
                          ? "bg-green-500/10 text-green-600"
                          : "bg-yellow-500/10 text-yellow-600"
                      }`}
                    >
                      {selectedTransaction.status}
                    </span>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => setShowDetailModal(false)}
                  >
                    Close
                  </Button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* ✅ Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && transactionToDelete && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", duration: 0.4 }}
                className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
              >
                <div className="p-6 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.15, stiffness: 200 }}
                    className="inline-flex items-center justify-center w-20 h-20 bg-red-500/10 rounded-full mb-5"
                  >
                    <AlertTriangle className="w-10 h-10 text-red-500" />
                  </motion.div>

                  <h3 className="text-2xl font-bold mb-2">
                    Delete Transaction?
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    Are you sure you want to delete{" "}
                    <strong className="text-foreground">
                      "{transactionToDelete.title}"
                    </strong>
                    ? This action cannot be undone.
                  </p>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowDeleteModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      className="flex-1"
                      onClick={handleConfirmDelete}
                    >
                      Yes, Delete
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* ✅ Message Modal */}
      <AnimatePresence>
        {showMessageModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMessageModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", duration: 0.4 }}
                className="relative w-full max-w-sm"
              >
                <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                  <div className="p-8 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        delay: 0.15,
                        stiffness: 200,
                      }}
                      className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-5 ${
                        messageData.type === "success"
                          ? "bg-green-500/10"
                          : "bg-red-500/10"
                      }`}
                    >
                      {messageData.type === "success" ? (
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                      ) : (
                        <XCircle className="w-10 h-10 text-red-500" />
                      )}
                    </motion.div>

                    <h3 className="text-2xl font-bold mb-2">
                      {messageData.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-6">
                      {messageData.message}
                    </p>

                    <Button
                      className="w-full"
                      onClick={() => setShowMessageModal(false)}
                    >
                      OK
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </Layout>
  );
}
