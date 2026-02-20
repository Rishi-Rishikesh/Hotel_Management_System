import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { auth } from "../firebaseConfig";

const Header = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;

  return (
    <div className="relative overflow-hidden pt-32 pb-20">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-100/50 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wide text-blue-600 uppercase bg-blue-50 rounded-full"
        >
          Discover Your Perfect Escape
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight"
        >
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">Anuthama Villa</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto font-medium"
        >
          Where luxury meets nature. Experience a getaway like never before with our world-class hospitality.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={() => navigate("/roombooking")}
            className="group relative px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2 overflow-hidden"
          >
            <span className="relative z-10 text-lg">Book Your Stay</span>
            <svg className="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all group-hover:left-full duration-1000" />
          </button>

          {user && (
            <button
              onClick={() => navigate("/guestdashboard")}
              className="px-8 py-4 bg-white text-gray-800 font-bold rounded-2xl border-2 border-gray-100 hover:border-blue-100 hover:bg-blue-50/50 transition-all active:scale-95 text-lg"
            >
              My Dashboard
            </button>
          )}

          {!user && (
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-4 bg-white text-blue-600 font-bold rounded-2xl border-2 border-blue-100 hover:bg-blue-50 transition-all active:scale-95 text-lg"
            >
              Sign In
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Header;
