import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';

import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
const Header = () => {
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  const location = useLocation();

  const handleSearch = () => {
    console.log("Searching for booking with", {
      checkInDate,
      checkOutDate,
      adults,
      children,
    });
  };

  const navigate = useNavigate(); // Hook to navigate programmatically

  const handleSearch1 = () => {
    // Add any logic you want here for the search, if needed
    navigate("/guestdashboard"); // Navigate to guestdashboard
  };

  return (
    <div className="text-center py-20">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-6xl font-bold text-blue-600"
      >
        Welcome to Anuthama Villa
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="text-2xl text-black mt-3"
      >
        Experience luxury, comfort, and tranquility in the heart of nature.
      </motion.p>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleSearch1}
        className="mt-6 px-6 py-3 bg-black text-white font-semibold rounded-lg shadow-lg"
      >
        Go To Dashboard
      </motion.button>
    </div>
  );
};

export default Header;
