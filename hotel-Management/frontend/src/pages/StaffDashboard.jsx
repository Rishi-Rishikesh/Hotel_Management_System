// InventoryManagement.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { LogOut, List, Package, Bell, Calendar, Settings, Clipboard, Notebook } from "lucide-react";

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Professional blue color palette
  const colors = {
    primary: "#2563EB",       // Primary blue
    primaryLight: "#3B82F6",  // Lighter blue
    primaryLighter: "#93C5FD", // Very light blue
    primaryDark: "#1D4ED8",   // Darker blue
    secondary: "#64748B",     // Cool gray
    background: "#F8FAFC",    // Lightest blue-gray background
    surface: "#FFFFFF",       // White surface
    textPrimary: "#1E293B",   // Dark blue-gray text
    textSecondary: "#64748B", // Medium blue-gray text
    error: "#DC2626",        // Red for errors
    success: "#16A34A",      // Green for success
    border: "#E2E8F0",       // Light border
    accent: "#2563EB",       // Accent color (same as primary)
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setNotifications([
          { id: 1, message: "New task assigned: Clean Room 101", type: "task", timestamp: "2025-05-09T10:00:00Z" },
          { id: 2, message: "Inventory low: Towels (only 5 remaining)", type: "inventory", timestamp: "2025-05-09T09:30:00Z" },
          { id: 3, message: "Task completed: Restock Room 102", type: "task", timestamp: "2025-05-09T08:45:00Z" },
        ]);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        toast.error("Failed to load notifications");
      }
    };
    fetchNotifications();
  }, []);

  const handleLogout = () => {
    setIsLoading(true);
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    document.cookie = "user=; Max-Age=0; path=/";
    toast.success("Logged out successfully");
    setTimeout(() => {
      setIsLoading(false);
      navigate("/login");
    }, 500);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleNotificationPanel = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const notificationVariants = {
    hidden: { x: 300, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
  };

  const sidebarLinks = [
    { to: "/staff/dashboard", label: "Dashboard", icon: Calendar },
    { to: "/tasks", label: "View Tasks", icon: List },
    { to: "/inventory", label: "Manage Inventory", icon: Package },
    { to: "/history", label: "Inventory History", icon: Notebook },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isSidebarOpen ? 0 : -300 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl border-r border-gray-200 lg:static lg:w-64"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Villa Staff Portal</h2>
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
            aria-label="Toggle sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="mt-6">
          {sidebarLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center px-6 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 group"
              onClick={() => setIsSidebarOpen(false)}
            >
              <link.icon className="w-5 h-5 mr-3 text-gray-500 group-hover:text-blue-600" />
              <span className="font-medium">{link.label}</span>
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full p-6 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-4 py-2 text-gray-600 hover:text-white hover:bg-blue-600 rounded-md transition-colors duration-200 border border-gray-300 hover:border-blue-600"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-40 border-b border-gray-200">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 mr-2"
              aria-label="Toggle sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold text-gray-800">Staff Dashboard</h1>
          </div>
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleNotificationPanel}
              className="relative p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Toggle notifications"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleLogout}
              disabled={isLoading}
              className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {isLoading ? "Logging out..." : "Logout"}
            </motion.button>
          </div>
        </header>

        {/* Notification Panel */}
        <motion.aside
          variants={notificationVariants}
          initial="hidden"
          animate={isNotificationOpen ? "visible" : "hidden"}
          className="fixed inset-y-0 right-0 z-50 w-80 bg-white shadow-lg p-6 overflow-y-auto border-l border-gray-200"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
            <button
              onClick={toggleNotificationPanel}
              className="p-1 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
              aria-label="Close notifications"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-10 h-10 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No new notifications</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-200 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`p-2 rounded-md ${
                        notification.type === "task" ? "bg-blue-100 text-blue-600" : "bg-amber-100 text-amber-600"
                      }`}
                    >
                      {notification.type === "task" ? (
                        <List className="w-4 h-4" />
                      ) : (
                        <Package className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </motion.aside>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-1">Welcome Back</h2>
            <p className="text-gray-600">Here's an overview of your tasks and inventory</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Tasks Card */}
            <motion.div 
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <Link to="/tasks" className="block p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pending Tasks</p>
                    <h3 className="text-2xl font-semibold text-gray-800 mt-1">5</h3>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <List className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <span className="text-sm font-medium text-blue-600 hover:underline">View all tasks</span>
                </div>
              </Link>
            </motion.div>

            {/* Inventory Card */}
            <motion.div 
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <Link to="/inventory" className="block p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Low Stock Items</p>
                    <h3 className="text-2xl font-semibold text-gray-800 mt-1">3</h3>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <span className="text-sm font-medium text-blue-600 hover:underline">Manage inventory</span>
                </div>
              </Link>
            </motion.div>

            {/* History Card */}
            <motion.div 
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <Link to="/history" className="block p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Today's Updates</p>
                    <h3 className="text-2xl font-semibold text-gray-800 mt-1">12</h3>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Notebook className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <span className="text-sm font-medium text-blue-600 hover:underline">View history</span>
                </div>
              </Link>
            </motion.div>
          </div>

          {/* Recent Activity Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div key={notification.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-md ${
                      notification.type === "task" ? "bg-blue-100" : "bg-amber-100"
                    }`}>
                      {notification.type === "task" ? (
                        <List className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Package className="w-4 h-4 text-amber-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-200 text-center">
              <Link to="/history" className="text-sm font-medium text-blue-600 hover:underline">
                View all activity
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StaffDashboard;