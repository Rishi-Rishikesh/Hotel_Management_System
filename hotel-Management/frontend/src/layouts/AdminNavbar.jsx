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
  Settings,
  Shield,
  ChevronRight
} from "lucide-react";

const AdminNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { role, setRole, setToken } = useAuth();
  const navigate = useNavigate();
  const [, , removeCookie] = useCookies(["user"]);

  const getSidebarLinks = () => {
    const commonLinks = [
      { to: "/admin-dashboard", label: "Dashboard", icon: Home },
      { to: "/bookings", label: "Bookings", icon: Calendar },
      { to: "/guest-management", label: "Guest Management", icon: Users },
    ];

    if (role === "Admin") {
      return [
        ...commonLinks,
        { to: "/rooms", label: "Manage Rooms", icon: Building },
        { to: "/hall-management", label: "Manage Halls", icon: Building },
        { to: "/staff-management", label: "Staff Management", icon: Users },
        { to: "/tasks/unassigned", label: "Reassign Tasks", icon: List },
        { to: "/finances", label: "Finances", icon: DollarSign },
        { to: "/history", label: "Inventory History", icon: Notebook },
        { to: "/settings", label: "Settings", icon: Settings },
      ];
    } else if (role === "Guest" || role === "User" || !role) { // Default or Guest or User role
      return [
        { to: "/guestdashboard", label: "My Dashboard", icon: Home },
        { to: "/roombooking", label: "Book Rooms", icon: Calendar },
        { to: "/foodordering", label: "Order Food", icon: DollarSign },
        { to: "/guestregistration", label: "My Profile", icon: Users },
      ];
    } else if (role === "Staff") {
      return [
        ...commonLinks,
        { to: "/tasks/today", label: "Today's Tasks", icon: List },
        { to: "/tasks/my", label: "My Tasks", icon: List },
        { to: "/inventory", label: "Inventory", icon: Notebook },
        { to: "/history", label: "History", icon: Notebook },
      ];
    }
    return commonLinks;
  };

  const sidebarLinks = getSidebarLinks();

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
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    removeCookie("user", { path: "/" });
    setToken(null);
    setRole(null);
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const getNavItems = () => {
    const adminItems = [
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

    const staffItems = [
      { name: "Dashboard", path: "/staff-dashboard", icon: Home },
      { name: "My Tasks", path: "/tasks/my", icon: List },
      { name: "New Booking", path: "/bookings/new", icon: Calendar }
    ];

    const guestItems = [
      { name: "My Bookings", path: "/guestdashboard", icon: Calendar },
      { name: "Book Now", path: "/roombooking", icon: Home },
      { name: "Order Dining", path: "/foodordering", icon: DollarSign }
    ];

    if (role === "Admin") return adminItems;
    if (role === "Staff") return staffItems;
    if (role === "Guest" || role === "User" || !role) return guestItems;
    return guestItems;
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col bg-gradient-to-b from-blue-900 to-blue-800 text-white z-50 shadow-2xl">
        <div className="p-6 border-b border-blue-700/50">
          <Link to={role === "Admin" ? "/admin-dashboard" : role === "Staff" ? "/staff-dashboard" : "/guestdashboard"} className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
              <Shield className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight">Anuthama <span className="text-blue-400">Villa</span></span>
          </Link>
          <div className="mt-4 px-2 py-1 bg-blue-700/30 rounded-lg inline-block border border-blue-600/30">
            <span className="text-xs font-semibold text-blue-200 uppercase tracking-widest">
              {role === "Admin" ? "Admin Panel" : role === "Staff" ? "Staff Portal" : "Guest Portal"}
            </span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
          <ul className="space-y-1.5">
            {sidebarLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`flex items-center p-3 rounded-xl transition-all duration-200 group ${location.pathname === link.to
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "hover:bg-white/5 text-blue-100"
                    }`}
                >
                  <link.icon className={`mr-3 transition-colors ${location.pathname === link.to ? "text-white" : "text-blue-300 group-hover:text-white"}`} size={20} />
                  <span className="font-medium">{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-6 border-t border-blue-700/50">
          <button
            onClick={handleLogout}
            className="flex items-center w-full p-3 rounded-xl bg-red-500/10 text-red-200 hover:bg-red-600 hover:text-white transition-all duration-300 font-semibold group"
          >
            <LogOut className="mr-3 group-hover:-translate-x-1 transition-transform" size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-[70] w-72 bg-gradient-to-b from-blue-900 to-blue-800 text-white flex flex-col shadow-2xl lg:hidden"
            >
              <div className="p-6 flex items-center justify-between border-b border-blue-700/50">
                <span className="text-xl font-bold tracking-tight">Anuthama <span className="text-blue-400">Villa</span></span>
                <button onClick={toggleSidebar} className="p-2 rounded-lg bg-white/10 text-white shadow-inner">
                  <X size={24} />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto p-4">
                <ul className="space-y-1.5">
                  {sidebarLinks.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center p-4 rounded-xl transition-all ${location.pathname === link.to ? "bg-blue-600 shadow-lg" : "hover:bg-white/5"}`}
                      >
                        <link.icon className="mr-4 text-blue-300" size={22} />
                        <span className="text-lg font-medium">{link.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="p-6 border-t border-blue-700/50">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full p-4 rounded-xl bg-red-600 text-white transition-all font-bold shadow-lg"
                >
                  <LogOut className="mr-4" size={24} /> Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Top Navigation Bar */}
      <header className={`fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 z-40 transition-all duration-300 shadow-sm`}>
        <div className="max-w-full h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Welcome back, <span className="text-blue-600 font-bold tracking-tight">{role || "Guest"}</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="hidden sm:flex items-center space-x-2 group px-3 py-1.5 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all shadow-sm"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center group-hover:rotate-12 transition-transform">
                <Home size={16} />
              </div>
              <span className="text-sm font-bold text-gray-600">View Public Site</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <div key={item.name} className="relative group">
                  {item.path ? (
                    <Link
                      to={item.path}
                      className="flex items-center px-4 py-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all font-medium"
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <div className="relative">
                      <button
                        onClick={() => toggleDropdown(item.name)}
                        className="flex items-center px-4 py-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all font-medium"
                      >
                        {item.name}
                        <ChevronRight className={`ml-1 transition-transform ${activeDropdown === item.name ? "rotate-90" : ""}`} size={16} />
                      </button>
                      <AnimatePresence>
                        {activeDropdown === item.name && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
                          >
                            {item.subItems.map((sub) => (
                              <Link
                                key={sub.name}
                                to={sub.path}
                                onClick={() => setActiveDropdown(null)}
                                className="block px-4 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            <div className="h-8 w-px bg-gray-200 hidden md:block" />

            <button className="flex items-center gap-2 group p-1 pr-3 rounded-full hover:bg-gray-100 transition-colors">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md group-hover:scale-105 transition-transform">
                {role ? role.charAt(0) : "U"}
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">My Account</span>
            </button>

            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-gray-200 shadow-xl overflow-hidden"
            >
              <div className="p-4 space-y-2">
                {navItems.map((item) => (
                  <div key={item.name}>
                    {item.path ? (
                      <Link
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center p-3 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all font-medium"
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <div className="space-y-1">
                        <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest">{item.name}</div>
                        {item.subItems.map((sub) => (
                          <Link
                            key={sub.name}
                            to={sub.path}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center p-3 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all pl-6"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

export default AdminNavbar;
