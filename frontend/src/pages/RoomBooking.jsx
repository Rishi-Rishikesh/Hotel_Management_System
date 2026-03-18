import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { auth } from '../firebaseConfig';
import background from '../assets/roomi.jpg';
import singleRoom from '../assets/room 4.jpeg';
import doubleRoom from '../assets/room 3.jpg';
import suiteRoom from '../assets/room 5.jpg';

const api = axios.create({
  baseURL: 'http://localhost:4000',
  withCredentials: true,
});

const RoomBooking = () => {
  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    male: 0,
    female: 0,
    child: 0,
    selectedRoom: null,

  });

  const [rooms, setRooms] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const roomNumber = query.get('roomNumber');
  const refreshReviews = query.get('refreshReviews') === 'true';
  const [showModal, setShowModal] = useState(false);
  const [selectedRoomDetails, setSelectedRoomDetails] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  const imageMap = {
    Single: singleRoom,
    Double: doubleRoom,
    Suite: suiteRoom,
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setCurrentUserId(user.uid);
      }
      // Always fetch rooms regardless of auth state
      fetchRooms(!!user);
      if (roomNumber && refreshReviews && user) {
        fetchReviews(roomNumber);
      }
    });

    document.body.style.overflow = showModal ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
      unsubscribe();
    };
  }, [showModal, navigate, roomNumber, refreshReviews]);

  const fetchRooms = async (isAuthenticated) => {
    setIsLoading(true);
    try {
      let response;
      if (isAuthenticated) {
        const token = await auth.currentUser.getIdToken();
        response = await api.get('/api/rooms', {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        response = await api.get('/api/rooms/public');
      }

      if (response.data.success) {
        const roomsToMap = Array.isArray(response.data.rooms) ? response.data.rooms :
          Array.isArray(response.data.data) ? response.data.data : [];
        setRooms(
          roomsToMap.map((room) => ({
            number: room.roomNumber,
            rating: 4.7,
            price: `LKR ${room.pricePerNight}`,
            capacity: room.capacity,
            imageUrl: imageMap[room.type] || 'https://via.placeholder.com/300x200',
            description: room.description || `A ${room.type.toLowerCase()} room with modern amenities.`,
            facilities: ['Free Wi-Fi', 'Air Conditioning', 'Room Service'],
            status: room.status,
          }))
        );
      } else {
        toast.error(response.data.message || 'Failed to fetch rooms');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching rooms');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReviews = async (roomId) => {
    setIsLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await api.get(`/api/reviews/room/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setReviews(response.data.reviews || []);
      } else {
        toast.error(response.data.message || 'Failed to load reviews');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Network error while loading reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditReview = async (review) => {
    navigate(`/addreview?type=room&itemId=${selectedRoomDetails.number}&bookingId=${review.bookingId}&reviewId=${review._id}&edit=true`, {
      state: { review },
    });
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      setIsLoading(true);
      const token = await auth.currentUser.getIdToken();
      const response = await api.delete(`/api/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setReviews((prev) => prev.filter((r) => r._id !== reviewId));
        toast.success('Review deleted successfully');
      } else {
        toast.error(response.data.message || 'Failed to delete review');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  // const checkRoomAvailability = async (roomNumber, checkIn, checkOut) => {
  //   try {
  //     const token = await auth.currentUser.getIdToken();
  //     const response = await api.post(
  //       '/api/rooms/check-availability',
  //       {
  //         roomNumber,
  //         checkIn,
  //         checkOut,
  //       },
  // {
  //   headers: { Authorization: `Bearer ${token}` },
  // }
  // );
  // return response.data.success;
  //   }
  //    catch (error) {
  //     console.error('checkRoomAvailability - Error:', error.message, error.response?.data);
  //     toast.error(error.response?.data?.message || 'Error checking room availability');
  //     return false;
  //   }
  // };

  const validate = async () => {
    let newErrors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const isAfter10AM = currentHour > 10 || (currentHour === 10 && currentMinute > 0);

    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);

    const minBookingDate = new Date(today);
    minBookingDate.setDate(today.getDate() + (isAfter10AM ? 2 : 1));

    if (!formData.checkIn) {
      newErrors.checkIn = 'Please select a check-in date';
    } else if (checkInDate < today) {
      newErrors.checkIn = 'Check-in date cannot be in the past';
    } else if (checkInDate < minBookingDate) {
      newErrors.checkIn = isAfter10AM
        ? 'Bookings must be made at least two days in advance after 10 AM'
        : 'Bookings cannot be made for today';
    }

    if (!formData.checkOut) {
      newErrors.checkOut = 'Please select a check-out date';
    } else if (checkOutDate <= checkInDate) {
      newErrors.checkOut = 'Check-out date must be after check-in date';
    }

    const totalGuests = formData.male + formData.female + formData.child;
    if (totalGuests <= 0) {
      newErrors.guests = 'Please specify at least one guest';
    } else if (formData.child > 0 && formData.male === 0 && formData.female === 0) {
      newErrors.guests = 'Children cannot book a room alone; at least one adult is required';
    }

    if (formData.selectedRoom && formData.checkIn && formData.checkOut) {
      setIsLoading(true);
      // const isAvailable = await checkRoomAvailability(
      //   formData.selectedRoom.number,
      //   formData.checkIn,
      //   formData.checkOut
      // );
      setIsLoading(false);
      // if (!isAvailable) {
      //   newErrors.checkIn = 'Room is already booked for the selected dates';
      // }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRoomSelect = async (room) => {
    if (room.status !== 'available') {
      toast.error(`Room ${room.number} is ${room.status} and cannot be booked`);
      return;
    }

    setFormData((prev) => ({ ...prev, selectedRoom: { number: room.number } }));
    if (await validate()) {
      setSelectedRoomDetails(room);
      setShowModal(true);
      fetchReviews(room.number);
    } else {
      setFormData((prev) => ({ ...prev, selectedRoom: null }));
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRoomDetails(null);
    setFormData((prev) => ({ ...prev, selectedRoom: null }));
    setReviews([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleGuestChange = (type, action) => {
    setFormData((prev) => ({
      ...prev,
      [type]: action === 'increase' ? Math.min(prev[type] + 1, 20) : Math.max(prev[type] - 1, 0),
    }));
    if (errors.guests) {
      setErrors((prev) => ({ ...prev, guests: null }));
    }
  };

  const handleBookNow = async () => {
    if (!auth.currentUser) {
      toast.warning('Please log in to book a room');
      navigate('/login', { state: { from: '/roombooking' } });
      return;
    }
    if (!selectedRoomDetails) {
      toast.error('No room selected for booking');
      return;
    }
    if (await validate()) {
      navigate('/roombookingform', {
        state: { ...formData, selectedRoom: selectedRoomDetails },
      });
    }
  };

  const totalGuests = formData.male + formData.female + formData.child;
  const availableRooms = rooms.filter((room) => room.capacity >= totalGuests && room.status === 'available');

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
            Reserve Your Stay
          </h1>
          <Link to="/eventbooking">
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(251, 191, 36, 0.3)' }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 rounded-full text-amber-100 font-medium tracking-wide border border-amber-500/30 bg-amber-500/10 backdrop-blur-md hover:bg-amber-500/20 transition-all duration-300 shadow-lg"
            >
              Explore Event Halls
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
            Select Your <span className="text-amber-400 font-semibold">Suite & Room</span>
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
                  Check-in Date
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
                  required
                />
                <label
                  htmlFor="checkOut"
                  className="absolute left-4 top-1 text-xs font-semibold text-amber-500/80 uppercase tracking-wider transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-xs peer-focus:text-amber-400 pointer-events-none"
                >
                  Check-out Date
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
                Occupants
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['male', 'female', 'child'].map((type) => (
                  <div key={type} className="flex flex-col items-center bg-slate-900/40 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                    <span className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">{type}</span>
                    <div className="flex items-center gap-3">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleGuestChange(type, 'decrease')}
                        className="w-8 h-8 flex items-center justify-center bg-slate-800 text-gray-300 rounded-full hover:bg-slate-700 hover:text-white border border-white/10 transition-all shadow-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                        </svg>
                      </motion.button>
                      <span className="w-8 text-center text-xl font-medium text-gray-100">
                        {formData[type]}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleGuestChange(type, 'increase')}
                        className="w-8 h-8 flex items-center justify-center bg-amber-500/20 text-amber-400 rounded-full hover:bg-amber-500/40 hover:text-amber-300 border border-amber-500/30 transition-all shadow-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                      </motion.button>
                    </div>
                  </div>
                ))}
              </div>
              {errors.guests && (
                <span className="text-rose-400 text-sm mt-3 block pl-1">{errors.guests}</span>
              )}
            </motion.div>
          </div>

          {isLoading ? (
            <div className="text-center py-10">
              <svg className="animate-spin h-10 w-10 text-indigo-500 mx-auto" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
              </svg>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {availableRooms.length > 0 ? (
                availableRooms.map((room, index) => (
                  <motion.div
                    key={room.number}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    whileHover={{ y: -5 }}
                    className="group bg-slate-800/60 backdrop-blur-md rounded-3xl overflow-hidden border border-white/5 shadow-xl hover:border-amber-500/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] transition-all duration-300 cursor-pointer flex flex-col"
                    onClick={() => handleRoomSelect(room)}
                  >
                    <div className="relative h-64 overflow-hidden">
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
                      <img
                        src={room.imageUrl}
                        alt={`Room ${room.number}`}
                        className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute top-4 left-4 z-20">
                        <span className="bg-black/60 backdrop-blur-md text-gray-200 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-white/10">
                          {room.capacity} Guests
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent p-5 z-20">
                        <span className="text-white font-semibold text-2xl tracking-wide">Suite {room.number}</span>
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex justify-between items-center mb-4">
                        <span className="flex items-center text-gray-400">
                          <span className="text-amber-400 mr-1 text-lg">★</span>
                          <span className="font-medium text-gray-300">{room.rating}</span>
                        </span>
                        <span className="block text-amber-400 font-bold text-xl tracking-wide">{room.price}</span>
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-2 mb-6 flex-grow">{room.description}</p>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 bg-amber-500/10 text-amber-400 font-medium tracking-wide border border-amber-500/30 rounded-xl group-hover:bg-amber-500 group-hover:text-slate-900 transition-colors duration-300 shadow-inner"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRoomSelect(room);
                        }}
                      >
                        Reserve Suite
                      </motion.button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  className="col-span-full text-center py-16 px-4"
                >
                  <div className="inline-block p-5 bg-slate-800/50 rounded-full mb-6 border border-white/5 ring-1 ring-amber-500/20">
                    <svg className="w-12 h-12 text-amber-400/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-light text-gray-200 mb-3 tracking-wide">No Suites Available</h3>
                  <p className="text-gray-400 font-medium">Please adjust your dates or guest count to find available luxury suites.</p>
                </motion.div>
              )}
            </div>
          )}

          {roomNumber && reviews.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-10 bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl shadow-inner border border-white/5"
            >
              <h3 className="text-2xl font-light text-gray-200 mb-6 tracking-wide">Customer Reviews for <span className="text-amber-400 font-semibold">Suite {roomNumber}</span></h3>
              <div className="space-y-6">
                {reviews.map((review, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    className="bg-slate-800/60 p-6 rounded-2xl shadow-lg border border-white/5 hover:border-amber-500/20 transition-colors"
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-5">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-900 font-bold text-lg shadow-md">
                          {review.userName.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-semibold text-gray-100 text-lg tracking-wide">{review.userName}</p>
                          <div className="flex items-center bg-slate-900/50 px-3 py-1 rounded-full border border-white/5">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-md ${i < review.rating ? 'text-amber-400' : 'text-slate-600'}`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-300 mb-3 leading-relaxed">{review.comment}</p>
                        <div className="text-xs text-gray-500 font-medium tracking-wider uppercase">
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </div>
                        {review.userId === currentUserId && (
                          <div className="mt-4 flex gap-3">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleEditReview(review)}
                              className="text-amber-400 border border-amber-400/30 hover:bg-amber-400/10 px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
                            >
                              Edit
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDeleteReview(review._id)}
                              className="text-rose-400 border border-rose-400/30 hover:bg-rose-400/10 px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
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

      {showModal && selectedRoomDetails && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 lg:p-10"
          onClick={closeModal}
        >
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-slate-900/95 border border-white/10 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative p-8 md:p-12 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-6 right-6 p-2.5 rounded-full bg-slate-800 border border-white/10 text-gray-300 hover:text-white hover:bg-rose-500 hover:border-rose-400 transition-all duration-300 shadow-xl z-50"
              onClick={closeModal}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>

            <div className="space-y-10">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center"
              >
                <h2 className="text-4xl font-light text-gray-200 tracking-wide mb-2">
                  Suite <span className="font-semibold text-amber-400">{selectedRoomDetails.number}</span>
                </h2>
                <div className="mt-4 h-0.5 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent w-1/3 mx-auto" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10 group"
              >
                <img
                  src={selectedRoomDetails.imageUrl}
                  alt={`Room ${selectedRoomDetails.number}`}
                  className="w-full h-96 object-cover transform duration-700 group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent p-6">
                  <span className="text-amber-400 font-bold text-3xl tracking-wider">{selectedRoomDetails.price}</span>
                  <span className="text-gray-400 text-sm ml-2 tracking-wide uppercase">/ Night</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="space-y-8"
              >
                <p className="text-gray-300 text-lg leading-relaxed font-light">{selectedRoomDetails.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center p-5 bg-slate-800/50 border border-white/5 rounded-2xl">
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl mr-4">
                      <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Max Occupancy</p>
                      <p className="font-medium text-gray-200 text-lg">{selectedRoomDetails.capacity} Guests</p>
                    </div>
                  </div>

                  <div className="flex items-center p-5 bg-slate-800/50 border border-white/5 rounded-2xl">
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl mr-4">
                      <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Base Rate</p>
                      <p className="font-medium text-gray-200 text-lg">{selectedRoomDetails.price}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Included Amenities</h3>
                <div className="flex flex-wrap gap-3">
                  {selectedRoomDetails.facilities.map((facility, index) => (
                    <motion.span
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className="px-4 py-2 rounded-lg bg-slate-800/80 border border-white/10 text-gray-300 text-sm font-medium tracking-wide shadow-sm"
                    >
                      {facility}
                    </motion.span>
                  ))}
                </div>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-6 py-4 bg-amber-500/10 text-amber-400 font-medium tracking-wide border border-amber-500/30 rounded-2xl hover:bg-amber-500 hover:text-slate-900 transition-colors duration-300 shadow-lg text-lg flex justify-center items-center"
                onClick={handleBookNow}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Reserve This Suite
              </motion.button>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="border-t border-white/10 pt-10 mt-10"
              >
                <h3 className="text-2xl font-light text-gray-200 mb-8 tracking-wide">Guest Experiences</h3>
                {isLoading ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center items-center py-12">
                    <svg className="animate-spin h-10 w-10 text-amber-500 text-opacity-50" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
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
                        className="bg-slate-800/40 p-6 rounded-2xl border border-white/5 hover:border-amber-500/20 transition-colors"
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mr-5">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-900 font-bold text-lg shadow-md">
                              {review.userName.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-2">
                              <p className="font-semibold text-gray-100 text-lg tracking-wide">{review.userName}</p>
                              <div className="flex items-center bg-slate-900/50 px-3 py-1 rounded-full border border-white/5">
                                {[...Array(5)].map((_, i) => (
                                  <span
                                    key={i}
                                    className={`text-md ${i < review.rating ? 'text-amber-400' : 'text-slate-600'}`}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-300 mb-3 leading-relaxed">{review.comment}</p>
                            <div className="text-xs text-gray-500 font-medium tracking-wider uppercase">
                              {new Date(review.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </div>
                            {review.userId === currentUserId && (
                              <div className="mt-4 flex gap-3">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleEditReview(review)}
                                  className="text-amber-400 border border-amber-400/30 hover:bg-amber-400/10 px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
                                >
                                  Edit
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleDeleteReview(review._id)}
                                  className="text-rose-400 border border-rose-400/30 hover:bg-rose-400/10 px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
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
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 border border-white/5 bg-slate-800/20 rounded-2xl">
                    <div className="inline-block p-4 bg-slate-800 rounded-full mb-4 border border-white/10">
                      <svg className="w-10 h-10 text-amber-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-light text-gray-300 mb-2 tracking-wide">No Reviews Yet</h4>
                    <p className="text-gray-500 text-sm">Be the first to share your experience staying in this suite.</p>
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

export default RoomBooking;