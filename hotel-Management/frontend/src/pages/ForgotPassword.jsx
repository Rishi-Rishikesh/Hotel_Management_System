import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import backgroundImage from "../assets/anuthavilla.jpg";


const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleEmailChange = (event) => setEmail(event.target.value);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");

    if (!email.trim()) {
      setErrorMessage("Email is required!");
      toast.error("Please enter your email");
      return;
    }

    if (!emailRegex.test(email)) {
      setErrorMessage("Invalid email address!");
      toast.error("Invalid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call to send reset email
      // Replace with your actual API endpoint
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Mock delay
      toast.success("Password reset email sent! Please check your inbox.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Error sending reset email:", error);
      const message = "An error occurred. Please try again.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
      className="flex items-center justify-center min-h-screen bg-[url'../assets/anuthavilla.jpg')] bg-cover bg-center relative"    >
      {/* Overlay with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-teal-900/10 backdrop-blur-xs"></div>

      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative bg-white/20 backdrop-blur-md p-6 rounded-xl shadow-xl w-full max-w-sm border border-gray-100/20"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mb-4"
        >
          <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
          <p className="text-gray-700 text-sm mt-1">
            Enter your email and we'll help you reset your password
          </p>
        </motion.div>

        {errorMessage && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-red-500 text-sm text-center mb-4 p-2 bg-red-50/50 rounded-lg"
          >
            {errorMessage}
          </motion.p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <label
              htmlFor="email"
              className="block text-gray-700 text-sm font-medium mb-1"
            >
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                onChange={handleEmailChange}
                value={email}
                className={`w-full px-4 py-2.5 border rounded-lg bg-white/10 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-colors duration-300 ${
                  errorMessage ? "border-red-500" : "border-gray-300"
                }`}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l9-6 9 6v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 12l-9-6m9 6l9-6"
                  />
                </svg>
              </span>
            </div>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05, shadow: "0 0 15px rgba(20, 184, 166, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-teal-500 text-white py-2.5 rounded-lg font-semibold shadow-xl hover:from-blue-600 hover:to-teal-600 transition-all duration-300 ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Sending..." : (
              <>
                Reset Password
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </>
            )}
          </motion.button>
        </form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-4"
        >
          <Link
            to="/login"
            className="text-blue-600 hover:text-teal-500 hover:underline font-medium transition-colors duration-200"
          >
            Back to Login
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ForgotPassword;