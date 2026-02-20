import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, PlusCircle } from "lucide-react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import debounce from "lodash.debounce";

const API_URL = "http://localhost:4000";
const defaultTaskTypes = ["cleaning", "maintenance", "inspection", "restocking"];

function TaskManagement() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [staff, setStaff] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    roomId: "",
    description: "",
    taskType: "",
    scheduledDate: "",
    assignedTo: "",
    frequency: "",
    occurrences: 1,
    bookingId: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const fetchTasks = useCallback(
    debounce(async (token, retries = 2) => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const response = await axios.get(`${API_URL}/api/tasks/all`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.data.success) {
            setTasks(response.data.tasks || []);
            setError("");
            break;
          } else {
            throw new Error(response.data.message || "Failed to fetch tasks");
          }
        } catch (error) {
          const status = error.response?.status;
          if (status === 429 && attempt < retries) {
            await new Promise((resolve) => setTimeout(resolve, 5000));
            continue;
          }
          const message =
            status === 401
              ? "Unauthorized. Please log in again."
              : status === 403
              ? "Access denied. Admin role required."
              : status === 429
              ? "Too many requests. Please try again later."
              : status === 500
              ? "Server error. Please check the backend logs."
              : error.response?.data?.message || "Error fetching tasks";
          setError(message);
          toast.error(message);
          console.error("Fetch tasks error:", error);
          break;
        }
      }
    }, 1500),
    []
  );

  const fetchStaff = useCallback(
    debounce(async (token, retries = 2) => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const response = await axios.get(`${API_URL}/api/users/staff`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.data.success) {
            setStaff(response.data.staff || []);
            setError("");
            break;
          } else {
            throw new Error(response.data.message || "Failed to fetch staff");
          }
        } catch (error) {
          const status = error.response?.status;
          if (status === 429 && attempt < retries) {
            await new Promise((resolve) => setTimeout(resolve, 5000));
            continue;
          }
          const message =
            status === 401
              ? "Unauthorized. Please log in again."
              : status === 403
              ? "Access denied. Admin role required."
              : status === 429
              ? "Too many requests. Please try again later."
              : status === 500
              ? "Server error. Please check the backend logs."
              : error.response?.data?.message || "Error fetching staff";
          setError(message);
          toast.error(message);
          console.error("Fetch staff error:", error);
          break;
        }
      }
    }, 1500),
    []
  );

  const fetchRooms = useCallback(
    debounce(async (token, retries = 2) => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const response = await axios.get(`${API_URL}/api/rooms`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.data.success) {
            setRooms(response.data.rooms || []);
            setError("");
            break;
          } else {
            throw new Error(response.data.message || "Failed to fetch rooms");
          }
        } catch (error) {
          const status = error.response?.status;
          if (status === 429 && attempt < retries) {
            await new Promise((resolve) => setTimeout(resolve, 5000));
            continue;
          }
          const message =
            status === 401
              ? "Unauthorized. Please log in again."
              : status === 403
              ? "Access denied. Admin role required."
              : status === 429
              ? "Too many requests. Please try again later."
              : status === 500
              ? "Server error. Please check the backend logs."
              : error.response?.data?.message || "Error fetching rooms";
          setError(message);
          toast.error(message);
          console.error("Fetch rooms error:", error);
          break;
        }
      }
    }, 1500),
    []
  );

  const fetchConfig = useCallback(
    debounce(async (token, retries = 2) => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const response = await axios.get(`${API_URL}/api/config`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.data.success) {
            console.log("Config fetched:", response.data.config);
            setConfig(response.data.config || {});
            setError("");
            break;
          } else {
            throw new Error(response.data.message || "Failed to fetch config");
          }
        } catch (error) {
          const status = error.response?.status;
          if (status === 429 && attempt < retries) {
            await new Promise((resolve) => setTimeout(resolve, 5000));
            continue;
          }
          const message =
            status === 401
              ? "Unauthorized. Please log in again."
              : status === 403
              ? "Access denied. Admin role required."
              : status === 429
              ? "Too many requests. Please try again later."
              : status === 500
              ? "Server error. Please check the backend logs."
              : error.response?.data?.message || "Error fetching config";
          setError(message);
          toast.error(message);
          console.error("Fetch config error:", error);
          break;
        }
      }
    }, 1500),
    []
  );

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(true);
      if (currentUser) {
        currentUser.getIdToken().then(async (token) => {
          await fetchTasks(token);
          await fetchStaff(token);
          await fetchRooms(token);
          await fetchConfig(token);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
        setError("Please log in to access task management.");
        navigate("/login");
      }
    });
    const interval = setInterval(() => {
      if (user) {
        user.getIdToken().then((token) => fetchTasks(token));
      }
    }, 60000);
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [navigate, fetchTasks, fetchStaff, fetchRooms, fetchConfig, user]);

  const validateForm = () => {
    const errors = {};
    if (!formData.roomId) errors.roomId = "Room is required";
    if (!formData.description) errors.description = "Description is required";
    if (!formData.taskType) errors.taskType = "Task type is required";
    if (!formData.scheduledDate) errors.scheduledDate = "Scheduled date is required";
    if (formData.frequency && !formData.occurrences) errors.occurrences = "Occurrences are required for recurring tasks";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill all required fields");
      return;
    }
    setIsLoading(true);
    try {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();
      const response = await axios.post(
        `${API_URL}/api/tasks/schedule`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast.success("Task scheduled successfully");
        setShowModal(false);
        setFormData({
          roomId: "",
          description: "",
          taskType: "",
          scheduledDate: "",
          assignedTo: "",
          frequency: "",
          occurrences: 1,
          bookingId: "",
        });
        fetchTasks(token);
      } else {
        throw new Error(response.data.message || "Failed to schedule task");
      }
    } catch (error) {
      const message =
        error.response?.status === 429
          ? "Too many requests. Please try again later."
          : error.response?.data?.message || "Error scheduling task";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const assignTask = async (taskId, assignedTo) => {
    setIsLoading(true);
    try {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();
      const response = await axios.put(
        `${API_URL}/api/tasks/${taskId}/assign`,
        { assignedTo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast.success("Task assigned successfully");
        fetchTasks(token);
      } else {
        throw new Error(response.data.message || "Failed to assign task");
      }
    } catch (error) {
      const message =
        error.response?.status === 429
          ? "Too many requests. Please try again later."
          : error.response?.data?.message || "Error assigning task";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-gray-100"
      >
        <div className="flex items-center gap-3 text-blue-600">
          <Loader2 className="animate-spin text-3xl" />
          <span className="text-lg font-semibold">Loading...</span>
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

  const taskTypes = config?.taskTypes?.length > 0 ? config.taskTypes : defaultTaskTypes;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-100"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Task Management</h1>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Schedule New Task
          </button>
        </div>

        {tasks.length === 0 ? (
          <p className="text-gray-600 text-center">No tasks available.</p>
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
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
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
                      {task.assignedTo || "Unassigned"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {!task.assignedTo && (
                        <select
                          onChange={(e) => assignTask(task._id, e.target.value)}
                          className="px-2 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Staff</option>
                          {staff.map((s) => (
                            <option key={s.email} value={s.email}>
                              {s.email}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md"
            >
              <h2 className="text-xl font-bold mb-4">Schedule Task</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Room</label>
                  <select
                    name="roomId"
                    value={formData.roomId}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full border rounded-md p-2 ${
                      formErrors.roomId ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Room</option>
                    {rooms.map((room) => (
                      <option key={room.roomNumber} value={room.roomNumber}>
                        {room.roomNumber}
                      </option>
                    ))}
                  </select>
                  {formErrors.roomId && <p className="text-red-500 text-xs mt-1">{formErrors.roomId}</p>}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full border rounded-md p-2 ${
                      formErrors.description ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {formErrors.description && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Task Type</label>
                  <select
                    name="taskType"
                    value={formData.taskType}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full border rounded-md p-2 ${
                      formErrors.taskType ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Task Type</option>
                    {taskTypes.length === 0 ? (
                      <option disabled>No task types available</option>
                    ) : (
                      taskTypes.map((type) => (
                        <option key={type} value={type}>
                          {type.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                        </option>
                      ))
                    )}
                  </select>
                  {formErrors.taskType && <p className="text-red-500 text-xs mt-1">{formErrors.taskType}</p>}
                  {taskTypes === defaultTaskTypes && (
                    <p className="text-yellow-600 text-xs mt-1">
                      Using default task types (config not loaded).
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Scheduled Date</label>
                  <input
                    type="datetime-local"
                    name="scheduledDate"
                    value={formData.scheduledDate}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full border rounded-md p-2 ${
                      formErrors.scheduledDate ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {formErrors.scheduledDate && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.scheduledDate}</p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Assign To (Optional)</label>
                  <select
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value="">Auto-assign</option>
                    {staff.map((s) => (
                      <option key={s.email} value={s.email}>
                        {s.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Frequency (Optional)</label>
                  <select
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value="">One-time</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                {formData.frequency && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Occurrences</label>
                    <input
                      type="number"
                      name="occurrences"
                      value={formData.occurrences}
                      onChange={handleInputChange}
                      min="1"
                      className={`mt-1 block w-full border rounded-md p-2 ${
                        formErrors.occurrences ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {formErrors.occurrences && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.occurrences}</p>
                    )}
                  </div>
                )}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Booking ID (Optional)</label>
                  <input
                    type="text"
                    name="bookingId"
                    value={formData.bookingId}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                  >
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin inline" /> : "Schedule"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default TaskManagement;