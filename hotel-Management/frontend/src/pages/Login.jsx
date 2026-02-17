import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { auth, signInWithEmailAndPassword } from "../firebaseConfig";
import backgroundImage from "../assets/anuthavilla.jpg";

const Login = ({ setUserRole }) => {
  const navigate = useNavigate();
  const [cookies, setCookie, removeCookie] = useCookies(["user"]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");

  const colors = {
    primary: "#3B82F6",
    primaryLight: "#60A5FA",
    primaryDark: "#2563EB",
    secondary: "#1E40AF",
    background: "#EFF6FF",
    surface: "#FFFFFF",
    textPrimary: "#1F2937",
    textSecondary: "#6B7280",
    error: "#DC2626",
    success: "#059669",
    border: "#E5E7EB",
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^.{6,}$/;

  const changeEmail = (e) => setEmail(e.target.value);
  const changePassword = (e) => setPassword(e.target.value);

  const handleLogin = async (e) => {
    e.preventDefault();
    setEmailErrorMessage("");
    setPasswordErrorMessage("");
    setErrorMessage("");

    if (!emailRegex.test(email)) {
      setEmailErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!passwordRegex.test(password)) {
      setPasswordErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    // Check if online
    if (!navigator.onLine) {
      setErrorMessage("No internet connection. Please check your network and try again.");
      toast.error("No internet connection");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Login attempt with email:", email);
      console.log("Password provided:", password ? "[Password Hidden]" : "No password");

      // Sign in with retry logic for network issues
      let userCredential;
      let retries = 2;

      while (retries >= 0) {
        try {
          userCredential = await signInWithEmailAndPassword(auth, email, password);
          break;
        } catch (firebaseError) {
          if (firebaseError.code === 'auth/network-request-failed' && retries > 0) {
            console.log(`Network error, retrying... (${retries} attempts left)`);
            retries--;
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
            continue;
          }
          throw firebaseError;
        }
      }

      const idToken = await userCredential.user.getIdToken(true);
      console.log("Firebase idToken obtained:", idToken);
      localStorage.setItem('token', idToken);

      const response = await axios.post(
        "http://localhost:4000/api/guests/login",
        { idToken },
        {
          withCredentials: true,
          timeout: 10000 // 10 second timeout
        }
      );

      console.log("Server response:", response.data);

      if (response.data.success) {
        const { role, user } = response.data;
        setCookie("user", user, {
          path: "/",
          maxAge: 86400,
          sameSite: "Lax",
          secure: process.env.NODE_ENV === "production",
        });
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("role", role);
        setUserRole(role);
        toast.success("Login successful!");
        const redirectTo =
          role === "Staff" ? "/staff-dashboard" :
            role === "Admin" ? "/admin-dashboard" :
              "/guestdashboard";
        setTimeout(() => navigate(redirectTo), 100);
      } else {
        const message = response.data.message || "Login failed";
        setErrorMessage(message);
        toast.error(message);
      }
    } catch (error) {
      if (error.response) {
        console.error("❌ BACKEND ERROR:", error.response.data.message || error.response.statusText);
        console.error("❌ STATUS CODE:", error.response.status);
      } else {
        console.error("❌ LOGIN ERROR:", error.message);
      }

      let message = "Failed to log in. Please try again.";

      if (error.code) {
        switch (error.code) {
          case "auth/network-request-failed":
            message = "Network connection failed. Please check your internet connection, firewall settings, or VPN and try again.";
            break;
          case "auth/invalid-credential":
            message = "Invalid email or password. Please try again.";
            break;
          case "auth/user-not-found":
            message = "No account found with this email.";
            break;
          case "auth/wrong-password":
            message = "Incorrect password.";
            break;
          case "auth/invalid-email":
            message = "Invalid email format.";
            break;
          case "auth/too-many-requests":
            message = "Too many attempts. Please try again later.";
            break;
          default:
            message = `Authentication error: ${error.message}`;
        }
      } else if (error.response) {
        if (error.response.status === 401) {
          message = error.response.data.message || "Invalid or expired token.";
        } else if (error.response.status === 409) {
          message = error.response.data.message || "Duplicate email conflict. Please contact support.";
        } else if (error.response.status === 404) {
          message = "Backend server not found. Please contact support.";
        }
      } else if (error.code === 'ECONNABORTED') {
        message = "Request timeout. Please check your connection and try again.";
      }

      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    setIsSubmitting(true);
    removeCookie("user", { path: "/" });
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    setUserRole(null);
    toast.success("Logged out successfully!");
    setTimeout(() => {
      setIsSubmitting(false);
      navigate("/login");
    }, 500);
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
            className="text-4xl font-bold tracking-tight"
            style={{
              color: colors.primary,
              fontFamily: "'Playfair Display', serif",
              textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
            }}
          >
            Anuthama Villa
          </h2>
          <h1 className="text-2xl font-semibold text-gray-800 mt-2">
            Welcome Back
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Sign in with your email and password
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

        <form onSubmit={handleLogin} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                id="email"
                placeholder="example@domain.com"
                onChange={changeEmail}
                value={email}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300"
              />
            </div>
            {emailErrorMessage && (
              <p className="text-red-500 text-xs mt-1">{emailErrorMessage}</p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative mt-1">
              <input
                type="password"
                id="password"
                placeholder="••••••"
                onChange={changePassword}
                value={password}
                className="w-full pl-4 pr-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300"
              />
            </div>
            {passwordErrorMessage && (
              <p className="text-red-500 text-xs mt-1">{passwordErrorMessage}</p>
            )}
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
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </motion.button>
        </form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-6 text-center"
        >
          <button
            onClick={handleLogout}
            disabled={isSubmitting}
            className={`text-sm text-gray-600 hover:text-gray-800 transition-colors ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
          >
            Logout
          </button>
          <p className="text-sm text-gray-600 mt-2">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Create one
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Login;