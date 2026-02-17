import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { auth } from "../firebaseConfig";
import background from "../assets/eventbook.jpg";
import hall1 from "../assets/hall6.png";
import hall2 from "../assets/hall7.png";
import hall3 from "../assets/hall3.png";
import hall4 from "../assets/hall4.png";
import hall5 from "../assets/hall5.png";
import hall7 from "../assets/hall3.png";

const EventBooking = () => {
  const [formData, setFormData] = useState({
    checkIn: "",
    checkOut: "",
    guests: 0,
    selectedHall: null,
  });

  const [halls, setHalls] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const hallNumber = query.get("hallNumber");
  const refreshReviews = query.get("refreshReviews") === "true";
  const [showModal, setShowModal] = useState(false);
  const [selectedHallDetails, setSelectedHallDetails] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  const imageMap = {
    H01: hall1,
    H02: hall2,
    H03: hall3,
    H04: hall4,
    H05: hall5,
    "01": hall1,
    "02": hall2,
    "03": hall3,
    "04": hall4,
    "05": hall5,
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setCurrentUserId(user.uid);
        fetchHalls();
        if (hallNumber && refreshReviews) {
          fetchReviews("hall", hallNumber);
        }
      } else {
        toast.error("Please log in to view halls");
        navigate("/login");
      }
    });
    document.body.style.overflow = showModal ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
      unsubscribe();
    };
  }, [showModal, navigate, hallNumber, refreshReviews]);


  const fetchHalls = async () => {
    setIsLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const response = await axios.get("http://localhost:4000/api/halls/", config);
      if (response.data.success) {
        const mappedHalls = response.data.halls.map((hall) => ({
          number: hall.number,
          rating: 4.7,
          price: `LKR ${hall.price}`,
          capacity: hall.capacity,
          imageUrl: imageMap[hall.number] || hall7,
          description: hall.description || `A spacious hall with modern amenities.`,
          facilities: hall.facilities || ["Wi-Fi", "Projector", "Sound System"],
          status: hall.status || "available",
        }));
        setHalls(mappedHalls);
      } else {
        toast.error(response.data.message || "Failed to fetch halls");
      }
    } catch (error) {
      console.error("fetchHalls - Error:", error.message, error.response?.data);
      toast.error(error.response?.data?.message || "Error fetching halls");
    } finally {
      setIsLoading(false);
    }
  };

const checkHallAvailability = async (hallNumber, checkIn, checkOut) => {
  try {
    const token = await auth.currentUser.getIdToken();
    const response = await axios.post(
      'http://localhost:4000/api/halls/check-availability',
      {
        hallNumber,
        checkIn,
        checkOut,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data.success; // true if available, false if booked
  } catch (error) {
    console.error('checkHallAvailability - Error:', error.message, error.response?.data);
    toast.error(error.response?.data?.message || 'Error checking hall availability');
    return false;
  }
};


  const fetchReviews = async (type, itemId) => {
    setIsLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await axios.get(`http://localhost:4000/api/reviews/${type}/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setReviews(response.data.reviews || []);
      } else {
        console.warn("fetchReviews - Unsuccessful response:", {
          message: response.data.message,
          status: response.status,
        });
        toast.error(response.data.message || "Failed to load reviews");
      }
    } catch (error) {
      console.error("fetchReviews - Error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      toast.error(error.response?.data?.message || "Network error while loading reviews");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditReview = async (review) => {
    navigate(`/addreview?type=hall&itemId=${selectedHallDetails.number}&bookingId=${review.bookingId}&reviewId=${review._id}&edit=true`, {
      state: { review },
    });
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      setIsLoading(true);
      const token = await auth.currentUser.getIdToken();
      const response = await axios.delete(`http://localhost:4000/api/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setReviews((prev) => prev.filter((r) => r._id !== reviewId));
        toast.success("Review deleted successfully");
      } else {
        toast.error(response.data.message || "Failed to delete review");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Network error");
    } finally {
      setIsLoading(false);
    }
  };
const validate = () => {
  let newErrors = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkInDate = new Date(formData.checkIn);
  const checkOutDate = new Date(formData.checkOut);

  // Minimum 3-day restriction
  const minBookingDate = new Date(today);
  minBookingDate.setDate(today.getDate() + 3); // Set to 3 days from today

  if (!formData.checkIn) {
    newErrors.checkIn = "Please select an event date";
  } else if (checkInDate <= today) {
    newErrors.checkIn = "Event date must be in the future";
  } else if (checkInDate < minBookingDate) {
    newErrors.checkIn = "Bookings must be made at least 3 days in advance";
  }

  if (formData.checkOut && checkOutDate <= checkInDate) {
    newErrors.checkOut = "End date must be after event start date";
  }

  if (formData.guests <= 0) {
    newErrors.guests = "Please specify number of guests";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

// Update handleHallSelect to validate availability
const handleHallSelect = async (hall) => {
  const hallStatus = (hall.status || '').toLowerCase();
  if (hallStatus !== 'available') {
    toast.error(`Hall ${hall.number} is ${hallStatus || 'undefined'} and cannot be booked`);
    return;
  }

  // Set the selected hall temporarily to validate
  setFormData((prev) => ({ ...prev, selectedHall: { number: hall.number } }));
  if (await validate()) {
    setSelectedHallDetails(hall);
    setShowModal(true);
    fetchReviews('hall', hall.number);
  } else {
    // Clear selected hall if validation fails
    setFormData((prev) => ({ ...prev, selectedHall: null }));
  }
};

// Update handleBookNow to re-validate before booking
const handleBookNow = async () => {
  if (!selectedHallDetails) {
    toast.error('No hall selected for booking');
    return;
  }
  if (await validate()) {
    navigate('/hallbook', {
      state: {
        ...formData,
        selectedHall: {
          number: selectedHallDetails.number,
          price: selectedHallDetails.price,
          capacity: selectedHallDetails.capacity,
        },
      },
    });
  }
};

  const closeModal = () => {
    setShowModal(false);
    setSelectedHallDetails(null);
    setFormData((prev) => ({ ...prev, selectedHall: null }));
    setReviews([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleGuestChange = (action) => {
    setFormData((prev) => ({
      ...prev,
      guests: action === "increase" ? Math.min(prev.guests + 10, 500) : Math.max(prev.guests - 10, 0),
    }));
    if (errors.guests) {
      setErrors((prev) => ({ ...prev, guests: null }));
    }
  };

  const availableHalls = halls.filter(
    (hall) => hall.capacity >= formData.guests && hall.status.toLowerCase() === "available"
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-repeat p-8 pb-12 overflow-y-auto font-sans"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: "300px 300px",
      }}
    >
      <div className="max-w-7xl mx-auto p-6">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex justify-between items-center mb-10"
        >
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-white">
            Hall Booking
          </h1>
          <Link to="/roombooking">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 4px 15px rgba(79, 70, 229, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-indigo-600 to-teal-500 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              View Room Bookings
            </motion.button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/30 backdrop-blur-lg border border-white/40 rounded-2xl p-8 shadow-xl"
        >
          <h2 className="text-3xl font-semibold text-gray-800 mb-8">
            Choose Your <span className="text-indigo-500">Event Hall</span>
          </h2>

          <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl shadow-md mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="relative"
              >
                <input
                  type="date"
                  name="checkIn"
                  id="checkIn"
                  value={formData.checkIn}
                  onChange={handleInputChange}
                  className="w-full p-4 pt-6 border border-indigo-100 rounded-lg bg-indigo-50/50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm peer text-gray-800"
                  required
                />
                <label
                  htmlFor="checkIn"
                  className="absolute left-4 top-1 text-sm font-medium text-indigo-600 bg-indigo-50/50 px-1 transition-all duration-200 peer-focus:-top-2 peer-focus:text-indigo-700 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500"
                >
                  Event Date
                </label>
                {errors.checkIn && (
                  <span className="text-red-500 text-sm mt-1 block">{errors.checkIn}</span>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="relative"
              >
                <input
                  type="date"
                  name="checkOut"
                  id="checkOut"
                  value={formData.checkOut}
                  onChange={handleInputChange}
                  className="w-full p-4 pt-6 border border-indigo-100 rounded-lg bg-indigo-50/50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm peer text-gray-800"
                />
                <label
                  htmlFor="checkOut"
                  className="absolute left-4 top-1 text-sm font-medium text-indigo-600 bg-indigo-50/50 px-1 transition-all duration-200 peer-focus:-top-2 peer-focus:text-indigo-700 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500"
                >
                  End Date (Optional)
                </label>
                {errors.checkOut && (
                  <span className="text-red-500 text-sm mt-1 block">{errors.checkOut}</span>
                )}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-6"
            >
              <label className="block mb-2 text-sm font-medium text-indigo-600">
                Number of Guests
              </label>
              <div className="flex items-center gap-4 bg-indigo-50/50 p-4 rounded-lg shadow-sm">
                <motion.button
                  whileHover={{ scale: 1.1, backgroundColor: "#4f46e5" }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleGuestChange("decrease")}
                  className="w-10 h-10 flex items-center justify-center bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition-all duration-200 shadow-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                  </svg>
                </motion.button>
                <div className="w-20 text-center">
                  <span className="text-xl font-semibold text-indigo-700">{formData.guests}</span>
                  <p className="text-xs text-gray-500">Guests</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, backgroundColor: "#4f46e5" }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleGuestChange("increase")}
                  className="w-10 h-10 flex items-center justify-center bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition-all duration-200 shadow-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </motion.button>
              </div>
              {errors.guests && (
                <span className="text-red-500 text-sm mt-1 block">{errors.guests}</span>
              )}
            </motion.div>
          </div>

          {isLoading ? (
            <div className="text-center py-10">
              <svg
                className="animate-spin h-10 w-10 text-indigo-500 mx-auto"
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
                  d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                ></path>
              </svg>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableHalls.length > 0 ? (
                availableHalls.map((hall, index) => (
                  <motion.div
                    key={hall.number}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    whileHover={{
                      scale: 1.03,
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                      borderColor: "#818cf8",
                    }}
                    className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent"
                    onClick={() => handleHallSelect(hall)}
                  >
                    <div className="relative overflow-hidden h-56">
                      <img
                        src={hall.imageUrl}
                        alt={`Hall ${hall.number}`}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                        <span className="text-white font-bold text-xl">Hall {hall.number}</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="flex items-center">
                          <span className="text-yellow-400 mr-1">★</span>
                          <span className="font-semibold text-gray-800">{hall.rating}</span>
                        </span>
                        <span className="bg-indigo-100 text-indigo-800 text-sm font-semibold px-2.5 py-0.5 rounded">
                          {hall.capacity} people
                        </span>
                      </div>
                      <span className="block text-indigo-600 font-bold text-lg">{hall.price}</span>
                      <motion.button
                        whileHover={{
                          scale: 1.05,
                          background: "linear-gradient(to right, #4f46e5, #06b6d4)",
                        }}
                        whileTap={{ scale: 0.95 }}
                        className="mt-3 w-full py-2 bg-gradient-to-r from-indigo-500 to-teal-400 text-white rounded-lg transition-all duration-300 shadow-md"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleHallSelect(hall);
                        }}
                      >
                        View Details
                      </motion.button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  className="col-span-full text-center py-10"
                >
                  <div className="inline-block p-4 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full mb-4">
                    <svg
                      className="w-10 h-10 text-pink-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No halls available</h3>
                  <p className="text-gray-500">Try adjusting your guest count or dates</p>
                </motion.div>
              )}
            </div>
          )}

          {hallNumber && reviews.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-8 bg-white/50 backdrop-blur-sm p-6 rounded-xl shadow-md"
            >
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Customer Reviews for Hall {hallNumber}</h3>
              <div className="space-y-6">
                {reviews.map((review, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold">
                          {review.userName.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-semibold text-gray-800">{review.userName}</p>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-lg ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 mb-2">{review.comment}</p>
                        <div className="text-xs text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                        {review.userId === currentUserId && (
                          <div className="mt-2 flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleEditReview(review)}
                              className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm"
                            >
                              Edit
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDeleteReview(review._id)}
                              className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
                            >
                              Delete
                            </motion.button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {showModal && selectedHallDetails && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-4 right-4 p-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-md"
              onClick={closeModal}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </motion.button>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center"
              >
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-teal-500">
                  Hall {selectedHallDetails.number}
                </h2>
                <div className="mt-2 h-1 bg-gradient-to-r from-indigo-200 to-teal-200 rounded-full w-1/4 mx-auto"></div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative overflow-hidden rounded-xl shadow-2xl"
              >
                <img
                  src={selectedHallDetails.imageUrl}
                  alt={`Hall ${selectedHallDetails.number}`}
                  className="w-full h-80 object-cover transform hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <span className="text-white font-bold text-xl">{selectedHallDetails.price}</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="space-y-4"
              >
                <p className="text-gray-600 text-lg">{selectedHallDetails.description}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center p-3 bg-indigo-50 rounded-lg">
                    <div className="p-2 bg-indigo-100 rounded-full mr-3">
                      <svg
                        className="w-5 h-5 text-indigo-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        ></path>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Capacity</p>
                      <p className="font-semibold text-gray-800">
                        {selectedHallDetails.capacity} people
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-teal-50 rounded-lg">
                    <div className="p-2 bg-teal-100 rounded-full mr-3">
                      <svg
                        className="w-5 h-5 text-teal-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Price</p>
                      <p className="font-semibold text-gray-800">{selectedHallDetails.price}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Popular Facilities</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedHallDetails.facilities.map((facility, index) => (
                    <motion.span
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        index % 3 === 0
                          ? "bg-indigo-100 text-indigo-800"
                          : index % 3 === 1
                          ? "bg-purple-100 text-purple-800"
                          : "bg-teal-100 text-teal-800"
                      }`}
                    >
                      {facility}
                    </motion.span>
                  ))}
                </div>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                animate={{
                  boxShadow: [
                    "0 4px 14px 0 rgba(79, 70, 229, 0.3)",
                    "0 4px 14px 0 rgba(79, 70, 229, 0.4)",
                    "0 4px 14px 0 rgba(79, 70, 229, 0.3)",
                  ],
                }}
                transition={{
                  scale: { duration: 0.2 },
                  boxShadow: { repeat: Infinity, duration: 2 },
                }}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-teal-500 text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg"
                onClick={handleBookNow}
              >
                <span className="flex items-center justify-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    ></path>
                  </svg>
                  Book Now
                </span>
              </motion.button>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="border-t border-gray-200 pt-8 mt-8"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Customer Reviews</h3>
                {isLoading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-center items-center py-10"
                  >
                    <svg
                      className="animate-spin h-10 w-10 text-indigo-500"
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
                        d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                      ></path>
                    </svg>
                  </motion.div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 * index }}
                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mr-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold">
                              {review.userName.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <p className="font-semibold text-gray-800">{review.userName}</p>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <span
                                    key={i}
                                    className={`text-lg ${
                                      i < review.rating ? "text-yellow-400" : "text-gray-300"
                                    }`}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-600 mb-2">{review.comment}</p>
                            <div className="text-xs text-gray-400">
                              {new Date(review.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </div>
                            {review.userId === currentUserId && (
                              <div className="mt-2 flex gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleEditReview(review)}
                                  className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm"
                                >
                                  Edit
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleDeleteReview(review._id)}
                                  className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
                                >
                                  Delete
                                </motion.button>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8"
                  >
                    <div className="inline-block p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full mb-4">
                      <svg
                        className="w-10 h-10 text-indigo-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        ></path>
                      </svg>
                    </div>
                    <h4 className="text-lg font-medium text-gray-700 mb-1">No reviews yet</h4>
                    <p className="text-gray-500">Be the first to share your experience!</p>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default EventBooking;