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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
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
    { name: "Dashboard", path: "/dashboard", icon: User },
    { name: "About", path: "/about", icon: Info },
    { name: "Rooms", path: "/roombooking", icon: BedDouble },
    { name: "Dining", path: "/foodordering", icon: Coffee },
    { name: "Contact", path: "/contactus", icon: Mail },
  ];

  const getDashboardPath = () => {
    if (role === "Admin") return "/guestdashboard";
    if (role === "Staff") return "/staff-dashboard";
    return "/guestdashboard";
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${isScrolled
        ? "bg-white/90 backdrop-blur-xl shadow-xl py-3 border-b border-gray-100"
        : "bg-transparent py-6"
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <div className="absolute inset-0 bg-blue-600/10 rounded-full scale-110 group-hover:scale-125 transition-transform duration-500" />
              <svg
                viewBox="0 0 24 24"
                className="w-8 h-8 text-blue-600 transition-all duration-500 group-hover:rotate-12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
                <path d="M12 2v20" className="opacity-20" />
                <path d="M2 12h20" className="opacity-20" />
              </svg>
            </div>
            <div className="flex flex-col -space-y-1">
              <span className={`text-xl font-black tracking-tight transition-colors duration-300 ${isScrolled ? "text-gray-900" : "text-gray-900"}`}>
                ANUTHAMA
              </span>
              <span className="text-xs font-bold text-blue-600 tracking-[0.3em] uppercase opacity-80">
                Boutique Villa
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-10">
            <div className="flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative group px-1 py-1 font-bold text-sm uppercase tracking-widest transition-all ${location.pathname === link.path
                    ? "text-blue-600"
                    : "text-gray-500 hover:text-blue-600"
                    }`}
                >
                  <span className="relative z-10">{link.name}</span>
                  <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transition-transform duration-300 origin-right ${location.pathname === link.path ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100 group-hover:origin-left"
                    }`} />
                </Link>
              ))}
            </div>

            <div className="h-6 w-px bg-gray-200" />

            {token ? (
              <div className="flex items-center space-x-6">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 bg-gray-900 text-white px-7 py-3 rounded-2xl font-black text-sm uppercase tracking-wider shadow-2xl shadow-gray-200 hover:bg-blue-600 transition-all active:scale-95"
                >
                  <User size={18} />
                  <span>Account</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-3 rounded-2xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all border border-gray-100"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-5">
                <Link
                  to="/login"
                  className="text-gray-600 font-black text-sm uppercase tracking-widest hover:text-blue-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                >
                  Join Us
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-3 rounded-2xl bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all border border-gray-100"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[110]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl z-[120] flex flex-col"
            >
              <div className="p-8 flex items-center justify-between border-b border-gray-50">
                <div className="flex flex-col -space-y-1">
                  <span className="text-xl font-black tracking-tight">ANUTHAMA</span>
                  <span className="text-[10px] font-bold text-blue-600 tracking-[0.3em] uppercase opacity-80">
                    Boutique Villa
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-2xl bg-gray-50 text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 px-8 py-10 space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between p-5 rounded-3xl bg-gray-50 text-gray-900 font-black text-sm uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 transition-all group"
                  >
                    <div className="flex items-center space-x-5">
                      <link.icon size={22} className="text-gray-400 group-hover:text-blue-500" />
                      <span>{link.name}</span>
                    </div>
                    <ChevronRight size={18} className="text-gray-300 group-hover:translate-x-1 group-hover:text-blue-400" />
                  </Link>
                ))}

                <div className="pt-10 space-y-5">
                  {token ? (
                    <>
                      <Link
                        to={getDashboardPath()}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between p-6 rounded-[2rem] bg-gray-900 text-white font-black text-sm uppercase tracking-widest shadow-2xl"
                      >
                        <div className="flex items-center space-x-5">
                          <User size={22} />
                          <span>My Profile</span>
                        </div>
                        <ChevronRight size={20} />
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full p-6 text-center text-red-500 font-black text-sm uppercase tracking-widest hover:bg-red-50 rounded-3xl transition-all"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <div className="grid gap-4">
                      <Link
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-6 text-center border-2 border-gray-100 rounded-3xl font-black text-sm uppercase tracking-widest text-gray-900 hover:border-gray-900 transition-all"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/signup"
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-6 text-center bg-blue-600 text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-100"
                      >
                        Create Account
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;

