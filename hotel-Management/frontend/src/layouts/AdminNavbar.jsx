import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../AuthContext";
import {
  Menu,
  X,
  LogOut,
  Home,
  Users,
  Building,
  List,
  Calendar,
  DollarSign,
  Notebook,
  Settings
} from "lucide-react";

const AdminNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [, , removeCookie] = useCookies(["user"]);
  const navigate = useNavigate();

  const sidebarLinks = [
    { to: "/dashboard", label: "Dashboard", icon: Home },
    { to: "/rooms", label: "Manage Rooms", icon: Home },
    { to: "/hall-management", label: "Manage Halls", icon: Building },
    { to: "/tasks/unassigned", label: "Reassign Tasks", icon: List },
    { to: "/bookings", label: "Bookings", icon: Calendar },
    { to: "/guest-management", label: "Guest Management", icon: Users },
    { to: "/staff-management", label: "Staff Management", icon: Users },
    { to: "/finances", label: "Finances", icon: DollarSign },
    { to: "/history", label: "Inventory History", icon: Notebook },
    { to: "/settings", label: "Settings", icon: Settings },
  ];

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleDropdown = (itemName) => {
    setActiveDropdown(activeDropdown === itemName ? null : itemName);
  };

  const handleLogout = () => {
    removeCookie("user", { path: "/" });
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const { role } = useAuth();

  const navItems = [
    { name: "Dashboard", path: "/admin-dashboard", icon: Home },
    {
      name: "Quick Access",
      icon: Users,
      subItems: [
        { name: "New Booking", path: "/bookings/new" },
        { name: "Today's Tasks", path: "/tasks/today" },
        { name: "Recent Guests", path: "/guest-management/recent" }
      ]
    }
  ];

  return (
    <>
      {/* Sidebar - Toggleable overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-y-0 left-0 z-50 w-60 bg-gradient-to-b from-blue-800 to-blue-600 text-white flex flex-col lg:w-64"
          >
            <div className="p-4 text-xl font-bold flex justify-between items-center">
              {role === "Staff" ? "Staff Portal" : "Admin Panel"}
              <button
                className="p-2 rounded-md text-white hover:bg-blue-700 focus:outline-none transition-colors duration-200"
                onClick={toggleSidebar}
              >
                <X size={24} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto">
              <ul className="space-y-1 px-2">
                {sidebarLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="flex items-center p-3 rounded-lg hover:bg-blue-700 transition-colors"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <link.icon className="mr-3" />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="p-4 border-t border-blue-700">
              <button
                onClick={handleLogout}
                className="flex items-center w-full p-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <LogOut className="mr-3" />
                Logout
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Navbar - Full width at the top */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white bg-opacity-95 backdrop-blur-lg  border-b border-gray-100 shadow-sm sticky top-0 z-40 w-full"
      >
        <div className="max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Menu Button */}
            <div className="flex items-center">
              <button
                className="mr-4 p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-50 focus:outline-none transition-colors duration-200"
                onClick={toggleSidebar}
              >
                <Menu size={24} />
              </button>
              <Link
                to="/admin-dashboard"
                className="flex items-center space-x-2"
              >
                <motion.div
                  whileHover={{ rotate: 5 }}
                  className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center"
                >
                  <Home className="text-white" size={18} />
                </motion.div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                  Anuthama Villa
                </span>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <div key={item.name} className="relative">
                  {item.path ? (
                    <Link
                      to={item.path}
                      className="flex items-center px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium group"
                    >
                      <item.icon className="mr-2" size={18} />
                      {item.name}
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                    </Link>
                  ) : (
                    <div className="relative">
                      <button
                        onClick={() => toggleDropdown(item.name)}
                        className="flex items-center px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium group"
                      >
                        <item.icon className="mr-2" size={18} />
                        {item.name}
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                      </button>
                      <AnimatePresence>
                        {activeDropdown === item.name && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute left-0 mt-2 w-56 origin-top-right rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                          >
                            <div className="py-1">
                              {item.subItems.map((subItem) => (
                                <Link
                                  key={subItem.name}
                                  to={subItem.path}
                                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150"
                                  onClick={() => setActiveDropdown(null)}
                                >
                                  {subItem.name}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              ))}
              <div className="flex items-center ml-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                  A
                </div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-50 focus:outline-none transition-colors duration-200"
              onClick={toggleMenu}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-white bg-opacity-95 backdrop-blur-lg overflow-hidden"
            >
              <div className="px-2 pt-2 pb-4 space-y-2">
                {navItems.map((item) => (
                  <div key={item.name}>
                    {item.path ? (
                      <Link
                        to={item.path}
                        onClick={toggleMenu}
                        className="flex items-center px-3 py-3 rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200 font-medium"
                      >
                        <item.icon className="mr-3" size={18} />
                        {item.name}
                      </Link>
                    ) : (
                      <div className="space-y-1">
                        <button
                          onClick={() => toggleDropdown(item.name)}
                          className="flex items-center justify-between w-full px-3 py-3 rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200 font-medium"
                        >
                          <div className="flex items-center">
                            <item.icon className="mr-3" size={18} />
                            {item.name}
                          </div>
                        </button>
                        {activeDropdown === item.name && (
                          <div className="pl-8 space-y-1">
                            {item.subItems.map((subItem) => (
                              <Link
                                key={subItem.name}
                                to={subItem.path}
                                onClick={toggleMenu}
                                className="block px-3 py-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200 text-sm"
                              >
                                {subItem.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

export default AdminNavbar;