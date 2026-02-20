import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { PlusCircle, X, Trash2, Download } from "lucide-react";
import { auth } from "../firebaseConfig";
import { Link } from "react-router-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const InventoryManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [items, setItems] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [roomId, setRoomId] = useState("");
  const [inventoryId, setInventoryId] = useState("");
  const [action, setAction] = useState("restock");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [category, setCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [newItem, setNewItem] = useState({
    pname: "",
    category: "",
    stock: "",
    description: "",
    roomIds: [],
  });
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [reportFilters, setReportFilters] = useState({
    roomId: "",
    timeRange: "month",
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        user.getIdToken().then((token) => {
          fetchRooms(token);
          fetchUpdates(token);
        }).catch((error) => {
          console.error("Error getting token:", error);
          setError("Authentication failed. Please try logging in again.");
          toast.error("Authentication failed");
        });
      } else {
        setError("Please log in to manage inventory");
        toast.error("Please log in to manage inventory");
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (roomId) {
      auth.currentUser.getIdToken().then((token) => {
        fetchInventory(token);
        fetchUpdates(token);
      }).catch((error) => {
        console.error("Error getting token:", error);
        setError("Authentication failed. Please try logging in again.");
        toast.error("Authentication failed");
      });
    }
  }, [roomId]);

  const fetchRooms = async (token) => {
    try {
      const response = await axios.get("http://localhost:4000/api/rooms/staff", {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (response.data.success) {
        setRooms(response.data.data);
        if (response.data.data.length > 0) {
          setRoomId(response.data.data[0].roomNumber);
        } else {
          setError("No rooms available. Please contact an administrator.");
          toast.warn("No rooms available");
        }
      } else {
        setError(response.data.message || "Failed to fetch rooms");
        toast.error(response.data.message || "Failed to fetch rooms");
      }
    } catch (error) {
      const message = error.response?.data?.message || "Error fetching rooms. Please check your network or contact support.";
      setError(message);
      toast.error(message);
    }
  };

  const fetchInventory = async (token) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`http://localhost:4000/api/inventory/room/${roomId}/inventory`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (response.data.success) {
        setItems(response.data.items);
        if (response.data.items.length > 0) {
          setInventoryId(response.data.items[0]._id);
        } else {
          setError(`No inventory items found for Room ${roomId}`);
          toast.warn(`No inventory items found for Room ${roomId}`);
        }
      } else {
        setError(response.data.message || "Failed to fetch inventory");
        toast.error(response.data.message || "Failed to fetch inventory");
      }
    } catch (error) {
      const message = error.response?.data?.message || "Error fetching inventory. Please check your network or contact support.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUpdates = async (token) => {
    try {
      const query = roomId ? `?roomId=${roomId}` : "";
      const response = await axios.get(`http://localhost:4000/api/inventory/history${query}`, {
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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomId || !inventoryId || !category) {
      setError("Please select a room, category, and item before submitting.");
      toast.error("Please select a room, category, and item");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const payload = { inventoryId, action };
      if (action === "restock") {
        payload.quantity = parseInt(quantity);
      } else {
        payload.replacementReason = reason;
      }
      const response = await axios.post(
        `http://localhost:4000/api/inventory/room/${roomId}/inventory`,
        payload,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      if (response.data.success) {
        toast.success("Inventory update submitted successfully");
        setQuantity(1);
        setReason("");
        setInventoryId("");
        setCategory("");
        fetchUpdates(token);
        fetchInventory(token);
      } else {
        setError(response.data.message || "Failed to submit update");
        toast.error(response.data.message || "Failed to submit update");
      }
    } catch (error) {
      const status = error.response?.status;
      let message = error.response?.data?.message || "Error submitting update. Please check your network or contact support.";
      if (status === 404) {
        message = "Inventory update route not found. Please ensure the server is running and routes are correctly configured.";
      } else if (status === 401) {
        message = "Authentication failed. Please log out and log in again.";
      }
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItemSubmit = async (e) => {
    e.preventDefault();
    const stockValue = parseInt(newItem.stock);
    if (!newItem.pname || !newItem.category || isNaN(stockValue) || stockValue < 0) {
      setError("Please provide a valid item name, category, and non-negative stock.");
      toast.error("Please provide a valid item name, category, and stock");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await axios.post(
        "http://localhost:4000/api/inventory/additem",
        { ...newItem, stock: stockValue },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      if (response.data.success) {
        toast.success("Inventory item added successfully");
        setNewItem({ pname: "", category: "", stock: "", description: "", roomIds: [] });
        setShowAddItemForm(false);
        if (roomId) {
          fetchInventory(token);
        }
      } else {
        setError(response.data.message || "Failed to add item");
        toast.error(response.data.message || "Failed to add item");
      }
    } catch (error) {
      const status = error.response?.status;
      let message = error.response?.data?.message || "Error adding item. Please check your network or contact support.";
      if (status === 401) {
        message = "Authentication failed. Please log out and log in again.";
      }
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item? This will remove it from all assigned rooms.")) return;
    setIsLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      console.log("Deleting item with ID:", id); // Debug log
      const response = await axios.delete(`http://localhost:4000/api/inventory/${id}`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      console.log("Delete response:", response.data); // Debug log
      if (response.data.success) {
        toast.success("Inventory item deleted successfully");
        setItems(items.filter((item) => item._id !== id));
      } else {
        setError(response.data.message || "Failed to delete item");
        toast.error(response.data.message || "Failed to delete item");
      }
    } catch (error) {
      console.error("Delete error:", error); // Debug log
      const status = error.response?.status;
      let message = error.response?.data?.message || "Error deleting item. Please check your network or contact support.";
      if (status === 404) {
        message = "Delete route not found or item not found. Please ensure the server is running and the item ID is correct.";
      } else if (status === 401) {
        message = "Authentication failed. Please log out and log in again.";
      }
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setIsLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const endDate = new Date();
      let startDate;
      switch (reportFilters.timeRange) {
        case "week":
          startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "year":
          startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      const query = new URLSearchParams({
        roomId: reportFilters.roomId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      }).toString();
      const response = await axios.get(`http://localhost:4000/api/inventory/report?${query}`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (response.data.success) {
        const report = response.data.report;
        const doc = new jsPDF();
        doc.text("Inventory Report", 14, 20);
        doc.text(`Time Range: Last ${reportFilters.timeRange}`, 14, 30);
        doc.text(`Room: ${reportFilters.roomId || "All Rooms"}`, 14, 40);
        autoTable(doc, {
          startY: 50,
          head: [["Room ID", "Item Name", "Category", "Action", "Quantity", "Reason", "Status", "Staff Email", "Created At"]],
          body: report.map((row) => [
            row.roomId,
            row.itemName,
            row.category,
            row.action,
            row.quantity,
            row.replacementReason,
            row.status,
            row.staffEmail,
            new Date(row.createdAt).toLocaleString(),
          ]),
        });
        doc.save(`inventory_report_${reportFilters.timeRange}.pdf`);
        toast.success("Report generated successfully");
      } else {
        setError(response.data.message || "Failed to generate report");
        toast.error(response.data.message || "Failed to generate report");
      }
    } catch (error) {
      console.error("Report error:", error);
      const message = error.response?.data?.message || "Error generating report. Please check your network or ensure the report route exists.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadInventory = () => {
    const doc = new jsPDF();
    doc.text(`Inventory for Room ${roomId}`, 14, 20);
    autoTable(doc, {
      startY: 30,
      head: [["Item Name", "Category", "Stock", "Description"]],
      body: items.map((item) => [item.pname, item.category, item.stock, item.description || ""]),
    });
    doc.save(`inventory_room_${roomId}.pdf`);
    toast.success("Inventory downloaded successfully");
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
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Inventory Management</h2>
          <p className="mt-2 text-lg text-gray-600">Update and track room inventory</p>
          <Link to="/history" className="text-blue-500 hover:underline mt-2 inline-block">
            View All Inventory History
          </Link>
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
          className="mb-6"
        >
          <button
            onClick={() => setShowAddItemForm(!showAddItemForm)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
          >
            <PlusCircle size={18} />
            {showAddItemForm ? "Hide Add Item Form" : "Add New Inventory Item"}
          </button>
        </motion.div>

        {showAddItemForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Add New Inventory Item</h3>
            <form onSubmit={handleAddItemSubmit} className="space-y-5">
              <div>
                <label htmlFor="pname" className="block text-sm font-medium text-gray-700">
                  Item Name
                </label>
                <input
                  id="pname"
                  type="text"
                  value={newItem.pname}
                  onChange={(e) => setNewItem({ ...newItem, pname: e.target.value })}
                  className="mt-1 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter item name"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="newCategory" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  id="newCategory"
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="mt-1 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                >
                  <option value="">Select Category</option>
                  <option value="linens">Linens</option>
                  <option value="toiletries">Toiletries</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="food_beverage">Food & Beverage</option>
                  <option value="misc">Miscellaneous</option>
                  <option value="Electronics">Electronics</option>
                  <option value="others">Others</option>
                </select>
              </div>
              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                  Stock
                </label>
                <input
                  id="stock"
                  type="number"
                  value={newItem.stock}
                  onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })}
                  min="0"
                  className="mt-1 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="mt-1 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter item description"
                  rows="4"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Assign to Rooms</label>
                <div className="mt-2 space-y-2">
                  {rooms.map((room) => (
                    <div key={room._id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`room-${room.roomNumber}`}
                        checked={newItem.roomIds.includes(room.roomNumber)}
                        onChange={(e) => {
                          const updatedRoomIds = e.target.checked
                            ? [...newItem.roomIds, room.roomNumber]
                            : newItem.roomIds.filter((id) => id !== room.roomNumber);
                          setNewItem({ ...newItem, roomIds: updatedRoomIds });
                        }}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        disabled={isLoading}
                      />
                      <label htmlFor={`room-${room.roomNumber}`} className="ml-2 text-sm text-gray-700">
                        Room {room.roomNumber}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isLoading || !newItem.pname || !newItem.category || newItem.stock === ""}
                className={`w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors ${
                  isLoading || !newItem.pname || !newItem.category || newItem.stock === "" ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    Adding...
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2" size={18} />
                    Add Item
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Update Inventory</h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="roomId" className="block text-sm font-medium text-gray-700">
                Room
              </label>
              <select
                id="roomId"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="mt-1 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Select room"
                disabled={isLoading}
              >
                <option value="">Select Room</option>
                {rooms.map((room) => (
                  <option key={room._id} value={room.roomNumber}>
                    Room {room.roomNumber}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Select category"
                disabled={isLoading || !roomId}
              >
                <option value="">Select Category</option>
                <option value="linens">Linens</option>
                <option value="toiletries">Toiletries</option>
                <option value="cleaning">Cleaning</option>
                <option value="food_beverage">Food & Beverage</option>
                <option value="misc">Miscellaneous</option>
                <option value="Electronics">Electronics</option>
                <option value="others">Others</option>
              </select>
            </div>
            <div>
              <label htmlFor="inventoryId" className="block text-sm font-medium text-gray-700">
                Item
              </label>
              <select
                id="inventoryId"
                value={inventoryId}
                onChange={(e) => setInventoryId(e.target.value)}
                className="mt-1 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading || !items.length}
                aria-label="Select item"
              >
                <option value="">Select Item</option>
                {items.filter((item) => !category || item.category === category).map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.pname} (Stock: {item.stock})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="action" className="block text-sm font-medium text-gray-700">
                Action
              </label>
              <select
                id="action"
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="mt-1 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Select action"
                disabled={isLoading}
              >
                <option value="restock">Restock</option>
                <option value="replacement">Replacement</option>
              </select>
            </div>
            {action === "restock" ? (
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  className="mt-1 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-label="Enter quantity"
                  disabled={isLoading}
                />
              </div>
            ) : (
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                  Reason
                </label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-1 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter replacement reason"
                  rows="4"
                  aria-label="Enter replacement reason"
                  disabled={isLoading}
                />
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isLoading || !roomId || !category || !inventoryId}
              className={`w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                isLoading || !roomId || !category || !inventoryId ? "opacity-70 cursor-not-allowed" : ""
              }`}
              aria-label="Submit inventory update"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                  Submitting...
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2" size={18} />
                  Submit Update
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Current Inventory</h3>
            {items.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownloadInventory}
                className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <Download size={18} />
                Download Inventory
              </motion.button>
            )}
          </div>
          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center py-6"
            >
              <p className="text-lg text-gray-600">No inventory items available.</p>
              <p className="mt-2 text-gray-500">Add a new item or select a different room.</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex items-center justify-between border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="text-gray-900 font-medium">{item.pname}</p>
                    <p className="text-gray-600">Category: {item.category}</p>
                    <p className="text-gray-600">Stock: {item.stock}</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteItem(item._id)}
                    className="text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                    aria-label={`Delete ${item.pname}`}
                  >
                    <Trash2 size={20} />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Generate Report</h3>
          <form className="space-y-5">
            <div>
              <label htmlFor="reportRoomId" className="block text-sm font-medium text-gray-700">
                Room
              </label>
              <select
                id="reportRoomId"
                value={reportFilters.roomId}
                onChange={(e) => setReportFilters({ ...reportFilters, roomId: e.target.value })}
                className="mt-1 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              >
                <option value="">All Rooms</option>
                {rooms.map((room) => (
                  <option key={room._id} value={room.roomNumber}>
                    Room {room.roomNumber}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="timeRange" className="block text-sm font-medium text-gray-700">
                Time Range
              </label>
              <select
                id="timeRange"
                value={reportFilters.timeRange}
                onChange={(e) => setReportFilters({ ...reportFilters, timeRange: e.target.value })}
                className="mt-1 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="year">Last Year</option>
              </select>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={handleGenerateReport}
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-green-400 to-green-600 text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-lightgreen-500 focus:ring-offset-2 transition-colors ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2" size={18} />
                  Generate Report
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Room Inventory History</h3>
          {roomId ? (
            Object.keys(groupedUpdates).length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-center py-6"
              >
                <p className="text-lg text-gray-600">No updates submitted for Room {roomId}.</p>
                <p className="mt-2 text-gray-500">Start by submitting an inventory update above.</p>
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
                              <strong>Action:</strong> {update.action}
                            </p>
                            <p className="text-gray-600">
                              <strong>Room:</strong> {update.roomId}
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
            )
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center py-6"
            >
              <p className="text-lg text-gray-600">Please select a room to view its inventory history.</p>
            </motion.div>
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

export default InventoryManagement;
