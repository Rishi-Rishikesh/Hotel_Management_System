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
        fetchRooms();
        if (roomNumber && refreshReviews) {
          fetchReviews(roomNumber);
        }
      } else {
        toast.error('Please log in to view rooms');
        navigate('/login');
      }
    });
    document.body.style.overflow = showModal ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
      unsubscribe();
    };
  }, [showModal, navigate, roomNumber, refreshReviews]);

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await api.get('/api/rooms', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setRooms(
          response.data.rooms.map((room) => ({
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
      className="min-h-screen bg-repeat p-8 pb-12 overflow-y-auto font-sans"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: '300px 300px',
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
            Room Booking
          </h1>
          <Link to="/eventbooking">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 4px 15px rgba(79, 70, 229, 0.3)' }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-indigo-600 to-teal-500 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              View Hall Bookings
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
            Choose Your <span className="text-indigo-500">Room</span>
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
                  Check-in Date
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
                  required
                />
                <label
                  htmlFor="checkOut"
                  className="absolute left-4 top-1 text-sm font-medium text-indigo-600 bg-indigo-50/50 px-1 transition-all duration-200 peer-focus:-top-2 peer-focus:text-indigo-700 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500"
                >
                  Check-out Date
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-indigo-50/50 p-4 rounded-lg shadow-sm">
                {['male', 'female', 'child'].map((type) => (
                  <div key={type} className="flex flex-col items-center">
                    <span className="text-sm font-medium text-gray-700 capitalize mb-2">{type}</span>
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: '#4f46e5' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleGuestChange(type, 'decrease')}
                        className="w-8 h-8 flex items-center justify-center bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition-all duration-200 shadow-md"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                        </svg>
                      </motion.button>
                      <span className="w-12 text-center text-lg font-semibold text-indigo-700">
                        {formData[type]}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: '#4f46e5' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleGuestChange(type, 'increase')}
                        className="w-8 h-8 flex items-center justify-center bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition-all duration-200 shadow-md"
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
                <span className="text-red-500 text-sm mt-1 block">{errors.guests}</span>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableRooms.length > 0 ? (
                availableRooms.map((room, index) => (
                  <motion.div
                    key={room.number}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    whileHover={{
                      scale: 1.03,
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                      borderColor: '#818cf8',
                    }}
                    className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent"
                    onClick={() => handleRoomSelect(room)}
                  >
                    <div className="relative overflow-hidden h-56">
                      <img
                        src={room.imageUrl}
                        alt={`Room ${room.number}`}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                        <span className="text-white font-bold text-xl">Room {room.number}</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="flex items-center">
                          <span className="text-yellow-400 mr-1">★</span>
                          <span className="font-semibold text-gray-800">{room.rating}</span>
                        </span>
                        <span className="bg-indigo-100 text-indigo-800 text-sm font-semibold px-2.5 py-0.5 rounded">
                          {room.capacity} people
                        </span>
                      </div>
                      <span className="block text-indigo-600 font-bold text-lg">{room.price}</span>
                      <motion.button
                        whileHover={{
                          scale: 1.05,
                          background: 'linear-gradient(to right, #4f46e5, #06b6d4)',
                        }}
                        whileTap={{ scale: 0.95 }}
                        className="mt-3 w-full py-2 bg-gradient-to-r from-indigo-500 to-teal-400 text-white rounded-lg transition-all duration-300 shadow-md"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRoomSelect(room);
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
                    <svg className="w-10 h-10 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No rooms available</h3>
                  <p className="text-gray-500">Try adjusting your guest count or dates</p>
                </motion.div>
              )}
            </div>
          )}

          {roomNumber && reviews.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-8 bg-white/50 backdrop-blur-sm p-6 rounded-xl shadow-md"
            >
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Customer Reviews for Room {roomNumber}</h3>
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
                                className={`text-lg ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 mb-2">{review.comment}</p>
                        <div className="text-xs text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
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

      {showModal && selectedRoomDetails && (
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
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
                  Room {selectedRoomDetails.number}
                </h2>
                <div className="mt-2 h-1 bg-gradient-to-r from-indigo-200 to-teal-200 rounded-full w-1/4 mx-auto" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative overflow-hidden rounded-xl shadow-2xl"
              >
                <img
                  src={selectedRoomDetails.imageUrl}
                  alt={`Room ${selectedRoomDetails.number}`}
                  className="w-full h-80 object-cover transform hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <span className="text-white font-bold text-xl">{selectedRoomDetails.price}</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="space-y-4"
              >
                <p className="text-gray-600 text-lg">{selectedRoomDetails.description}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center p-3 bg-indigo-50 rounded-lg">
                    <div className="p-2 bg-indigo-100 rounded-full mr-3">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Capacity</p>
                      <p className="font-semibold text-gray-800">{selectedRoomDetails.capacity} people</p>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-teal-50 rounded-lg">
                    <div className="p-2 bg-teal-100 rounded-full mr-3">
                      <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Price</p>
                      <p className="font-semibold text-gray-800">{selectedRoomDetails.price}</p>
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
                  {selectedRoomDetails.facilities.map((facility, index) => (
                    <motion.span
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        index % 3 === 0 ? 'bg-indigo-100 text-indigo-800' : index % 3 === 1 ? 'bg-purple-100 text-purple-800' : 'bg-teal-100 text-teal-800'
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
                    '0 4px 14px 0 rgba(79, 70, 229, 0.3)',
                    '0 4px 14px 0 rgba(79, 70, 229, 0.4)',
                    '0 4px 14px 0 rgba(79, 70, 229, 0.3)',
                  ],
                }}
                transition={{ scale: { duration: 0.2 }, boxShadow: { repeat: Infinity, duration: 2 } }}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-teal-500 text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg"
                onClick={handleBookNow}
              >
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Book Now
                </span>
              </motion.button>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="border-t border-gray-200 pt-8 mt-8"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Customer Reviews</h3>
                {isLoading ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center items-center py-10">
                    <svg className="animate-spin h-10 w-10 text-indigo-500" viewBox="0 0 24 24">
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
                                    className={`text-lg ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-600 mb-2">{review.comment}</p>
                            <div className="text-xs text-gray-400">
                              {new Date(review.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
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
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
                    <div className="inline-block p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full mb-4">
                      <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
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

export default RoomBooking;