import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Home, List, Settings, Users, Notebook, Calendar, DollarSign, Building } from "lucide-react";
import axios from "axios";
import AdminNavbar from "../layouts/AdminNavbar"; // Adjust the import path as needed

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  useEffect(() => {
    const testBookings = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:4000/api/bookings/rooms", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        console.log("Test bookings response:", response.data);
      } catch (err) {
        console.error("Test bookings error:", err.response?.status, err.response?.data);
      }
    };
    testBookings();
  }, []);

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Quick Action links
  const quickActionLinks = [
    { to: "/rooms", label: "Manage Rooms", icon: Home },
    { to: "/hall-management", label: "Manage Halls", icon: Building },
    { to: "/schedule", label: "Reassign Tasks", icon: List },
    { to: "/bookings", label: "Bookings", icon: Calendar },
    { to: "/guest-management", label: "Guest Management", icon: Users },
    { to: "/staff-management", label: "Staff Management", icon: Users },
    { to: "/finances", label: "Finances", icon: DollarSign },
    { to: "/history", label: "Inventory History", icon: Notebook },
  ];

  return (
    <div className="min-h-screen bg-slate-50" style={{ backgroundColor: colors.background }}>
      {/* AdminNavbar - Full-width at the top */}
{/* //<AdminNavbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /> */}

      {/* Main Content - Shifts right when sidebar is open */}
      <motion.main
        animate={{ x: sidebarOpen ? 240 : 0 }} // Shift 240px (sidebar width) when open
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="p-6 lg:max-w-[calc(100%-256px)] lg:ml-auto"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-slate-800">Welcome back</h2>
          <p className="text-slate-600 mt-2">Manage your hotel operations</p>
        </motion.div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActionLinks.map((link, index) => (
              <motion.div
                key={link.to}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.1 * index }}
              >
                <Link
                  to={link.to}
                  className="block bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-slate-100 hover:border-blue-100"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <link.icon className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">{link.label}</h3>
                      <p className="text-slate-500 text-sm mt-1">
                        {link.label === "Manage Rooms" && "Add, update, or delete rooms"}
                        {link.label === "Manage Halls" && "Add, update, or delete halls"}
                        {link.label === "Reassign Tasks" && "Assign unassigned tasks"}
                        {link.label === "Bookings" && "View and manage bookings"}
                        {link.label === "Guest Management" && "Manage guest accounts"}
                        {link.label === "Staff Management" && "Manage staff accounts"}
                        {link.label === "Finances" && "Track revenue and expenses"}
                        {link.label === "Inventory History" && "View all inventory updates and history"}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.main>
    </div>
  );
};

export default AdminDashboard;