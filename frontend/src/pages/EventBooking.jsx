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
      className="min-h-screen relative p-8 pb-12 overflow-y-auto font-sans bg-slate-950"
    >
      <div 
        className="fixed inset-0 z-0 opacity-40 bg-cover bg-center"
        style={{ backgroundImage: `url(${background})` }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-slate-950/80 via-slate-900/60 to-slate-950/90 backdrop-blur-[2px]" />

      <div className="max-w-7xl mx-auto p-6 relative z-10">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-100 to-amber-300 drop-shadow-sm">
            Reserve Event Hall
          </h1>
          <Link to="/roombooking">
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(251, 191, 36, 0.3)' }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 rounded-full text-amber-100 font-medium tracking-wide border border-amber-500/30 bg-amber-500/10 backdrop-blur-md hover:bg-amber-500/20 transition-all duration-300 shadow-lg"
            >
              Explore Hotel Suites
            </motion.button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl ring-1 ring-white/5"
        >
          <h2 className="text-2xl md:text-3xl font-light text-gray-200 mb-8 tracking-wide">
            Select Your <span className="text-amber-400 font-semibold">Event Venue</span>
          </h2>

          <div className="bg-slate-800/40 p-6 md:p-8 rounded-2xl border border-white/5 shadow-inner mb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="relative group"
              >
                <input
                  type="date"
                  name="checkIn"
                  id="checkIn"
                  value={formData.checkIn}
                  onChange={handleInputChange}
                  className="w-full p-4 pt-6 bg-slate-900/50 border-b-2 border-slate-700/50 rounded-t-xl text-gray-100 placeholder-transparent focus:outline-none focus:border-amber-400 focus:bg-slate-900/80 transition-all peer [color-scheme:dark]"
                  required
                />
                <label
                  htmlFor="checkIn"
                  className="absolute left-4 top-1 text-xs font-semibold text-amber-500/80 uppercase tracking-wider transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-xs peer-focus:text-amber-400 pointer-events-none"
                >
                  Event Start Date
                </label>
                {errors.checkIn && (
                  <span className="text-rose-400 text-sm mt-2 block pl-1">{errors.checkIn}</span>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="relative group"
              >
                <input
                  type="date"
                  name="checkOut"
                  id="checkOut"
                  value={formData.checkOut}
                  onChange={handleInputChange}
                  className="w-full p-4 pt-6 bg-slate-900/50 border-b-2 border-slate-700/50 rounded-t-xl text-gray-100 placeholder-transparent focus:outline-none focus:border-amber-400 focus:bg-slate-900/80 transition-all peer [color-scheme:dark]"
                />
                <label
                  htmlFor="checkOut"
                  className="absolute left-4 top-1 text-xs font-semibold text-amber-500/80 uppercase tracking-wider transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-xs peer-focus:text-amber-400 pointer-events-none"
                >
                  Event End Date (Optional)
                </label>
                {errors.checkOut && (
                  <span className="text-rose-400 text-sm mt-2 block pl-1">{errors.checkOut}</span>
                )}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8"
            >
              <label className="block mb-4 text-xs font-semibold text-amber-500/80 uppercase tracking-wider pl-1">
                Estimated Number of Guests
              </label>
              <div className="flex items-center gap-6 bg-slate-900/40 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors w-full md:w-1/2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleGuestChange("decrease")}
                  className="w-12 h-12 flex items-center justify-center bg-slate-800 text-gray-300 rounded-full hover:bg-slate-700 hover:text-white border border-white/10 transition-all shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                  </svg>
                </motion.button>
                <div className="w-24 text-center">
                  <span className="text-2xl font-bold text-gray-100">{formData.guests}</span>
                  <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Attendees</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleGuestChange("increase")}
                  className="w-12 h-12 flex items-center justify-center bg-amber-500/20 text-amber-400 rounded-full hover:bg-amber-500/40 hover:text-amber-300 border border-amber-500/30 transition-all shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </motion.button>
              </div>
              {errors.guests && (
                <span className="text-rose-400 text-sm mt-3 block pl-1">{errors.guests}</span>
              )}
            </motion.div>
          </div>
          {isLoading ? (
            <div className="text-center py-20 flex flex-col items-center justify-center space-y-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-t-2 border-amber-400 animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-t-2 border-amber-300 animate-spin flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-amber-200"></div>
                </div>
              </div>
              <p className="text-amber-500/80 font-medium tracking-widest uppercase text-xs animate-pulse">
                Discovering Venues...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {availableHalls.length > 0 ? (
                availableHalls.map((hall, index) => (
                  <motion.div
                    key={hall.number}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    whileHover={{
                      y: -10,
                      boxShadow: "0 20px 40px -5px rgba(0, 0, 0, 0.4)",
                      borderColor: "rgba(251, 191, 36, 0.3)",
                    }}
                    className="bg-slate-900/80 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/5 backdrop-blur-sm group transition-all duration-300 flex flex-col cursor-pointer"
                    onClick={() => handleHallSelect(hall)}
                  >
                    <div className="relative h-64 overflow-hidden">
                      <div className="absolute inset-0 bg-slate-900/20 object-cover group-hover:bg-transparent transition-colors duration-500 z-10" />
                      <img
                        src={hall.imageUrl}
                        alt={`Hall ${hall.number}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent z-10" />
                      
                      <div className="absolute top-4 right-4 z-20 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1 shadow-lg">
                        <span className="text-amber-400 text-xs">★</span>
                        <span className="font-semibold text-gray-200 text-sm">{hall.rating}</span>
                      </div>
                      
                      <div className="absolute bottom-4 left-4 z-20">
                        <h3 className="text-white font-bold text-2xl tracking-wide drop-shadow-md">
                          Hall {hall.number}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            Up to {hall.capacity} guests
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex justify-between items-end mb-6">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Starting from</p>
                          <span className="block text-amber-400 font-bold text-2xl">{hall.price}</span>
                        </div>
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="mt-auto w-full py-3.5 bg-slate-800 text-gray-200 border border-white/10 rounded-xl font-medium tracking-wide group-hover:bg-amber-500/90 group-hover:text-slate-900 group-hover:border-transparent transition-all duration-300 shadow-md flex justify-center items-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleHallSelect(hall);
                        }}
                      >
                        <span>View Details</span>
                        <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </motion.button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  className="col-span-full flex flex-col items-center justify-center py-20 bg-slate-900/40 rounded-3xl border border-white/5 backdrop-blur-sm"
                >
                  <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner border border-white/10">
                    <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-300 mb-2">No venues available</h3>
                  <p className="text-gray-500 max-w-sm text-center">
                    Unfortunately, we couldn't find any venues matching your criteria. Try adjusting your dates or guest count.
                  </p>
                </motion.div>
              )}
            </div>
          )}

          {hallNumber && reviews.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-12 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl"
            >
              <h3 className="text-2xl font-light text-gray-200 mb-8 tracking-wide border-b border-white/10 pb-4">
                Guest Impressions for <span className="text-amber-400 font-semibold">Hall {hallNumber}</span>
              </h3>
              <div className="space-y-6">
                {reviews.map((review, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    className="bg-slate-800/40 p-6 rounded-2xl shadow-inner border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-5">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-900 font-bold text-xl shadow-lg ring-2 ring-white/10">
                          {review.userName.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                          <p className="font-semibold text-gray-200 text-lg tracking-wide">{review.userName}</p>
                          <div className="flex items-center gap-1 bg-slate-900/50 px-3 py-1 rounded-full border border-white/5">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-base ${i < review.rating ? "text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]" : "text-gray-600"}`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-400 leading-relaxed mb-4 italic">"{review.comment}"</p>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-500 uppercase tracking-widest font-medium">
                            {new Date(review.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                          {review.userId === currentUserId && (
                            <div className="flex gap-3">
                              <motion.button
                                whileHover={{ scale: 1.05, color: "#93c5fd" }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleEditReview(review)}
                                className="text-blue-400 font-medium tracking-wide transition-colors"
                              >
                                Edit
                              </motion.button>
                              <motion.span className="text-gray-700">•</motion.span>
                              <motion.button
                                whileHover={{ scale: 1.05, color: "#fca5a5" }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleDeleteReview(review._id)}
                                className="text-red-400 font-medium tracking-wide transition-colors"
                              >
                                Delete
                              </motion.button>
                            </div>
                          )}
                        </div>
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
          className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 md:p-8"
          onClick={closeModal}
        >
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.95 }}
            className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] text-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-6 right-6 z-30 p-2.5 rounded-full bg-slate-800/80 text-gray-400 hover:text-white hover:bg-slate-700 backdrop-blur-md transition-all duration-300 border border-white/10 shadow-lg"
              onClick={closeModal}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </motion.button>

            <div className="relative h-80 md:h-96 w-full group overflow-hidden">
              <img
                src={selectedHallDetails.imageUrl}
                alt={`Hall ${selectedHallDetails.number}`}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
              
              <div className="absolute top-6 left-6 flex gap-3">
                <span className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-1.5 shadow-lg">
                  <span className="text-amber-400 text-sm">★</span>
                  <span className="font-semibold text-gray-200 text-sm">{selectedHallDetails.rating} Rating</span>
                </span>
                <span className="bg-blue-500/20 backdrop-blur-md px-4 py-2 rounded-full border border-blue-500/30 text-blue-300 font-semibold text-sm shadow-lg tracking-wide uppercase">
                  Suite {selectedHallDetails.number}
                </span>
              </div>
              
              <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                  <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-md mb-2">
                    Hall {selectedHallDetails.number}
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Starting from</p>
                  <p className="text-3xl font-bold text-amber-400 drop-shadow-md">{selectedHallDetails.price}</p>
                </div>
              </div>
            </div>
              </motion.div>

            <div className="p-8 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <h3 className="text-2xl font-light tracking-wide text-amber-400 mb-4">Venue Description</h3>
                <p className="text-gray-300 leading-relaxed text-lg">{selectedHallDetails.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-2xl border border-white/5 shadow-inner">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">Max Capacity</p>
                      <p className="text-gray-200 font-bold text-lg">{selectedHallDetails.capacity} Attendees</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-2xl border border-white/5 shadow-inner">
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">Standard Rate</p>
                      <p className="text-amber-400 font-bold text-lg">{selectedHallDetails.price}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h3 className="text-2xl font-light tracking-wide text-amber-400 mb-4 mt-6">Venue Offerings</h3>
                <div className="flex flex-wrap gap-3">
                  {selectedHallDetails.facilities.map((facility, index) => (
                    <motion.span
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className="px-4 py-2 rounded-full text-sm font-medium tracking-wide border transition-all duration-300 shadow-sm bg-slate-800/80 text-gray-300 border-white/10 hover:border-amber-500/50"
                    >
                      {facility}
                    </motion.span>
                  ))}
                </div>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBookNow}
                className="w-full mt-10 py-5 rounded-2xl font-bold tracking-widest uppercase text-slate-950 bg-amber-500/90 shadow-[0_0_30px_rgba(251,191,36,0.2)] transition-all duration-300 hover:bg-amber-400 hover:shadow-[0_0_40px_rgba(251,191,36,0.4)] flex justify-center items-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                Reserve This Suite
              </motion.button>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="border-t border-white/10 pt-10 mt-10"
              >
                <h3 className="text-2xl font-light tracking-wide text-gray-200 mb-8 max-w-sm border-b border-white/10 pb-4">
                  Past Experiences
                </h3>
                {isLoading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-center items-center py-10"
                  >
                    <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-amber-400 animate-spin"></div>
                  </motion.div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 * index }}
                        className="bg-slate-800/40 p-6 rounded-2xl shadow-inner border border-white/5"
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mr-5">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg ring-2 ring-white/10">
                              {review.userName.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-semibold text-gray-200 text-lg tracking-wide">{review.userName}</p>
                                <span className="text-xs text-gray-500 uppercase tracking-widest font-medium block mt-0.5">
                                  {new Date(review.createdAt).toLocaleDateString("en-US", {
                                    year: "numeric", month: "short", day: "numeric",
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 bg-slate-900/50 px-3 py-1 rounded-full border border-white/5">
                                {[...Array(5)].map((_, i) => (
                                  <span key={i} className={`text-sm ${i < review.rating ? "text-amber-400" : "text-gray-600"}`}>★</span>
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-400 leading-relaxed mt-3 italic">"{review.comment}"</p>
                            
                            {review.userId === currentUserId && (
                              <div className="mt-4 flex gap-3 text-xs">
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleEditReview(review)} className="bg-slate-700 hover:bg-slate-600 text-gray-300 px-4 py-1.5 rounded-full transition-colors font-medium">
                                  Edit
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleDeleteReview(review._id)} className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 px-4 py-1.5 rounded-full transition-colors font-medium">
                                  Remove
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
                    className="flex flex-col items-center justify-center py-12 bg-slate-900/40 rounded-3xl border border-white/5"
                  >
                    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner border border-white/10">
                      <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-medium text-gray-300 mb-2">No experiences shared yet</h4>
                    <p className="text-gray-500 text-center max-w-sm">Be the first to share your thoughts after your event at this venue.</p>
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