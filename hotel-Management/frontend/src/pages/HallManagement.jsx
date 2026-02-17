import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Search, Loader2, Download, Edit, Trash2 } from "lucide-react";
import { getAuth, signOut } from "firebase/auth";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_URL = "http://localhost:4000";

function HallManagement() {
  const navigate = useNavigate();
  const [halls, setHalls] = useState([]);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    number: "",
    capacity: "",
    price: "",
    description: "",
    facilities: "",
    status: "available",
  });
  const [editHallId, setEditHallId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

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

  const fetchHalls = async (currentToken) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${currentToken}` },
        withCredentials: true,
      };
      console.log("Fetching halls with config:", config);
      console.log("API_URL:", API_URL);
      const response = await axios.get(`${API_URL}/api/halls`, config);
      console.log("Fetch halls response:", response.data);
      if (response.data.success) {
        setHalls(response.data.halls || []);
        setLoading(false);
      } else {
        throw new Error(response.data.message || "Failed to fetch halls");
      }
    } catch (err) {
      console.error("Error fetching halls:", err);
      console.log("Error response:", err.response?.data);
      console.log("Error status:", err.response?.status);
      if (err.response?.status === 401) {
        const newToken = await refreshToken();
        if (newToken) {
          return fetchHalls(newToken);
        }
      }
      setError(err.response?.data?.message || err.message || "Failed to load halls.");
      setLoading(false);
      toast.error(err.response?.data?.message || err.message || "Failed to load halls.");
      navigate("/login");
    }
  };

 useEffect(() => {
  const auth = getAuth();
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      try {
        const tokenResult = await user.getIdTokenResult(true);
        const userRole = localStorage.getItem("role") || "Admin"; 
        localStorage.setItem("token", tokenResult.token);
        setToken(tokenResult.token);
        console.log("User role:", userRole);
        console.log("Token claims:", tokenResult.claims);
        if (userRole !== "Admin") {
          toast.error("Access denied. Please log in as an admin.");
          navigate("/login");
          return;
        }
        fetchHalls(tokenResult.token);
      } catch (err) {
        console.error("Error verifying user:", err);
        toast.error("Failed to verify user. Please log in again.");
        navigate("/login");
      }
    } else {
      toast.error("Please log in.");
      navigate("/login");
    }
  });
}, [navigate]);

  useEffect(() => {
    console.log("Halls state:", halls);
  }, [halls]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      };
      const normalizedFormData = {
        ...formData,
        facilities: formData.facilities
          ? formData.facilities.split(",").map((f) => f.trim()).filter((f) => f)
          : [],
      };
      console.log("Submitting hall data:", normalizedFormData);
      console.log("Config:", config);
      if (editHallId) {
        console.log("Updating hall:", formData.number);
        await axios.put(`${API_URL}/api/halls/${formData.number}`, normalizedFormData, config);
        toast.success("Hall updated successfully");
      } else {
        console.log("Adding new hall");
        await axios.post(`${API_URL}/api/halls`, normalizedFormData, config);
        toast.success("Hall added successfully");
      }
      setFormData({ number: "", capacity: "", price: "", description: "", facilities: "", status: "available" });
      setEditHallId(null);
      setShowForm(false);
      fetchHalls(token);
    } catch (err) {
      console.error("Save hall error:", err);
      console.log("Error response:", err.response?.data);
      toast.error(err.response?.data?.message || "Failed to save hall");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (hall) => {
    setFormData({
      number: hall.number,
      capacity: hall.capacity,
      price: hall.price,
      description: hall.description || "",
      facilities: hall.facilities ? hall.facilities.join(", ") : "",
      status: hall.status,
    });
    setEditHallId(hall._id);
    setShowForm(true);
  };

  const handleDelete = async (number) => {
    if (!window.confirm(`Are you sure you want to delete hall ${number}?`)) return;
    setLoading(true);
    try {
      const response = await axios.delete(`${API_URL}/api/halls/${number}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      if (response.data.success) {
        setHalls(halls.filter((hall) => hall.number !== number));
        toast.success("Hall deleted successfully");
      } else {
        throw new Error(response.data.message || "Failed to delete hall");
      }
    } catch (error) {
      console.error("Delete hall error:", error);
      toast.error(error.response?.data?.message || "Failed to delete hall");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      number: "",
      capacity: "",
      price: "",
      description: "",
      facilities: "",
      status: "available",
    });
    setEditHallId(null);
    setShowForm(false);
  };

  const filteredHalls = halls.filter((hall) =>
    Object.values(hall).some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase())
    )
  );

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Hall Management Report", 14, 15);
    doc.setFontSize(12);
    doc.text("All Halls", 14, 25);
    autoTable(doc, {
      startY: 30,
      head: [["Hall Number", "Capacity", "Price", "Status", "Description", "Facilities"]],
      body: halls.map((hall) => [
        hall.number,
        hall.capacity,
        `LKR ${hall.price}`,
        hall.status,
        hall.description || "No description",
        hall.facilities ? hall.facilities.join(", ") : "None",
      ]),
    });
    doc.save("Hall_Management_Report.pdf");
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
          <span className="text-lg font-semibold">Loading halls...</span>
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
        Hall Management
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-400 to-blue-200"></span>
      </h1>

      <div className="mb-12">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-2 flex-1 max-w-lg">
            <Search className="text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search halls..."
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
              {showForm ? "Close Form" : editHallId ? "Edit Hall" : "Add Hall"}
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
              {editHallId ? "Update Hall" : "Add New Hall"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Hall Number</label>
                  <input
                    type="text"
                    name="number"
                    value={formData.number}
                    onChange={handleChange}
                    className="w-full p-2 border rounded bg-white"
                    style={{ borderColor: colors.border }}
                    required
                    disabled={editHallId}
                    placeholder="e.g., H001"
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
                    placeholder="e.g., 50"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Price (LKR)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full p-2 border rounded bg-white"
                    style={{ borderColor: colors.border }}
                    min="1000"
                    required
                    placeholder="e.g., 50000"
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
                    <option value="booked">Booked</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
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
                    placeholder="e.g., Spacious hall with modern amenities"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-medium mb-1">
                    Facilities (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="facilities"
                    value={formData.facilities}
                    onChange={handleChange}
                    className="w-full p-2 border rounded bg-white"
                    style={{ borderColor: colors.border }}
                    placeholder="e.g., Projector, Wi-Fi, Sound System"
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="animate-spin inline-block mr-2" size={16} />
                  ) : null}
                  {editHallId ? "Update Hall" : "Add Hall"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-gray-700 font-semibold">Hall Number</th>
                <th className="p-3 text-gray-700 font-semibold">Capacity</th>
                <th className="p-3 text-gray-700 font-semibold">Price (LKR)</th>
                <th className="p-3 text-gray-700 font-semibold">Status</th>
                <th className="p-3 text-gray-700 font-semibold">Description</th>
                <th className="p-3 text-gray-700 font-semibold">Facilities</th>
                <th className="p-3 text-gray-700 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHalls.length > 0 ? (
                filteredHalls.map((hall) => (
                  <motion.tr
                    key={hall._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="p-3">{hall.number}</td>
                    <td className="p-3">{hall.capacity}</td>
                    <td className="p-3">{hall.price}</td>
                    <td className="p-3 capitalize">{hall.status}</td>
                    <td className="p-3">{hall.description || "N/A"}</td>
                    <td className="p-3">
                      {hall.facilities ? hall.facilities.join(", ") : "None"}
                    </td>
                    <td className="p-3 flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEdit(hall)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <Edit size={20} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(hall.number)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 size={20} />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-3 text-center text-gray-500">
                    No halls found
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

export default HallManagement;