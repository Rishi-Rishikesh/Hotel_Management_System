import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, Shield, Trash2, Upload } from "lucide-react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:4000";

function StaffManagement() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editStaff, setEditStaff] = useState(null);
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    phoneNumber: "",
    gender: "",
    status: "Active",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [cloudinaryConfig, setCloudinaryConfig] = useState(null);

  // Fetch staff
  const fetchStaff = async (token) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error("No user logged in. Please log in.");
      }
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
        params: { limit: 1000 },
      };

      const staffResponse = await axios.get(`${API_URL}/api/guests?role=Staff`, config);
      setStaff(staffResponse.data.retdata);

      const cloudinaryResponse = await axios.get(`${API_URL}/api/guests/cloudinary-config`, config);
      setCloudinaryConfig(cloudinaryResponse.data);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching staff:", err);
      const errorMessage =
        err.response?.status === 401
          ? "Unauthorized. Please log in again."
          : err.response?.data?.message || err.message || "Failed to fetch staff.";
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && staff.length === 0) {
        const token = await user.getIdToken();
        await fetchStaff(token);
      } else if (!user) {
        setError("Please log in to access this page");
        toast.error("Please log in to access this page");
        navigate("/login");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate, staff.length]);

  // Start editing staff
  const startEditStaff = (staffMember) => {
    setEditStaff(staffMember._id);
    setFormData({
      fname: staffMember.fname || "",
      lname: staffMember.lname || "",
      phoneNumber: staffMember.phoneNumber || "",
      gender: staffMember.gender || "",
      status: staffMember.status || "Active",
    });
    setProfileImage(null);
  };

  // Update staff details
  const updateStaff = async (staffId) => {
    try {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();
      await axios.put(
        `${API_URL}/api/guests/update`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
          params: { email: staff.find((s) => s._id === staffId).email },
        }
      );
      setStaff(staff.map((s) => (s._id === staffId ? { ...s, ...formData } : s)));
      setEditStaff(null);
      toast.success("Staff details updated successfully");
    } catch (err) {
      console.error("Error updating staff:", err);
      toast.error(err.response?.data?.message || "Failed to update staff");
    }
  };

  // Delete staff
  const deleteStaff = async (staffId, email) => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) return;
    try {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();
      await axios.delete(`${API_URL}/api/guests/delete`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
        data: { email, reason: "Admin deletion" },
      });
      setStaff(staff.filter((s) => s._id !== staffId));
      toast.success("Staff account deleted successfully");
    } catch (err) {
      console.error("Error deleting staff:", err);
      toast.error(err.response?.data?.message || "Failed to delete staff");
    }
  };

  // Upload profile image
  const uploadProfileImage = async (staffId) => {
    if (!profileImage) {
      toast.error("Please select an image to upload");
      return;
    }
    try {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();
      const formData = new FormData();
      formData.append("profileImage", profileImage);
      formData.append("staffId", staffId);
      const response = await axios.post(
        `${API_URL}/api/guests/staff/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      setStaff(staff.map((s) => (s._id === staffId ? { ...s, profileImage: response.data.profileImage } : s)));
      setProfileImage(null);
      toast.success("Profile image uploaded successfully");
    } catch (err) {
      console.error("Error uploading profile image:", err);
      toast.error(err.response?.data?.message || "Failed to upload profile image");
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-gray-100"
      >
        <div className="flex items-center gap-3 text-blue-600">
          <Loader2 className="animate-spin text-3xl" />
          <span className="text-lg font-semibold">Loading staff...</span>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-gray-100"
      >
        <div className="text-center text-red-600">
          <AlertCircle className="mx-auto mb-2" size={48} />
          <p className="text-lg font-semibold">{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Log In
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-100"
    >
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Staff Management</h1>

        <div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Staff</h2>
          {staff.length === 0 ? (
            <p className="text-gray-600">No staff found.</p>
          ) : (
            <div className="grid gap-6">
              {staff.map((staffMember) => (
                <div key={staffMember._id} className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                  {editStaff === staffMember._id ? (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Edit Staff: {staffMember.email}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">First Name</label>
                          <input
                            type="text"
                            value={formData.fname}
                            onChange={(e) => setFormData({ ...formData, fname: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Last Name</label>
                          <input
                            type="text"
                            value={formData.lname}
                            onChange={(e) => setFormData({ ...formData, lname: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                          <input
                            type="text"
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Gender</label>
                          <select
                            value={formData.gender}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Status</label>
                          <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          >
                            <option value="Active">Active</option>
                            <option value="Non-Active">Non-Active</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Profile Image</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setProfileImage(e.target.files[0])}
                          className="mt-1 block w-full"
                        />
                      </div>
                      <div className="flex gap-4">
                        <button
                          onClick={() => updateStaff(staffMember._id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Save
                        </button>
                        {profileImage && (
                          <button
                            onClick={() => uploadProfileImage(staffMember._id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                          >
                            <Upload size={16} />
                            Upload Image
                          </button>
                        )}
                        <button
                          onClick={() => setEditStaff(null)}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-6">
                      <img
                        src={staffMember.profileImage || "https://via.placeholder.com/100"}
                        alt="Profile"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">
                          {staffMember.fname} {staffMember.lname}
                        </h3>
                        <p className="text-gray-600">{staffMember.email}</p>
                        <p className="text-gray-600">Phone: {staffMember.phoneNumber || "N/A"}</p>
                        <p className="text-gray-600">Gender: {staffMember.gender || "N/A"}</p>
                        <p className="text-gray-600">Status: {staffMember.status}</p>
                      </div>
                      <div className="flex gap-4">
                        <button
                          onClick={() => startEditStaff(staffMember)}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                          <Shield size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => deleteStaff(staffMember._id, staffMember.email)}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default StaffManagement;