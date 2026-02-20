import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Loader2, AlertCircle } from "lucide-react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:4000";

function GuestManagement() {
  const navigate = useNavigate();
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch guests
  const fetchGuests = async (token) => {
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

      const guestResponse = await axios.get(`${API_URL}/api/guests?role=User`, config);
      setGuests(guestResponse.data.retdata);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching guests:", err);
      const errorMessage =
        err.response?.status === 401
          ? "Unauthorized. Please log in again."
          : err.response?.data?.message || err.message || "Failed to fetch guests.";
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && guests.length === 0) {
        const token = await user.getIdToken();
        await fetchGuests(token);
      } else if (!user) {
        setError("Please log in to access this page");
        toast.error("Please log in to access this page");
        navigate("/login");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate, guests.length]);

  // Toggle guest status
  const toggleGuestStatus = async (guestId, currentStatus) => {
    try {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();
      const newStatus = currentStatus === "Active" ? "Non-Active" : "Active";
      await axios.put(
        `${API_URL}/api/guests/update`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
          params: { email: guests.find((g) => g._id === guestId).email },
        }
      );
      setGuests(guests.map((g) => (g._id === guestId ? { ...g, status: newStatus } : g)));
      toast.success(`Guest status updated to ${newStatus}`);
    } catch (err) {
      console.error("Error updating guest status:", err);
      toast.error(err.response?.data?.message || "Failed to update guest status");
    }
  };

  // Change guest to staff and deactivate
  const makeStaffAndDeactivate = async (guestId) => {
    if (!window.confirm("Are you sure you want to change this guest to Staff and deactivate their account?")) return;
    try {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();
      const guest = guests.find((g) => g._id === guestId);
      console.log(`Attempting to update ${guest.email} to role: Staff, status: Non-Active`);
      const response = await axios.put(
        `${API_URL}/api/guests/update`,
        { role: "Staff", status: "Non-Active" },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
          params: { email: guest.email },
        }
      );
      console.log("Update response:", response.data);
      // Remove the guest from the list since they are no longer a "User"
      setGuests(guests.filter((g) => g._id !== guestId));
      toast.success(`Guest ${guest.email} changed to Staff and deactivated`);
    } catch (err) {
      console.error("Error changing guest to staff:", err);
      console.error("Error details:", err.response?.data);
      toast.error(err.response?.data?.message || "Failed to change guest to staff");
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
          <span className="text-lg font-semibold">Loading guests...</span>
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
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Guest Management</h1>

        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Guests</h2>
          {guests.length === 0 ? (
            <p className="text-gray-600">No guests found.</p>
          ) : (
            <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {guests.map((guest) => (
                    <tr key={guest._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {guest.fname} {guest.lname}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{guest.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{guest.status}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-2">
                        <button
                          onClick={() => toggleGuestStatus(guest._id, guest.status)}
                          className={`px-3 py-1 rounded-lg text-white ${
                            guest.status === "Active" ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                          }`}
                        >
                          {guest.status === "Active" ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => makeStaffAndDeactivate(guest._id)}
                          className="px-3 py-1 rounded-lg text-white bg-blue-500 hover:bg-blue-600"
                        >
                          Make Staff & Deactivate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default GuestManagement;[]