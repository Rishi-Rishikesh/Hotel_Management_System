import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

const GuestProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/api/guests/dashboard",
          { withCredentials: true }
        );
        setUser(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (user.email) {
      setShow(true);
    }
  }, [user]);

  const handleViewBooking = () => {
    navigate("/viewbookings");
  };

  const handleFeedback = () => {
    navigate("/addfeedback");
  };

  const handleReview = () => {
    navigate("/addreview");
  };

  const handleUpdateProfile = () => {
    navigate("/updateprofile", { state: { user } });
  };

  const handleOrderFood = () => {
    navigate("/menu");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      {/* Profile Card */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-white shadow-2xl rounded-xl p-6 w-full max-w-2xl backdrop-blur-sm"
      >
        <motion.h1 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="text-3xl font-bold text-center text-blue-700 mb-6"
        >
          Guest Profile
        </motion.h1>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
            />
          </div>
        ) : show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {/* Personal Details Header with View Booking History Button */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <motion.h2 
                whileHover={{ scale: 1.02 }}
                className="text-2xl font-semibold text-blue-900"
              >
                Personal Details
              </motion.h2>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 5px 15px rgba(37, 99, 235, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleViewBooking}
                className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-300 text-sm font-medium shadow-md"
              >
                View Booking History
              </motion.button>
            </div>

            {/* User Details */}
            <div className="space-y-4 mb-8">
              {[
                { label: "First Name", value: user.fname },
                { label: "Last Name", value: user.lname },
                { label: "Address", value: user.address },
                { label: "Email Address", value: user.email },
                { label: "Phone Number", value: user.phoneNumber },
                { label: "Gender", value: user.gender },
                { label: "Status", value: user.status }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="flex flex-col sm:flex-row justify-between gap-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <span className="font-medium text-blue-900">{item.label}</span>
                  <span className="text-blue-800 font-medium">{item.value || 'N/A'}</span>
                </motion.div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 5px 15px rgba(5, 150, 105, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleFeedback}
                className="bg-gradient-to-r from-green-600 to-green-500 text-white py-2 rounded-lg hover:from-green-700 hover:to-green-600 transition-all duration-300 text-sm font-medium shadow-md"
              >
                Feedback
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 5px 15px rgba(217, 119, 6, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleReview}
                className="bg-gradient-to-r from-amber-600 to-amber-500 text-white py-2 rounded-lg hover:from-amber-700 hover:to-amber-600 transition-all duration-300 text-sm font-medium shadow-md"
              >
                Review
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 5px 15px rgba(37, 99, 235, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUpdateProfile}
                className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-2 rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-300 text-sm font-medium shadow-md"
              >
                Update
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 5px 15px rgba(234, 88, 12, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleOrderFood}
                className="bg-gradient-to-r from-orange-600 to-orange-500 text-white py-2 rounded-lg hover:from-orange-700 hover:to-orange-600 transition-all duration-300 text-sm font-medium shadow-md"
              >
                Order Food
              </motion.button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default GuestProfile;