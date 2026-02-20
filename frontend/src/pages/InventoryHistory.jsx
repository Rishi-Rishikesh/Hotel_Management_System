// InventoryManagement.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Download, X } from "lucide-react";
import { auth } from "../firebaseConfig";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const InventoryHistory = () => {
  const [updates, setUpdates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        user.getIdToken().then((token) => {
          fetchUpdates(token);
        }).catch((error) => {
          console.error("Error getting token:", error);
          setError("Authentication failed. Please try logging in again.");
          toast.error("Authentication failed");
        });
      } else {
        setError("Please log in to view inventory history");
        toast.error("Please log in to view inventory history");
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUpdates = async (token) => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:4000/api/inventory/history", {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (response.data.success) {
        setUpdates(response.data.updates);
      } else {
        setError(response.data.message || "Failed to fetch updates");
        toast.error(response.data.message || "Failed to fetch updates");
      }
    } catch (error) {
      const message = error.response?.data?.message || "Error fetching updates. Please check your network or contact support.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadHistory = () => {
    try {
      const doc = new jsPDF();
      doc.text("Inventory History - All Rooms", 14, 20);
      Object.entries(groupedUpdates).forEach(([category, updates], index) => {
        autoTable(doc, {
          startY: index === 0 ? 30 : doc.lastAutoTable.finalY + 10,
          head: [[`Category: ${category.toUpperCase()}`]],
          body: [],
          theme: "plain",
        });
        autoTable(doc, {
          startY: doc.lastAutoTable.finalY,
          head: [["Room ID", "Item Name", "Action", "Quantity", "Reason", "Status", "Staff Email", "Created At"]],
          body: updates.map((update) => [
            update.roomId,
            update.inventory.pname,
            update.action,
            update.quantity,
            update.replacementReason || "-",
            update.status,
            update.staffEmail,
            new Date(update.createdAt).toLocaleString(),
          ]),
        });
      });
      doc.save("inventory_history_all.pdf");
      toast.success("History downloaded successfully");
    } catch (error) {
      console.error("Error generating history PDF:", error);
      toast.error("Failed to generate history PDF");
    }
  };

  const dismissError = () => {
    setError("");
  };

  const groupedUpdates = updates.reduce((acc, update) => {
    const category = update.inventory.category || "misc";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(update);
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-100"
    >
      <div className="container mx-auto max-w-4xl p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Inventory History</h2>
          <p className="mt-2 text-lg text-gray-600">View and download all inventory updates</p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6 flex items-center justify-between rounded-lg bg-red-50 p-4 text-red-700 border border-red-200"
            role="alert"
          >
            <span>{error}</span>
            <button
              onClick={dismissError}
              className="text-red-700 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
              aria-label="Dismiss error"
            >
              <X size={20} />
            </button>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">All Inventory History</h3>
            {updates.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownloadHistory}
                className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <Download size={18} />
                Download History
              </motion.button>
            )}
          </div>
          {updates.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center py-6"
            >
              <p className="text-lg text-gray-600">No inventory updates available.</p>
              <p className="mt-2 text-gray-500">Start by submitting an inventory update.</p>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedUpdates).map(([category, updates]) => (
                <div key={category}>
                  <h4 className="text-lg font-medium text-gray-800 capitalize mb-4">{category}</h4>
                  {updates.length === 0 ? (
                    <p className="text-gray-600">No updates for this category.</p>
                  ) : (
                    <div className="space-y-4">
                      {updates.map((update) => (
                        <motion.div
                          key={update._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4 }}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <p className="text-gray-900 font-medium">
                            <strong>Item:</strong> {update.inventory.pname}
                          </p>
                          <p className="text-gray-600">
                            <strong>Room:</strong> {update.roomId}
                          </p>
                          <p className="text-gray-600">
                            <strong>Action:</strong> {update.action}
                          </p>
                          {update.quantity > 0 && (
                            <p className="text-gray-600">
                              <strong>Quantity:</strong> {update.quantity}
                            </p>
                          )}
                          {update.replacementReason && (
                            <p className="text-gray-600">
                              <strong>Reason:</strong> {update.replacementReason}
                            </p>
                          )}
                          <p className="text-gray-600">
                            <strong>Status:</strong> {update.status}
                          </p>
                          <p className="text-gray-600">
                            <strong>Staff:</strong> {update.staffEmail}
                          </p>
                          <p className="text-sm text-gray-500">
                            Created: {new Date(update.createdAt).toLocaleString()}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <svg
              className="animate-spin h-10 w-10 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default InventoryHistory;
