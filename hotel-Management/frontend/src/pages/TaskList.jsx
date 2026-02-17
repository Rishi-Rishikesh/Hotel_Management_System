import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { getAuth } from "firebase/auth";

const API_URL = "http://localhost:4000";

function TaskList() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTasks = useCallback(
    async (pageNum = 1, retries = 2) => {
      setLoading(true);
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const auth = getAuth();
          const user = auth.currentUser;
          if (!user) {
            throw new Error("No user logged in. Please log in.");
          }
          const token = await user.getIdToken();
          const config = {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
            params: { page: pageNum, limit: 10 },
          };

          const response = await axios.get(`${API_URL}/api/tasks`, config);
          setTasks(response.data.tasks || []);
          setTotalPages(response.data.totalPages || 1);
          setPage(response.data.currentPage || 1);
          setError(null);
          break;
        } catch (err) {
          console.error("Error fetching tasks:", err);
          const status = err.response?.status;
          const message =
            status === 404
              ? "Tasks endpoint not found. Please check the backend."
              : status === 401
              ? "Unauthorized. Please log in again."
              : status === 403
              ? "Access denied. Staff role required."
              : status === 429
              ? "Too many requests. Please try again later."
              : err.response?.data?.message || err.message || "Failed to fetch tasks.";
          if (attempt === retries) {
            setError(message);
            toast.error(message);
          } else {
            await new Promise((resolve) => setTimeout(resolve, 5000 * attempt));
          }
        }
      }
      setLoading(false);
    },
    []
  );

  const markTaskComplete = async (taskId) => {
    setActionLoading((prev) => ({ ...prev, [taskId]: true }));
    try {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();
      const response = await axios.put(
        `${API_URL}/api/tasks/${taskId}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast.success("Task marked as complete");
        fetchTasks(page);
      } else {
        toast.error(response.data.message || "Failed to mark task complete");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error marking task complete");
    } finally {
      setActionLoading((prev) => ({ ...prev, [taskId]: false }));
    }
  };

  useEffect(() => {
    fetchTasks(page);
    const interval = setInterval(() => fetchTasks(page), 30000);
    return () => clearInterval(interval);
  }, [page, fetchTasks]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      setLoading(true);
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
          <span className="text-lg font-semibold">Loading tasks...</span>
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
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <h1 className="text-3xl font-bold text-gray-800 mb-8">My Scheduled Tasks</h1>
        {tasks.length === 0 ? (
          <p className="text-gray-600 text-center">No tasks assigned to you.</p>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scheduled Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tasks.map((task) => (
                  <tr key={task._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.roomId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {task.taskType.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          task.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(task.scheduledDate).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {task.bookingId ? (
                        <div>
                          <p>Check-In: {new Date(task.bookingId.checkInDate).toLocaleDateString()}</p>
                          <p>Check-Out: {new Date(task.bookingId.checkOutDate).toLocaleDateString()}</p>
                          <p>Room: {task.bookingId.roomNumber}</p>
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {task.status === "pending" ? (
                        <button
                          onClick={() => markTaskComplete(task._id)}
                          disabled={actionLoading[task._id]}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed"
                        >
                          {actionLoading[task._id] ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-1" />
                          )}
                          Mark Complete
                        </button>
                      ) : (
                        <span className="text-green-600 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Completed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default TaskList;