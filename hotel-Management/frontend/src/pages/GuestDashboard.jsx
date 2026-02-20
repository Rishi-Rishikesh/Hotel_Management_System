import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCookies } from 'react-cookie';
import { toast } from 'react-toastify';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { FaStar, FaUtensils, FaBed, FaCalendar, FaComment, FaSync, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { auth } from '../firebaseConfig';
import defaultAvatar from '../assets/profile.jpg';
import roomImage from '../assets/room.jpg';
import eventImage from '../assets/event.jpg';
import feedbackImage from '../assets/feedback.jpg';
import foodImage from '../assets/food.jpg';
import '../styles/Calender.css';

const api = axios.create({
  baseURL: 'http://localhost:4000',
  withCredentials: true,
});

function GuestDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [cookies, setCookie, removeCookie] = useCookies(['user']);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reservations, setReservations] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPopup, setShowPopup] = useState(false);
  const [popupReservations, setPopupReservations] = useState([]);

  // Professional blue color palette
  const colors = {
    primary: "#1D4ED8",
    primaryLight: "#3B82F6",
    primaryLighter: "#93C5FD",
    primaryDark: "#1E40AF",
    secondary: "#64748B",
    background: "#F8FAFC",
    surface: "#FFFFFF",
    textPrimary: "#1E293B",
    textSecondary: "#64748B",
    accent: "#2563EB",
    success: "#16A34A",
    warning: "#D97706",
    error: "#DC2626",
    border: "#E2E8F0"
  };

  const fetchReservations = useCallback(async (retryCount = 3) => {
    try {
      const cachedReservations = localStorage.getItem("reservations");
      if (cachedReservations) {
        setReservations(JSON.parse(cachedReservations));
      }

      if (!auth.currentUser) {
        throw new Error("User not authenticated");
      }

      const token = await auth.currentUser.getIdToken();
      let roomBookings = [];
      let hallBookings = [];

      try {
        const roomResponse = await api.get("/api/bookings/rooms/my-bookings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (roomResponse.data.success) {
          roomBookings = Array.isArray(roomResponse.data.data)
            ? roomResponse.data.data.map((res) => ({ ...res, type: "room" }))
            : [];
        }
      } catch (err) {
        console.error("Room bookings fetch failed:", err);
      }

      try {
        const hallResponse = await api.get("/api/bookings/halls/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (hallResponse.data.success) {
          hallBookings = Array.isArray(hallResponse.data.bookings)
            ? hallResponse.data.bookings.map((res) => ({ ...res, type: "event" }))
            : [];
        }
      } catch (err) {
        console.error("Hall bookings fetch failed:", err);
      }

      const combinedReservations = [...roomBookings, ...hallBookings].filter(
        (res) => res && res._id
      );

      setReservations(combinedReservations);
      localStorage.setItem("reservations", JSON.stringify(combinedReservations));
    } catch (error) {
      console.error("Error fetching reservations:", error);
      if (retryCount > 0) {
        setTimeout(() => fetchReservations(retryCount - 1), 2000);
      }
    }
  }, [navigate]);

  const fetchUserReviews = useCallback(async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await api.get('/api/reviews/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setUserReviews(response.data.reviews || []);
      }
    } catch (error) {
      console.error('Error fetching user reviews:', error);
    }
  }, []);

  const fetchUserData = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await api.get('/api/guests/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        const userData = response.data.user;
        setUser(userData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        await fetchUserData();
        await fetchReservations();
        await fetchUserReviews();
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate, fetchReservations, fetchUserReviews]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      removeCookie('user', { path: '/' });
      localStorage.removeItem('user');
      localStorage.removeItem('reservations');
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleReviewClick = (reservation) => {
    if (!user?.fname) {
      toast.error('Please update your profile first');
      navigate('/updateprofile');
      return;
    }
    navigate(`/addreview?type=${reservation.type}&itemId=${reservation.type === 'room' ? reservation.roomNumber : reservation.hallNumber}&bookingId=${reservation._id}`);
  };

  const handleEditReview = (review) => {
    navigate(`/addreview?type=${review.type}&itemId=${review.itemId}&bookingId=${review.bookingId}&reviewId=${review._id}&edit=true`, {
      state: { review },
    });
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      const token = await auth.currentUser.getIdToken();
      await api.delete(`/api/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserReviews(prev => prev.filter(r => r._id !== reviewId));
      toast.success('Review deleted successfully');
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return '';
    const isToday = date.toDateString() === new Date().toDateString();
    const hasReservation = reservations.some((res) => {
      if (!res?.type) return false;
      if (res.type === 'room') {
        return date >= new Date(res.checkInDate) && date <= new Date(res.checkOutDate);
      } else {
        return date.toDateString() === new Date(res.eventDate).toDateString();
      }
    });

    if (hasReservation) {
      return reservations.some(
        res => res?.type === 'room' &&
          date >= new Date(res.checkInDate) &&
          date <= new Date(res.checkOutDate)
      ) ? 'bg-blue-100' : 'bg-purple-100';
    }
    return isToday ? 'bg-green-100' : '';
  };

  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    const matchingReservations = reservations.filter((res) => {
      if (!res?.type) return false;
      if (res.type === 'room') {
        return date >= new Date(res.checkInDate) && date <= new Date(res.checkOutDate);
      } else {
        return date.toDateString() === new Date(res.eventDate).toDateString();
      }
    });
    return matchingReservations.length > 0 ? (
      <div className="absolute top-0 right-0 p-1 text-xs text-white bg-gray-800 rounded-bl">
        {matchingReservations.length}
      </div>
    ) : null;
  };

  const handleDateClick = (date) => {
    const matchingReservations = reservations.filter((res) => {
      if (!res?.type) return false;
      if (res.type === 'room') {
        return date >= new Date(res.checkInDate) && date <= new Date(res.checkOutDate);
      } else {
        return date.toDateString() === new Date(res.eventDate).toDateString();
      }
    });
    setPopupReservations(matchingReservations);
    setShowPopup(true);
  };

  const upcomingReservations = reservations
    .filter((res) => {
      if (!res?.type) return false;
      const date = res.type === 'room' ? new Date(res.checkInDate) : new Date(res.eventDate);
      return date >= new Date();
    })
    .sort((a, b) => {
      const dateA = a.type === 'room' ? new Date(a.checkInDate) : new Date(a.eventDate);
      const dateB = b.type === 'room' ? new Date(b.checkInDate) : new Date(b.eventDate);
      return dateA - dateB;
    })
    .slice(0, 3);

  const reviewableReservations = reservations
    .filter((res) => res?.bookingStatus?.toLowerCase() === 'completed')
    .filter((res) => !userReviews.some(review => review.bookingId === res._id));

  const profileImage = user?.profileImage || defaultAvatar;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full"></div>
          <div className="h-4 bg-blue-100 rounded w-32"></div>
          <div className="h-4 bg-blue-100 rounded w-48"></div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 lg:pl-64">
      <div className="pt-20"> {/* Offset for the top navbar */}
        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Card */}
          {/* Welcome Card - Enhanced Version */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-xl shadow-md overflow-hidden mb-8"
          >
            <div className="p-8">
              <div className="flex flex-col md:flex-row items-center">
                {/* Profile Image - Larger Size */}
                <div className="flex-shrink-0 mb-6 md:mb-0 md:mr-8">
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-32 h-32 rounded-full border-4 border-blue-100 object-cover"
                    onError={(e) => (e.target.src = defaultAvatar)}
                  />
                </div>

                {/* Welcome Text - Larger and More Prominent */}
                <div className="text-center md:text-left">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    Welcome back, <span className="text-blue-600">{user.fname || 'Guest'}</span>
                  </h2>
                  <p className="text-xl text-gray-600 mb-6">We're delighted to have you stay with us</p>

                  {/* Stats - Larger and Better Spaced */}
                  <div className="grid grid-cols-3 gap-6">
                    <div className="bg-blue-50 px-6 py-4 rounded-lg">
                      <p className="text-lg text-gray-600 mb-1">Total Bookings</p>
                      <p className="text-2xl font-semibold text-blue-600">{reservations.length}</p>
                    </div>
                    <div className="bg-blue-50 px-6 py-4 rounded-lg">
                      <p className="text-lg text-gray-600 mb-1">Upcoming Stays</p>
                      <p className="text-2xl font-semibold text-blue-600">
                        {reservations.filter(r => r.type === 'room' && new Date(r.checkInDate) >= new Date()).length}
                      </p>
                    </div>
                    <div className="bg-blue-50 px-6 py-4 rounded-lg">
                      <p className="text-lg text-gray-600 mb-1">Upcoming Events</p>
                      <p className="text-2xl font-semibold text-blue-600">
                        {reservations.filter(r => r.type === 'event' && new Date(r.eventDate) >= new Date()).length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Services */}
            <div className="lg:col-span-2 space-y-6">
              {/* Room Booking Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3">
                    <img src={roomImage} alt="Room" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-6 md:w-2/3">
                    <div className="flex items-center mb-3">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <FaBed className="text-blue-600 text-xl" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800">Book a Room</h3>
                    </div>
                    <p className="text-gray-600 mb-6">Experience luxury accommodation with our premium rooms and suites.</p>
                    <button
                      onClick={() => user.fname ? navigate('/roombooking') : (toast.error('Please complete your profile') || navigate('/updateprofile'))}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all shadow-md"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Event Booking Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3">
                    <img src={eventImage} alt="Event" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-6 md:w-2/3">
                    <div className="flex items-center mb-3">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <FaCalendar className="text-blue-600 text-xl" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800">Book an Event</h3>
                    </div>
                    <p className="text-gray-600 mb-6">Host your special occasions in our elegant event spaces.</p>
                    <button
                      onClick={() => user.fname ? navigate('/eventbooking') : (toast.error('Please complete your profile') || navigate('/updateprofile'))}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all shadow-md"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Feedback Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3">
                    <img src={feedbackImage} alt="Feedback" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-6 md:w-2/3">
                    <div className="flex items-center mb-3">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <FaStar className="text-blue-600 text-xl" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800">Share Feedback</h3>
                    </div>
                    <p className="text-gray-600 mb-6">We value your opinion to help us improve our services.</p>
                    <button
                      onClick={() => user.fname ? navigate('/feedbackmanagement') : (toast.error('Please complete your profile') || navigate('/updateprofile'))}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all shadow-md"
                    >
                      Submit Feedback
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Food Ordering Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3">
                    <img src={foodImage} alt="Food" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-6 md:w-2/3">
                    <div className="flex items-center mb-3">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <FaUtensils className="text-blue-600 text-xl" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800">Dining Services</h3>
                    </div>
                    <p className="text-gray-600 mb-6">Explore our exquisite menu and culinary offerings.</p>
                    <button
                      onClick={() => user.fname ? navigate('/foodordering') : (toast.error('Please complete your profile') || navigate('/updateprofile'))}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all shadow-md"
                    >
                      Order Food
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Info Panels */}
            <div className="space-y-6">
              {/* Calendar Panel */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Your Reservations Calendar</h3>
                    <button
                      onClick={() => fetchReservations()}
                      className="text-blue-600 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50"
                      title="Refresh"
                    >
                      <FaSync />
                    </button>
                  </div>
                  <Calendar
                    value={selectedDate}
                    onChange={setSelectedDate}
                    onClickDay={handleDateClick}
                    tileClassName={tileClassName}
                    tileContent={tileContent}
                    className="border-none w-full"
                  />
                  <div className="flex justify-center space-x-4 mt-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      <span className="text-sm text-gray-600">Room</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                      <span className="text-sm text-gray-600">Event</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Upcoming Reservations Panel */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Reservations</h3>
                  {upcomingReservations.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingReservations.map((res) => (
                        <div key={res._id} className="border-b border-gray-100 pb-4 last:border-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-800">
                                {res.type === 'room' ? `Room ${res.roomNumber}` : `Event: ${res.eventType}`}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {res.type === 'room'
                                  ? `${new Date(res.checkInDate).toLocaleDateString()} - ${new Date(res.checkOutDate).toLocaleDateString()}`
                                  : new Date(res.eventDate).toLocaleDateString()}
                              </p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${res.bookingStatus?.toLowerCase() === 'confirmed' ? 'bg-green-100 text-green-800' :
                              res.bookingStatus?.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                res.bookingStatus?.toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                              }`}>
                              {res.bookingStatus}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500">No upcoming reservations</p>
                    </div>
                  )}
                  <button
                    onClick={() => navigate('/bookinghistory')}
                    className="w-full mt-4 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    View All Bookings
                  </button>
                </div>
              </motion.div>

              {/* Reviews Panel */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Reviews</h3>
                  {userReviews.length > 0 ? (
                    <div className="space-y-4">
                      {userReviews.slice(0, 3).map((review) => (
                        <div key={review._id} className="border-b border-gray-100 pb-4 last:border-0">
                          <div className="flex justify-between">
                            <h4 className="font-medium text-gray-800">
                              {review.type === 'room' ? `Room ${review.itemId}` : `Hall ${review.itemId}`}
                            </h4>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <FaStar
                                  key={i}
                                  className={`${i < review.rating ? 'text-yellow-400' : 'text-gray-300'} text-sm`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{review.comment}</p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditReview(review)}
                                className="text-xs text-blue-600 hover:text-blue-700"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteReview(review._id)}
                                className="text-xs text-red-600 hover:text-red-700"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500">No reviews submitted yet</p>
                    </div>
                  )}
                  {reviewableReservations.length > 0 && (
                    <button
                      onClick={() => navigate('/feedbackmanagement')}
                      className="w-full mt-4 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      Leave New Review
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </main>

        {/* Reservation Details Popup */}
        {showPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Reservations on {selectedDate.toLocaleDateString()}
                  </h3>
                  <button
                    onClick={() => setShowPopup(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                {popupReservations.length > 0 ? (
                  <div className="space-y-4">
                    {popupReservations.map((res) => (
                      <div key={res._id} className="border-b border-gray-100 pb-4 last:border-0">
                        <h4 className="font-medium text-gray-800">
                          {res.type === 'room' ? `Room ${res.roomNumber}` : `Event: ${res.eventType}`}
                        </h4>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <p className="text-xs text-gray-500">
                              {res.type === 'room' ? 'Check-in' : 'Date'}
                            </p>
                            <p className="text-sm text-gray-800">
                              {new Date(res.type === 'room' ? res.checkInDate : res.eventDate).toLocaleDateString()}
                            </p>
                          </div>
                          {res.type === 'room' && (
                            <div>
                              <p className="text-xs text-gray-500">Check-out</p>
                              <p className="text-sm text-gray-800">
                                {new Date(res.checkOutDate).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${res.bookingStatus?.toLowerCase() === 'confirmed' ? 'bg-green-100 text-green-800' :
                            res.bookingStatus?.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              res.bookingStatus?.toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                            {res.bookingStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No reservations on this date</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Floating Chat Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg cursor-pointer z-40"
          onClick={() => navigate('/chat')}
          title="Chat with Support"
        >
          <FaComment className="text-xl" />
        </motion.div>
      </div>
    </div>
  );
}

export default GuestDashboard;