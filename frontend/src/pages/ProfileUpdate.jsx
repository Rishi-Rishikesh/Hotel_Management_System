import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import axios from "axios";
import { FaTrash, FaUserCircle, FaSpinner } from "react-icons/fa";
import image from "../assets/profile.jpg";

const defaultAvatar = image;
const API_URL = "http://localhost:4000";

// Axios interceptor for handling 401 errors globally
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      toast.error("Session expired. Please log in again.");
    }
    return Promise.reject(error);
  }
);

function ProfileUpdate() {
  const navigate = useNavigate();
  const location = useLocation();
  const [cookies, setCookie] = useCookies(["user"]);
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    address: "",
    nic: "",
    phonenum: "",
    gender: "",
    profileImage: defaultAvatar,
    email: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cloudinaryWidget, setCloudinaryWidget] = useState(null);
  const [cloudinaryConfig, setCloudinaryConfig] = useState({});
  const [isCloudinaryReady, setIsCloudinaryReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Regex for form validation
  const nameRegex = /^[A-Za-z]{2,50}$/;
  const phoneRegex = /^\+94[1-9][0-9]{8}$/;
  const nicRegex = /^[A-Za-z0-9]{8,12}$/;

  // Fetch user profile on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found, redirecting to login");
      toast.error("Please log in to access your profile.");
      navigate("/login");
      setIsLoading(false);
      return;
    }

    if (location.state?.user) {
      const { user } = location.state;
      setFormData({
        fname: user.fname || "",
        lname: user.lname || "",
        address: user.address || "",
        nic: user.nic || "",
        phonenum: user.phoneNumber || "",
        gender: user.gender || "",
        profileImage: user.profileImage || defaultAvatar,
        email: user.email || "",
      });
      setIsLoading(false);
      return;
    }

    const userData = cookies.user || JSON.parse(localStorage.getItem("user"));
    const email = userData?.email;

    console.log("Cookies at mount:", cookies);

    if (!email) {
      console.log("No email found, redirecting to login");
      toast.error("Please log in to access your profile.");
      navigate("/login");
      setIsLoading(false);
      return;
    }

    console.log("Fetching profile with email:", email);
    axios
      .get(`${API_URL}/api/guests/me`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      })
      .then((response) => {
        console.log("Profile fetch response:", response.data);
        if (response.data.success) {
          const user = response.data.user;
          setFormData({
            fname: user.fname || "",
            lname: user.lname || "",
            address: user.address || "",
            nic: user.nic || "",
            phonenum: user.phoneNumber || "",
            gender: user.gender || "",
            profileImage: user.profileImage || defaultAvatar,
            email: user.email || "",
          });
          setIsLoading(false);
        } else {
          throw new Error(response.data.message || "Failed to fetch profile");
        }
      })
      .catch((error) => {
        console.error("Error fetching profile:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setCookie("user", "", { path: "/", maxAge: 0 });
          navigate("/login");
        } else {
          toast.error(error.response?.data?.message || "Failed to load profile data.");
          setIsLoading(false);
        }
      });
  }, [cookies.user, navigate, location.state, setCookie]);

  // Fetch Cloudinary configuration
  useEffect(() => {
    axios
      .get(`${API_URL}/api/guests/cloudinary-config`)
      .then((response) => {
        console.log("Cloudinary config fetched:", response.data);
        setCloudinaryConfig(response.data);
      })
      .catch((error) => {
        console.error("Error fetching Cloudinary config:", error);
        toast.error("Failed to load Cloudinary uploader.");
      });
  }, []);

  // Initialize Cloudinary widget
  useEffect(() => {
    if (cloudinaryConfig.cloudName && cloudinaryConfig.uploadPreset) {
      const script = document.createElement("script");
      script.src = "https://widget.cloudinary.com/v2.0/global/all.js";
      script.async = true;
      script.onload = () => {
        const widget = window.cloudinary.createUploadWidget(
          {
            cloudName: cloudinaryConfig.cloudName,
            uploadPreset: cloudinaryConfig.uploadPreset,
            sources: ["local", "url", "camera"],
            multiple: false,
            resourceType: "image",
            clientAllowedFormats: ["jpg", "png", "jpeg"],
            maxFileSize: 5000000,
          },
          (error, result) => {
            if (!error && result?.event === "success") {
              setFormData((prev) => ({
                ...prev,
                profileImage: result.info.secure_url,
              }));
              toast.success("Image uploaded successfully!");
            } else if (error) {
              toast.error("Image upload failed.");
            }
          }
        );
        setCloudinaryWidget(widget);
        setIsCloudinaryReady(true);
      };
      script.onerror = () => {
        toast.error("Failed to load Cloudinary widget.");
        setIsCloudinaryReady(false);
      };
      document.body.appendChild(script);
      return () => document.body.removeChild(script);
    }
  }, [cloudinaryConfig]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Clear form field
  const handleClearField = (field) => {
    setFormData((prev) => ({ ...prev, [field]: "" }));
    setFormErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // Handle image upload
  const handleImageUpload = () => {
    if (cloudinaryWidget && isCloudinaryReady) {
      cloudinaryWidget.open();
    } else {
      toast.error("Image uploader not ready.");
    }
  };

  // Handle image removal
  const handleRemoveImage = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to perform this action.");
      navigate("/login");
      return;
    }
    axios
      .put(
        `${API_URL}/api/guests/deleteprofileimage`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      )
      .then((res) => {
        if (res.data.success) {
          setFormData((prev) => ({ ...prev, profileImage: defaultAvatar }));
          toast.success("Profile image removed successfully.");
        } else {
          throw new Error("Failed to remove image.");
        }
      })
      .catch((error) => {
        console.error("Error removing image:", error);
        toast.error("Failed to remove image.");
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setCookie("user", "", { path: "/", maxAge: 0 });
          navigate("/login");
        }
      });
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};
    if (!formData.fname || !nameRegex.test(formData.fname)) {
      errors.fname = "First name must be 2-50 letters.";
    }
    if (!formData.lname || !nameRegex.test(formData.lname)) {
      errors.lname = "Last name must be 2-50 letters.";
    }
    if (!formData.address) errors.address = "Address is required.";
    if (!formData.nic || !nicRegex.test(formData.nic)) {
      errors.nic = "NIC must be 8-12 alphanumeric characters.";
    }
    if (!formData.phonenum || !phoneRegex.test(formData.phonenum)) {
      errors.phonenum = "Phone must start with +94 and have 9 digits.";
    }
    if (!formData.gender) errors.gender = "Gender is required.";
    return errors;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsSubmitting(false);
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to perform this action.");
      navigate("/login");
      setIsSubmitting(false);
      return;
    }
    console.log("Cookies before update request:", cookies);
    axios
      .put(
        `${API_URL}/api/guests/update`,
        {
          fname: formData.fname,
          lname: formData.lname,
          address: formData.address,
          nic: formData.nic,
          phonenum: formData.phonenum,
          gender: formData.gender,
          profileImage: formData.profileImage === defaultAvatar ? "" : formData.profileImage,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      )
      .then((res) => {
        if (res.data.success) {
          toast.success("Profile updated successfully!");
          setCookie(
            "user",
            { ...cookies.user, ...formData, role: cookies.user?.role },
            {
              path: "/",
              maxAge: 86400,
              secure: process.env.NODE_ENV === "production",
              sameSite: "Lax",
            }
          );
          navigate("/guestdashboard", { state: { profileUpdated: true } });
        } else {
          throw new Error("Profile update failed.");
        }
      })
      .catch((err) => {
        console.error("Update error:", err);
        toast.error(err.response?.data?.message || "Profile update failed.");
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setCookie("user", "", { path: "/", maxAge: 0 });
          navigate("/login");
        }
      })
      .finally(() => setIsSubmitting(false));
  };

  // Loading state UI
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center"
      >
        <div className="flex items-center gap-3 text-indigo-600">
          <FaSpinner className="animate-spin text-3xl" />
          <span className="text-lg font-semibold">Loading profile...</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl w-full"
      >
        <h1 className="text-3xl font-bold text-indigo-900 mb-8 text-center">
          Update Your Profile
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-24 h-24 mb-4">
              <img
                src={formData.profileImage}
                alt="Profile"
                className="w-full h-full rounded-full border-4 border-indigo-100 object-cover"
                onError={(e) => (e.target.src = defaultAvatar)}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-full opacity-0 hover:opacity-100 transition-opacity">
                <FaUserCircle className="text-white text-2xl" />
              </div>
            </div>
            <div className="flex gap-3">
              <motion.button
                type="button"
                onClick={handleImageUpload}
                className={`flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors ${
                  !isCloudinaryReady ? "opacity-50 cursor-not-allowed" : ""
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!isCloudinaryReady}
              >
                <FaUserCircle /> Upload Image
              </motion.button>
              {formData.profileImage !== defaultAvatar && (
                <motion.button
                  type="button"
                  onClick={handleRemoveImage}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaTrash /> Remove Image
                </motion.button>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div className="relative">
              <label
                htmlFor="fname"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                First Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="fname"
                  name="fname"
                  value={formData.fname}
                  onChange={handleInputChange}
                  className={`w-full p-3 border ${
                    formErrors.fname ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all`}
                  placeholder="Enter your first name"
                />
                {formData.fname && (
                  <motion.button
                    type="button"
                    onClick={() => handleClearField("fname")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500"
                    whileHover={{ scale: 1.1 }}
                  >
                    <FaTrash size={16} />
                  </motion.button>
                )}
              </div>
              {formErrors.fname && (
                <p className="text-red-500 text-xs mt-1">{formErrors.fname}</p>
              )}
            </div>

            {/* Last Name */}
            <div className="relative">
              <label
                htmlFor="lname"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Last Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="lname"
                  name="lname"
                  value={formData.lname}
                  onChange={handleInputChange}
                  className={`w-full p-3 border ${
                    formErrors.lname ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all`}
                  placeholder="Enter your last name"
                />
                {formData.lname && (
                  <motion.button
                    type="button"
                    onClick={() => handleClearField("lname")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500"
                    whileHover={{ scale: 1.1 }}
                  >
                    <FaTrash size={16} />
                  </motion.button>
                )}
              </div>
              {formErrors.lname && (
                <p className="text-red-500 text-xs mt-1">{formErrors.lname}</p>
              )}
            </div>

            {/* NIC */}
            <div className="relative">
              <label
                htmlFor="nic"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                NIC
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="nic"
                  name="nic"
                  value={formData.nic}
                  onChange={handleInputChange}
                  className={`w-full p-3 border ${
                    formErrors.nic ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all`}
                  placeholder="Enter your NIC"
                />
                {formData.nic && (
                  <motion.button
                    type="button"
                    onClick={() => handleClearField("nic")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500"
                    whileHover={{ scale: 1.1 }}
                  >
                    <FaTrash size={16} />
                  </motion.button>
                )}
              </div>
              {formErrors.nic && (
                <p className="text-red-500 text-xs mt-1">{formErrors.nic}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="relative">
              <label
                htmlFor="phonenum"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="phonenum"
                  name="phonenum"
                  value={formData.phonenum}
                  onChange={handleInputChange}
                  className={`w-full p-3 border ${
                    formErrors.phonenum ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all`}
                  placeholder="+94xxxxxxxxx"
                />
                {formData.phonenum && (
                  <motion.button
                    type="button"
                    onClick={() => handleClearField("phonenum")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500"
                    whileHover={{ scale: 1.1 }}
                  >
                    <FaTrash size={16} />
                  </motion.button>
                )}
              </div>
              {formErrors.phonenum && (
                <p className="text-red-500 text-xs mt-1">{formErrors.phonenum}</p>
              )}
            </div>

            {/* Gender */}
            <div className="relative">
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Gender
              </label>
              <div className="relative">
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className={`w-full p-3 border ${
                    formErrors.gender ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all appearance-none bg-white`}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer Not to Say">Prefer Not to Say</option>
                </select>
                {formData.gender && (
                  <motion.button
                    type="button"
                    onClick={() => handleClearField("gender")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500"
                    whileHover={{ scale: 1.1 }}
                  >
                    <FaTrash size={16} />
                  </motion.button>
                )}
              </div>
              {formErrors.gender && (
                <p className="text-red-500 text-xs mt-1">{formErrors.gender}</p>
              )}
            </div>

            {/* Address */}
            <div className="relative md:col-span-2">
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Address
              </label>
              <div className="relative">
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`w-full p-3 border ${
                    formErrors.address ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none`}
                  rows="4"
                  placeholder="Enter your address"
                />
                {formData.address && (
                  <motion.button
                    type="button"
                    onClick={() => handleClearField("address")}
                    className="absolute right-3 top-3 text-gray-400 hover:text-red-500"
                    whileHover={{ scale: 1.1 }}
                  >
                    <FaTrash size={16} />
                  </motion.button>
                )}
              </div>
              {formErrors.address && (
                <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 mt-8">
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Profile"
              )}
            </motion.button>
            <motion.button
              type="button"
              onClick={() => navigate("/guestdashboard")}
              className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default ProfileUpdate;