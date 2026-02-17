
// src/pages/RoomManagement.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Search, Loader2, Download, Edit, Trash2 } from "lucide-react";
import { getAuth } from "firebase/auth";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_URL = "http://localhost:4000";

function RoomManagement() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    roomNumber: "",
    type: "Single",
    pricePerNight: "",
    capacity: "",
    description: "",
    status: "available",
  });
  const [editRoomId, setEditRoomId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const role = localStorage.getItem("role");

  const colors = {
    primary: "#2563eb",
    primaryLight: "#3b82f6",
    primaryDark: "#1d4ed8",
    secondary: "#64748b",
    background: "#f8fafc",
    surface: "#ffffff",
    textPrimary: "#0f172a",
    textSecondary: "#475569",
    error: "#ef4444",
    success: "#10b981",
    border: "#e2e8f0",
  };

  const refreshToken = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const newToken = await user.getIdToken(true);
        localStorage.setItem("token", newToken);
        setToken(newToken);
        return newToken;
      }
      throw new Error("No user logged in");
    } catch (err) {
      console.error("Error refreshing token:", err);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      document.cookie = "user=; Max-Age=0; path=/";
      toast.error("Session expired. Please log in again.");
      navigate("/login");
      return null;
    }
  };

  const fetchRooms = async (currentToken) => {
    try {
      if (role !== "Admin") {
        throw new Error("Access denied. Admins only.");
      }

      const config = {
        headers: { Authorization: `Bearer ${currentToken}` },
        withCredentials: true,
      };

      const response = await axios.get(`${API_URL}/api/rooms`, config);
      if (response.data.success) {
        setRooms(response.data.rooms || []);
        setLoading(false);
      } else {
        throw new Error(response.data.message || "Failed to fetch rooms");
      }
    } catch (err) {
      console.error("Error fetching rooms:", err);
      if (err.response?.status === 401) {
        const newToken = await refreshToken();
        if (newToken) {
          return fetchRooms(newToken);
        }
      }
      setError(err.message || "Failed to load rooms.");
      setLoading(false);
      toast.error(err.message || "Failed to load rooms.");
      if (err.message !== "Access denied. Admins only.") {
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    if (!token || role !== "Admin") {
      toast.error("Access denied. Please log in as an admin.");
      navigate("/login");
      return;
    }
    fetchRooms(token);
  }, [navigate, token, role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      };

      if (editRoomId) {
        const response = await axios.put(
          `${API_URL}/api/rooms/${formData.roomNumber}`,
          formData,
          config
        );
        if (response.data.success) {
          setRooms(
            rooms.map((room) =>
              room._id === editRoomId ? { ...room, ...formData } : room
            )
          );
          toast.success("Room updated successfully");
          setEditRoomId(null);
          setShowForm(false);
        } else {
          throw new Error(response.data.message || "Failed to update room");
        }
      } else {
        const response = await axios.post(`${API_URL}/api/rooms`, formData, config);
        if (response.data.success) {
          setRooms([...rooms, response.data.room]);
          toast.success("Room added successfully");
        } else {
          throw new Error(response.data.message || "Failed to add room");
        }
      }

      setFormData({
        roomNumber: "",
        type: "Single",
        pricePerNight: "",
        capacity: "",
        description: "",
        status: "available",
      });
    } catch (error) {
      console.error("Save room error:", error);
      toast.error(error.response?.data?.message || "Failed to save room");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (room) => {
    setFormData({
      roomNumber: room.roomNumber,
      type: room.type,
      pricePerNight: room.pricePerNight,
      capacity: room.capacity,
      description: room.description || "",
      status: room.status,
    });
    setEditRoomId(room._id);
    setShowForm(true);
  };

  const handleDelete = async (roomNumber) => {
    if (!window.confirm(`Are you sure you want to delete room ${roomNumber}?`)) return;
    setLoading(true);
    try {
      const response = await axios.delete(`${API_URL}/api/rooms/${roomNumber}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      if (response.data.success) {
        setRooms(rooms.filter((room) => room.roomNumber !== roomNumber));
        toast.success("Room deleted successfully");
      } else {
        throw new Error(response.data.message || "Failed to delete room");
      }
    } catch (error) {
      console.error("Delete room error:", error);
      toast.error(error.response?.data?.message || "Failed to delete room");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      roomNumber: "",
      type: "Single",
      pricePerNight: "",
      capacity: "",
      description: "",
      status: "available",
    });
    setEditRoomId(null);
    setShowForm(false);
  };

  const filteredRooms = rooms.filter((room) =>
    Object.values(room).some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase())
    )
  );

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Room Management Report", 14, 15);
    doc.setFontSize(12);
    doc.text("All Rooms", 14, 25);
    autoTable(doc, {
      startY: 30,
      head: [["Room Number", "Type", "Price/Night", "Capacity", "Status", "Description"]],
      body: rooms.map((room) => [
        room.roomNumber,
        room.type,
        `LKR ${room.pricePerNight}`,
        room.capacity,
        room.status,
        room.description || "No description",
      ]),
    });
    doc.save("Room_Management_Report.pdf");
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <div className="flex items-center gap-3 text-blue-600">
          <Loader2 className="animate-spin text-3xl" />
          <span className="text-lg font-semibold">Loading rooms...</span>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold">{error}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-[95%] mx-auto my-8 p-8 bg-white rounded-xl shadow-lg border"
      style={{ borderColor: colors.border }}
    >
      <h1 className="text-3xl font-semibold text-slate-800 mb-8 text-center relative pb-2">
        Room Management
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-400 to-blue-200"></span>
      </h1>

      <div className="mb-12">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-2 flex-1 max-w-lg">
            <Search className="text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search rooms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 p-2 border rounded bg-white text-black"
              style={{ borderColor: colors.border }}
            />
          </div>
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors flex items-center"
              onClick={generatePDF}
            >
              <Download size={16} className="mr-2" />
              Generate PDF Report
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? "Close Form" : editRoomId ? "Edit Room" : "Add Room"}
            </motion.button>
          </div>
        </div>

        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50 p-6 rounded-lg shadow-md mb-8"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              {editRoomId ? "Update Room" : "Add New Room"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Room Number</label>
                  <input
                    type="text"
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleChange}
                    className="w-full p-2 border rounded bg-white"
                    style={{ borderColor: colors.border }}
                    required
                    disabled={editRoomId}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full p-2 border rounded bg-white"
                    style={{ borderColor: colors.border }}
                  >
                    <option value="Single">Single</option>
                    <option value="Double">Double</option>
                    <option value="Suite">Suite</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Price Per Night (LKR)</label>
                  <input
                    type="number"
                    name="pricePerNight"
                    value={formData.pricePerNight}
                    onChange={handleChange}
                    className="w-full p-2 border rounded bg-white"
                    style={{ borderColor: colors.border }}
                    min="500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Capacity</label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    className="w-full p-2 border rounded bg-white"
                    style={{ borderColor: colors.border }}
                    min="1"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-medium mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full p-2 border rounded bg-white"
                    style={{ borderColor: colors.border }}
                    rows="4"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full p-2 border rounded bg-white"
                    style={{ borderColor: colors.border }}
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                {editRoomId && (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                  >
                    Cancel
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? "Processing..." : editRoomId ? "Update Room" : "Add Room"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full rounded-lg overflow-hidden shadow-md">
            <thead
              style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.primaryLight})` }}
            >
              <tr>
                <th className="p-3 text-left text-white font-medium uppercase text-sm">Room Number</th>
                <th className="p-3 text-left text-white font-medium uppercase text-sm">Type</th>
                <th className="p-3 text-left text-white font-medium uppercase text-sm">Price/Night</th>
                <th className="p-3 text-left text-white font-medium uppercase text-sm">Capacity</th>
                <th className="p-3 text-left text-white font-medium uppercase text-sm">Status</th>
                <th className="p-3 text-left text-white font-medium uppercase text-sm">Description</th>
                <th className="p-3 text-left text-white font-medium uppercase text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.length > 0 ? (
                filteredRooms.map((room) => (
                  <tr
                    key={room._id}
                    className="border-b hover:bg-gray-50 transition-colors even:bg-gray-50/30"
                    style={{ borderColor: colors.border }}
                  >
                    <td className="p-3 text-sm" style={{ color: colors.textPrimary }}>
                      {room.roomNumber}
                    </td>
                    <td className="p-3 text-sm" style={{ color: colors.textPrimary }}>
                      {room.type}
                    </td>
                    <td className="p-3 text-sm" style={{ color: colors.textPrimary }}>
                      LKR {room.pricePerNight}
                    </td>
                    <td className="p-3 text-sm" style={{ color: colors.textPrimary }}>
                      {room.capacity}
                    </td>
                    <td
                      className={`p-3 text-sm font-semibold ${
                        room.status === "available"
                          ? "text-green-700"
                          : room.status === "occupied"
                          ? "text-orange-500"
                          : "text-red-600"
                      }`}
                    >
                      {room.status}
                    </td>
                    <td className="p-3 text-sm" style={{ color: colors.textPrimary }}>
                      {room.description || "No description"}
                    </td>
                    <td className="p-3 text-sm">
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded transition-colors flex items-center"
                          onClick={() => handleEdit(room)}
                        >
                          <Edit size={16} className="mr-1" />
                          Edit
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors flex items-center"
                          onClick={() => handleDelete(room.roomNumber)}
                        >
                          <Trash2 size={16} className="mr-1" />
                          Delete
                        </motion.button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="p-3 text-center text-sm"
                    style={{ color: colors.textPrimary }}
                  >
                    No rooms found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

export default RoomManagement;
