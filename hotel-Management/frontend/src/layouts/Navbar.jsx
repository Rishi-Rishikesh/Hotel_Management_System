import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Home,
  Info,
  Mail,
  User,
  LogOut,
  ChevronRight,
  Shield,
  Coffee,
  BedDouble,
} from "lucide-react";

/**
 * Premium Navbar for Anuthama Villa
 * Features: Glassmorphism, Responsive Design, Role-based Dashboards
 */
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { role, token, setRole, setToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll visibility effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    setToken(null);
    setRole(null);
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const navLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "About", path: "/about", icon: Info },
    { name: "Rooms", path: "/roombooking", icon: BedDouble },
    { name: "Dining", path: "/foodordering", icon: Coffee },
    { name: "Contact", path: "/contactus", icon: Mail },
  ];

  const getDashboardLink = () => {
    if (role === "Admin") return { name: "Admin Panel", path: "/admin-dashboard", icon: Shield };
    if (role === "Staff") return { name: "Staff Portal", path: "/staff-dashboard", icon: Shield };
    return { name: "My Dashboard", path: "/guestdashboard", icon: User };
  };

  const dashboardLink = getDashboardLink();

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled
        ? "bg-white/80 backdrop-blur-md shadow-lg py-2"
        : "bg-transparent py-4 text-white"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Identity */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
              <Shield className="text-white" size={22} />
            </div>
            <span className={`text-2xl font-bold tracking-tight transition-colors ${isScrolled ? "text-gray-900" : "text-blue-900"
              }`}>
              Anuthama<span className="text-blue-600">Villa</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center space-x-1 font-medium transition-all hover:text-blue-600 ${location.pathname === link.path
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : isScrolled ? "text-gray-600" : "text-gray-700"
                    }`}
                >
                  <link.icon size={16} />
                  <span>{link.name}</span>
                </Link>
              ))}
            </div>

            <div className="h-6 w-px bg-gray-200 mx-2" />

            {token ? (
              <div className="flex items-center space-x-4">
                <Link
                  to={dashboardLink.path}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md hover:bg-blue-700 transition-all hover:shadow-lg active:scale-95"
                >
                  <dashboardLink.icon size={18} />
                  <span>{dashboardLink.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className={`${isScrolled ? "text-gray-700" : "text-gray-700"} font-semibold hover:text-blue-600 px-4`}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-md hover:bg-blue-700 transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Navigation Toggle */}
          <div className="md:hidden flex items-center space-x-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-gray-100 text-gray-600 focus:outline-none"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl z-50 md:hidden flex flex-col"
          >
            <div className="p-6 flex items-center justify-between border-b border-gray-100">
              <span className="text-xl font-bold text-gray-900 font-serifitalic">Anuthama Villa</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg bg-gray-100 text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-50 text-gray-800 font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <link.icon size={20} className="text-blue-600" />
                    <span>{link.name}</span>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </Link>
              ))}

              <div className="pt-8 space-y-4">
                {token ? (
                  <>
                    <Link
                      to={dashboardLink.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between p-4 rounded-xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-200"
                    >
                      <div className="flex items-center space-x-4">
                        <dashboardLink.icon size={20} />
                        <span>{dashboardLink.name}</span>
                      </div>
                      <ChevronRight size={18} />
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center space-x-2 w-full p-4 rounded-xl bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-colors"
                    >
                      <LogOut size={20} />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center p-4 rounded-xl border border-gray-200 text-gray-700 font-semibold"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center p-4 rounded-xl bg-blue-600 text-white font-semibold"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay for Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;