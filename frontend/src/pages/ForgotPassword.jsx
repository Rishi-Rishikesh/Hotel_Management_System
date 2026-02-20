import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { auth, sendPasswordResetEmail } from "../firebaseConfig";
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
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent! Please check your inbox.");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      console.error("Error sending reset email:", error);
      let message = "An error occurred. Please try again.";
      if (error.code === "auth/user-not-found") {
        message = "No account found with this email.";
      } else if (error.code === "auth/invalid-email") {
        message = "Invalid email format.";
      } else if (error.code === "auth/too-many-requests") {
        message = "Too many requests. Please try again later.";
      }
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
      transition={{ duration: 1 }}
      className="flex items-center justify-center min-h-screen relative"
      style={{
        backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.3), rgba(224, 242, 254, 0.3)), url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative bg-white/95 backdrop-blur-sm border border-blue-50 rounded-2xl shadow-lg w-full max-w-md p-8 mx-4"
        style={{
          boxShadow: "0 10px 25px rgba(59, 130, 246, 0.1)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mb-8"
        >
          <h2
            className="text-4xl font-bold tracking-tight mb-2"
            style={{
              color: "#3B82F6",
              fontFamily: "'Playfair Display', serif",
              textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
            }}
          >
            Anuthama Villa
          </h2>
          <h1 className="text-2xl font-semibold text-gray-800">Forgot Password?</h1>
          <p className="mt-2 text-sm text-gray-500">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </motion.div>

        {errorMessage && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-red-500 text-sm text-center mb-6 p-3 bg-red-50 rounded-lg border border-red-100"
          >
            {errorMessage}
          </motion.p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
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
              <input
                type="email"
                id="email"
                placeholder="example@domain.com"
                onChange={handleEmailChange}
                value={email}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300"
              />
            </div>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)" }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium shadow-md hover:bg-blue-700 transition-all duration-300 flex items-center justify-center ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </motion.button>
        </form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-6 text-center"
        >
          <Link
            to="/login"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            Back to Login
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ForgotPassword;