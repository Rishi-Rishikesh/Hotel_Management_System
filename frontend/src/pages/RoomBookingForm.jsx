import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import background from "../assets/roomsa.jpeg";
import { auth } from "../firebaseConfig"; // Adjust path as needed

const RoomBookingForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const roomData = location.state || {};
  const selectedRoomDetails = roomData.selectedRoom || null;

  const [formData, setFormData] = useState({
    checkInDate: roomData.checkIn || "",
    checkOutDate: roomData.checkOut || "",
    roomNumber: selectedRoomDetails?.number || "",
    maleGuests: roomData.male || 0,
    femaleGuests: roomData.female || 0,
    childGuests: roomData.child || 0,
    totalGuests: (roomData.male || 0) + (roomData.female || 0) + (roomData.child || 0),
    kitchenAccess: "no",
    stayReason: "",
    paymentMethod: "",
    amenities: {
      airConditioning: false,
      food: false,
      parking: false,
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (location.state) {
      setFormData((prev) => ({
        ...prev,
        checkInDate: roomData.checkIn || prev.checkInDate,
        checkOutDate: roomData.checkOut || prev.checkOutDate,
        roomNumber: selectedRoomDetails?.number || prev.roomNumber,
        maleGuests: roomData.male || prev.maleGuests,
        femaleGuests: roomData.female || prev.femaleGuests,
        childGuests: roomData.child || prev.childGuests,
        totalGuests: (roomData.male || 0) + (roomData.female || 0) + (roomData.child || 0),
      }));
    }
  }, [location.state, selectedRoomDetails?.number, roomData]);

  const validate = () => {
    let isValid = true;

    // Check-in date validation
    if (!formData.checkInDate) {
      toast.error("Check-in date is required");
      isValid = false;
    } else {
      const selectedDate = new Date(formData.checkInDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        toast.error("Check-in date must be today or in the future");
        isValid = false;
      } else if (selectedDate.getTime() === today.getTime()) {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        if (currentHour > 10 || (currentHour === 10 && currentMinute > 0)) {
          toast.error("Same-day bookings are not allowed after 10 AM");
          isValid = false;
        }
      }
    }

    // Check-out date validation
    if (!formData.checkOutDate) {
      toast.error("Check-out date is required");
      isValid = false;
    } else if (formData.checkInDate) {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      if (checkOut <= checkIn) {
        toast.error("Check-out date must be after check-in date");
        isValid = false;
      }
    }

    // Room number validation
    if (!formData.roomNumber) {
      toast.error("Room number is required");
      isValid = false;
    }

    // Guest validation
    if (formData.totalGuests < 1) {
      toast.error("At least one guest is required");
      isValid = false;
    } else if (selectedRoomDetails?.capacity && formData.totalGuests > selectedRoomDetails.capacity) {
      toast.error(`Total guests exceed room capacity (${selectedRoomDetails.capacity})`);
      isValid = false;
    } else if (formData.childGuests > 0 && formData.maleGuests === 0 && formData.femaleGuests === 0) {
      toast.error("Children cannot book a room alone; at least one adult is required");
      isValid = false;
    }

    // Kitchen access validation
    if (!formData.kitchenAccess) {
      toast.error("Please select kitchen access");
      isValid = false;
    }

    // Payment method validation
    if (!formData.paymentMethod) {
      toast.error("Please select a payment method");
      isValid = false;
    }

    // Stay reason validation
    if (!formData.stayReason.trim()) {
      toast.error("Please enter a reason for staying");
      isValid = false;
    }

    return isValid;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => {
      let updatedData = { ...prev };
      if (type === "checkbox") {
        updatedData.amenities = { ...prev.amenities, [name]: checked };
      } else if (["maleGuests", "femaleGuests", "childGuests"].includes(name)) {
        const newValue = Math.max(0, Number(value) || 0);
        updatedData = {
          ...prev,
          [name]: newValue,
          totalGuests:
            (name === "maleGuests" ? newValue : prev.maleGuests) +
            (name === "femaleGuests" ? newValue : prev.femaleGuests) +
            (name === "childGuests" ? newValue : prev.childGuests),
        };
      } else {
        updatedData = { ...prev, [name]: value };
      }
      return updatedData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch("http://localhost:4000/api/bookings/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          checkInDate: formData.checkInDate,
          checkOutDate: formData.checkOutDate,
          roomNumber: formData.roomNumber,
          maleGuests: formData.maleGuests,
          femaleGuests: formData.femaleGuests,
          childGuests: formData.childGuests,
          totalGuests: formData.totalGuests,
          kitchenAccess: formData.kitchenAccess,
          stayReason: formData.stayReason,
          paymentMethod: formData.paymentMethod,
          amenities: formData.amenities,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Booking failed");
      }

      toast.success("Booking successful! ", {
        position: "top-right",
        autoClose: 3000,
      });
      setFormData({
        checkInDate: "",
        checkOutDate: "",
        roomNumber: "",
        maleGuests: 0,
        femaleGuests: 0,
        childGuests: 0,
        totalGuests: 0,
        kitchenAccess: "no",
        stayReason: "",
        paymentMethod: "",
        amenities: { airConditioning: false, food: false, parking: false },
      });
      setTimeout(() => navigate("/guestdashboard"), 3500);
    } catch (error) {
      toast.error(`Booking failed: ${error.message}`, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setFormData({
      checkInDate: roomData.checkIn || "",
      checkOutDate: roomData.checkOut || "",
      roomNumber: selectedRoomDetails?.number || "",
      maleGuests: 0,
      femaleGuests: 0,
      childGuests: 0,
      totalGuests: 0,
      kitchenAccess: "no",
      stayReason: "",
      paymentMethod: "",
      amenities: { airConditioning: false, food: false, parking: false },
    });
    toast.info("Form cleared", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const handleViewHistory = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch("http://localhost:4000/api/bookings/rooms/my", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        navigate("/bookinghistory", { state: { bookings: data.data } });
      } else {j
        throw new Error(data.message || "Failed to fetch booking history");
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen relative p-6 md:p-12 overflow-y-auto font-sans bg-slate-950"
    >
      <div 
        className="fixed inset-0 z-0 opacity-40 bg-cover bg-center"
        style={{ backgroundImage: `url(${background})` }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-slate-950/80 via-slate-900/60 to-slate-950/90 backdrop-blur-[2px]" />

      <ToastContainer />
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-slate-900/70 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-3xl p-8 md:p-10"
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4"
          >
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-100 to-amber-300">
              Complete Reservation
            </h1>
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(59, 130, 246, 0.2)" }}
              whileTap={{ scale: 0.98 }}
              onClick={handleViewHistory}
              className="px-6 py-2.5 rounded-full text-blue-300 font-medium tracking-wide border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 transition-all duration-300 flex items-center shadow-lg"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              View History
            </motion.button>
          </motion.div>

          {selectedRoomDetails && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-slate-800/50 border border-white/5 backdrop-blur-md p-6 rounded-2xl mb-10 shadow-inner flex flex-col md:flex-row items-center gap-6"
            >
              <div className="w-full md:w-1/3 h-32 rounded-xl overflow-hidden shadow-lg border border-white/10">
                <img src={selectedRoomDetails.imageUrl} alt="Room" className="w-full h-full object-cover" />
              </div>
              <div className="w-full md:w-2/3 flex flex-col justify-center">
                <h2 className="text-xl font-light tracking-wide mb-3 text-amber-400">Selected Suite Details</h2>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                  <p><span className="text-gray-500 uppercase tracking-wider text-xs block mb-1">Suite</span> <span className="font-semibold text-gray-100 text-lg">{selectedRoomDetails.number}</span></p>
                  <p><span className="text-gray-500 uppercase tracking-wider text-xs block mb-1">Rate</span> <span className="font-semibold text-gray-100 text-lg">{selectedRoomDetails.price}</span></p>
                  <p><span className="text-gray-500 uppercase tracking-wider text-xs block mb-1">Max Guests</span> <span className="font-semibold text-gray-100">{selectedRoomDetails.capacity}</span></p>
                  <p><span className="text-gray-500 uppercase tracking-wider text-xs block mb-1">Rating</span> <span className="font-semibold text-amber-400">★ {selectedRoomDetails.rating}</span></p>
                </div>
              </div>
            </motion.div>
          )}

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            onSubmit={handleSubmit}
            className="bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-8 md:p-10"
          >
            <h2 className="text-2xl font-light tracking-wide mb-6 text-gray-200 border-b border-white/10 pb-3">Booking Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="relative group">
                <label className="block mb-2 text-xs font-semibold text-amber-500/80 uppercase tracking-wider">Check-in Date</label>
                <div className="relative">
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type="date"
                    name="checkInDate"
                    value={formData.checkInDate}
                    onChange={handleInputChange}
                    className="w-full p-4 bg-slate-800/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-gray-200 shadow-inner [color-scheme:dark]"
                  />
                </div>
              </div>
              <div className="relative group">
                <label className="block mb-2 text-xs font-semibold text-amber-500/80 uppercase tracking-wider">Check-out Date</label>
                <div className="relative">
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type="date"
                    name="checkOutDate"
                    value={formData.checkOutDate}
                    onChange={handleInputChange}
                    className="w-full p-4 bg-slate-800/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-gray-200 shadow-inner [color-scheme:dark]"
                  />
                </div>
              </div>
              <div className="relative group">
                <label className="block mb-2 text-xs font-semibold text-amber-500/80 uppercase tracking-wider">Suite Number</label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="text"
                  name="roomNumber"
                  value={formData.roomNumber}
                  readOnly
                  className="w-full p-4 bg-slate-900/50 border border-white/5 rounded-xl text-gray-400 shadow-inner cursor-not-allowed"
                />
              </div>
              <div className="relative group">
                <label className="block mb-2 text-xs font-semibold text-amber-500/80 uppercase tracking-wider">Kitchen Access</label>
                <motion.select
                  whileFocus={{ scale: 1.01 }}
                  name="kitchenAccess"
                  value={formData.kitchenAccess}
                  onChange={handleInputChange}
                  className="w-full p-4 bg-slate-800/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-gray-200 shadow-inner appearance-none custom-select"
                >
                  <option value="" className="bg-slate-800 text-gray-400">Select option...</option>
                  <option value="yes" className="bg-slate-800 text-gray-200">Yes, required</option>
                  <option value="no" className="bg-slate-800 text-gray-200">No, not needed</option>
                </motion.select>
              </div>
              <div className="relative group md:col-span-2">
                <label className="block mb-2 text-xs font-semibold text-amber-500/80 uppercase tracking-wider">Payment Method</label>
                <motion.select
                  whileFocus={{ scale: 1.01 }}
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className="w-full p-4 bg-slate-800/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-gray-200 shadow-inner appearance-none custom-select"
                >
                  <option value="" className="bg-slate-800 text-gray-400">Select payment method...</option>
                  <option value="credit_card" className="bg-slate-800 text-gray-200">Credit Card</option>
                  <option value="debit_card" className="bg-slate-800 text-gray-200">Debit Card</option>
                  <option value="cash" className="bg-slate-800 text-gray-200">Cash (Pay at check-in)</option>
                </motion.select>
              </div>
            </div>

            <h2 className="text-2xl font-light tracking-wide mb-6 mt-10 text-gray-200 border-b border-white/10 pb-3">Guest Preferences</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="relative group">
                <label className="block mb-2 text-xs font-semibold text-amber-500/80 uppercase tracking-wider">Male Guests</label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="number"
                  name="maleGuests"
                  value={formData.maleGuests}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full p-4 bg-slate-800/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-gray-200 shadow-inner"
                />
              </div>
              <div className="relative group">
                <label className="block mb-2 text-xs font-semibold text-amber-500/80 uppercase tracking-wider">Female Guests</label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="number"
                  name="femaleGuests"
                  value={formData.femaleGuests}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full p-4 bg-slate-800/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-gray-200 shadow-inner"
                />
              </div>
              <div className="relative group">
                <label className="block mb-2 text-xs font-semibold text-amber-500/80 uppercase tracking-wider">Child Guests</label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="number"
                  name="childGuests"
                  value={formData.childGuests}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full p-4 bg-slate-800/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-gray-200 shadow-inner"
                />
              </div>
            </div>

            <div className="mb-8">
              <label className="block mb-2 text-xs font-semibold text-amber-500/80 uppercase tracking-wider">Reason for Stay</label>
              <motion.textarea
                whileFocus={{ scale: 1.01 }}
                name="stayReason"
                value={formData.stayReason}
                onChange={handleInputChange}
                placeholder="Share any special requests or occasion details..."
                className="w-full p-4 bg-slate-800/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-gray-200 shadow-inner h-32 placeholder-gray-500"
              />
            </div>

            <div className="mb-10">
              <h3 className="text-xs font-semibold text-amber-500/80 uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Requested Amenities</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <label className="flex items-center space-x-3 bg-slate-800/30 p-4 rounded-xl border border-white/5 cursor-pointer hover:bg-slate-800/50 transition">
                  <motion.input
                    whileHover={{ scale: 1.1 }}
                    type="checkbox"
                    name="airConditioning"
                    checked={formData.amenities.airConditioning}
                    onChange={handleInputChange}
                    className="h-5 w-5 bg-slate-900 border border-white/20 rounded focus:ring-amber-500 text-amber-500 accent-amber-500 cursor-pointer"
                  />
                  <span className="text-gray-300 font-medium">Air Conditioning</span>
                </label>
                <label className="flex items-center space-x-3 bg-slate-800/30 p-4 rounded-xl border border-white/5 cursor-pointer hover:bg-slate-800/50 transition">
                  <motion.input
                    whileHover={{ scale: 1.1 }}
                    type="checkbox"
                    name="food"
                    checked={formData.amenities.food}
                    onChange={handleInputChange}
                    className="h-5 w-5 bg-slate-900 border border-white/20 rounded focus:ring-amber-500 text-amber-500 accent-amber-500 cursor-pointer"
                  />
                  <span className="text-gray-300 font-medium">Food Services</span>
                </label>
                <label className="flex items-center space-x-3 bg-slate-800/30 p-4 rounded-xl border border-white/5 cursor-pointer hover:bg-slate-800/50 transition">
                  <motion.input
                    whileHover={{ scale: 1.1 }}
                    type="checkbox"
                    name="parking"
                    checked={formData.amenities.parking}
                    onChange={handleInputChange}
                    className="h-5 w-5 bg-slate-900 border border-white/20 rounded focus:ring-amber-500 text-amber-500 accent-amber-500 cursor-pointer"
                  />
                  <span className="text-gray-300 font-medium">Valet Parking</span>
                </label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-4 border-t border-white/10 pt-8 mt-8">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleClear}
                className="px-8 py-3 rounded-xl text-gray-300 font-medium tracking-wide border border-white/10 bg-slate-800 hover:bg-slate-700 hover:text-white transition-all duration-300 shadow-md sm:w-auto w-full"
              >
                Clear Form
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="px-10 py-3 bg-amber-500/90 text-slate-900 font-bold tracking-wide rounded-xl hover:bg-amber-400 transition-colors duration-300 shadow-[0_0_20px_rgba(251,191,36,0.2)] disabled:bg-gray-600 disabled:text-gray-300 disabled:shadow-none sm:w-auto w-full"
              >
                {isSubmitting ? "Processing..." : "Confirm Reservation"}
              </motion.button>
            </div>
          </motion.form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default RoomBookingForm;