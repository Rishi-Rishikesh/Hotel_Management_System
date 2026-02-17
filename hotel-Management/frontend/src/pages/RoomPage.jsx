import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiPackage, FiRefreshCw, FiAlertTriangle, FiX } from "react-icons/fi";

const RoomPage = () => {
  const navigate = useNavigate();
  const [inventoryItems, setInventoryItems] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("01");
  const [restockQuantities, setRestockQuantities] = useState({});
  const [replacementReason, setReplacementReason] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const rooms = ["01", "03", "04", "07", "09"];

  // Fetch inventory items on mount
  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:4000/api/inventory/getproducts", {
          withCredentials: true,
        });
        if (response.data.success) {
          setInventoryItems(response.data.products);
          const quantities = {};
          response.data.products.forEach((item) => {
            quantities[item.inventoryId] = 1;
          });
          setRestockQuantities(quantities);
        } else {
          throw new Error(response.data.message || "Failed to fetch inventory");
        }
      } catch (error) {
        const errorMsg = error.response?.status === 404
          ? "Inventory endpoint not found. Please check backend routes."
          : error.response?.data?.message || "Error fetching inventory";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  // Handle room selection
  const handleRoomChange = (e) => {
    setSelectedRoom(e.target.value);
  };

  // Handle restock quantity change
  const handleQuantityChange = (inventoryId, value) => {
    setRestockQuantities((prev) => ({
      ...prev,
      [inventoryId]: Math.max(1, Number(value) || 1),
    }));
  };

  // Handle restock request
  const handleRestock = async (inventoryId, itemName) => {
    const quantity = restockQuantities[inventoryId];
    if (quantity < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:4000/api/inventory/room/${selectedRoom}/inventory`,
        {
          inventoryId,
          action: "restock",
          quantity,
        },
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success(`Restock request for ${itemName} submitted!`);
        const updatedInventory = await axios.get(
          "http://localhost:4000/api/inventory/getproducts",
          { withCredentials: true }
        );
        setInventoryItems(updatedInventory.data.products);
      } else {
        throw new Error(response.data.message || "Restock failed");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Error submitting restock");
      toast.error(error.response?.data?.message || "Error submitting restock");
    } finally {
      setLoading(false);
    }
  };

  // Handle replacement request
  const handleReplacement = async () => {
    if (!replacementReason.trim()) {
      toast.error("Please provide a replacement reason");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:4000/api/inventory/room/${selectedRoom}/inventory`,
        {
          inventoryId: selectedItem.inventoryId,
          action: "replacement",
          quantity: 0,
          replacementReason,
        },
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success(`Replacement request for ${selectedItem.pname} submitted!`);
        setModalOpen(false);
        setReplacementReason("");
        setSelectedItem(null);
      } else {
        throw new Error(response.data.message || "Replacement failed");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Error submitting replacement");
      toast.error(error.response?.data?.message || "Error submitting replacement");
    } finally {
      setLoading(false);
    }
  };

  // Open replacement modal
  const openReplacementModal = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  // Close replacement modal
  const closeModal = () => {
    setModalOpen(false);
    setReplacementReason("");
    setSelectedItem(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-repeat p-8 pb-12 overflow-y-auto font-sans"
      style={{
        // backgroundImage: `url(${require("../assets/roomi.jpg")})`,
        backgroundSize: "300px 300px",
      }}
    >
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex justify-between items-center mb-10"
        >
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-white">
            Room Inventory Management
          </h1>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 4px 15px rgba(79, 70, 229, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/guestdashboard")}
            className="bg-gradient-to-r from-indigo-600 to-teal-500 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Back to Dashboard
          </motion.button>
        </motion.div>

        {/* Main Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/30 backdrop-blur-lg border border-white/40 rounded-2xl p-8 shadow-xl"
        >
          <h2 className="text-3xl font-semibold text-gray-800 mb-8">
            Manage Inventory for <span className="text-indigo-500">Room {selectedRoom}</span>
          </h2>

          {/* Room Selector */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8"
          >
            <label className="block mb-2 text-sm font-medium text-indigo-600">
              Select Room
            </label>
            <select
              value={selectedRoom}
              onChange={handleRoomChange}
              className="w-full max-w-xs p-4 border border-indigo-100 rounded-lg bg-indigo-50/50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
            >
              {rooms.map((room) => (
                <option key={room} value={room}>
                  Room {room}
                </option>
              ))}
            </select>
          </motion.div>

          {/* Inventory Cards */}
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center items-center py-10"
            >
              <svg
                className="animate-spin h-10 w-10 text-indigo-500"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                ></path>
              </svg>
            </motion.div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 rounded-lg bg-red-100 border-l-4 border-red-500 text-red-700"
            >
              <div className="flex items-center">
                <FiAlertTriangle className="w-5 h-5 mr-2" />
                <span>{error}. Please add items via <a href="/addproduct" className="underline">Add Product</a>.</span>
              </div>
            </motion.div>
          ) : inventoryItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {inventoryItems.map((item, index) => (
                <motion.div
                  key={item.inventoryId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  whileHover={{
                    scale: 1.03,
                    boxShadow:
                      "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    borderColor: "#818cf8",
                  }}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent"
                >
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.pname}</h3>
                    <p className="text-gray-600 mb-2">Category: {item.category}</p>
                    <p className="text-gray-600 mb-2">Stock: {item.stock}</p>
                    <div className="flex items-center mb-4">
                      <label className="text-sm text-gray-700 mr-2">Restock Quantity:</label>
                      <input
                        type="number"
                        min="1"
                        value={restockQuantities[item.inventoryId] || 1}
                        onChange={(e) => handleQuantityChange(item.inventoryId, e.target.value)}
                        className="w-20 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{
                          scale: 1.05,
                          background: "linear-gradient(to right, #4f46e5, #06b6d4)",
                        }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleRestock(item.inventoryId, item.pname)}
                        className="flex-1 py-2 bg-gradient-to-r from-indigo-500 to-teal-400 text-white rounded-lg transition-all duration-300 shadow-md flex items-center justify-center"
                        disabled={loading}
                      >
                        <FiPackage className="mr-2" />
                        Restock
                      </motion.button>
                      <motion.button
                        whileHover={{
                          scale: 1.05,
                          background: "linear-gradient(to right, #f43f5e, #e11d48)",
                        }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openReplacementModal(item)}
                        className="flex-1 py-2 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-lg transition-all duration-300 shadow-md flex items-center justify-center"
                        disabled={loading}
                      >
                        <FiRefreshCw className="mr-2" />
                        Replace
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="col-span-full text-center py-10"
            >
              <div className="inline-block p-4 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full mb-4">
                <FiAlertTriangle className="w-10 h-10 text-pink-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No inventory items available</h3>
              <p className="text-gray-500">
                Add items via <a href="/addproduct" className="text-indigo-500 underline">Add Product</a>.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Replacement Modal */}
      {modalOpen && selectedItem && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto relative p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-4 right-4 p-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-md"
              onClick={closeModal}
            >
              <FiX className="w-5 h-5" />
            </motion.button>

            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-teal-500 mb-6">
              Request Replacement for {selectedItem.pname}
            </h2>

            <div className="space-y-4">
              <div className="relative">
                <textarea
                  value={replacementReason}
                  onChange={(e) => setReplacementReason(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 peer h-32"
                  placeholder=" "
                  required
                />
                <label className="absolute left-3 top-3 text-gray-500 pointer-events-none transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:-top-2 peer-focus:text-sm peer-focus:text-indigo-600 peer-focus:bg-white peer-focus:px-1 -top-2 text-sm bg-white px-1">
                  Reason for Replacement
                </label>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleReplacement}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-teal-500 text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg flex items-center justify-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                      ></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <FiRefreshCw className="mr-2" />
                    Submit Replacement
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default RoomPage;