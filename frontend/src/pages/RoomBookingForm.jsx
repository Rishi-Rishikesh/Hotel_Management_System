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
      className="min-h-screen bg-gray-50"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundermek: "no-repeat",
      }}
    >
      <ToastContainer />
      <div className="container mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl rounded-xl p-6"
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex justify-between items-center mb-6"
          >
            <h1 className="text-2xl font-bold text-gray-900">Room Booking</h1>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={handleViewHistory}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              Booking History
            </motion.button>
          </motion.div>

          {selectedRoomDetails && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-blue-50/80 backdrop-blur-sm p-4 rounded-lg mb-6"
            >
              <h2 className="text-xl font-semibold mb-3 text-blue-900">Selected Room Details</h2>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Room Number:</span> {selectedRoomDetails.number}
                </p>
                <p>
                  <span className="font-medium">Price:</span> {selectedRoomDetails.price}
                </p>
                <p>
                  <span className="font-medium">Capacity:</span> {selectedRoomDetails.capacity} person(s)
                </p>
                <p>
                  <span className="font-medium">Rating:</span> ★ {selectedRoomDetails.rating}
                </p>
              </div>
            </motion.div>
          )}

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            onSubmit={handleSubmit}
            className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-lg rounded-xl p-6"
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Booking Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block mb-1 font-medium text-gray-700">Check-in Date</label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="date"
                  name="checkInDate"
                  value={formData.checkInDate}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">Check-out Date</label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="date"
                  name="checkOutDate"
                  value={formData.checkOutDate}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">Room Number</label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="text"
                  name="roomNumber"
                  value={formData.roomNumber}
                  readOnly
                  className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">Kitchen Access</label>
                <motion.select
                  whileFocus={{ scale: 1.02 }}
                  name="kitchenAccess"
                  value={formData.kitchenAccess}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </motion.select>
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">Payment Method</label>
                <motion.select
                  whileFocus={{ scale: 1.02 }}
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Select</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="cash">Cash</option>
                </motion.select>
              </div>
            </div>

            <h2 className="text-xl font-semibold mb-4 text-gray-900">Guest Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block mb-1 font-medium text-gray-700">Male Guests</label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="number"
                  name="maleGuests"
                  value={formData.maleGuests}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">Female Guests</label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="number"
                  name="femaleGuests"
                  value={formData.femaleGuests}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">Child Guests</label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="number"
                  name="childGuests"
                  value={formData.childGuests}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block mb-1 font-medium text-gray-700">Reason for Stay</label>
              <motion.textarea
                whileFocus={{ scale: 1.02 }}
                name="stayReason"
                value={formData.stayReason}
                onChange={handleInputChange}
                placeholder="Enter details"
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors h-32"
              />
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-900">Amenities</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <label className="flex items-center space-x-2">
                  <motion.input
                    whileHover={{ scale: 1.1 }}
                    type="checkbox"
                    name="airConditioning"
                    checked={formData.amenities.airConditioning}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Air Conditioning</span>
                </label>
                <label className="flex items-center space-x-2">
                  <motion.input
                    whileHover={{ scale: 1.1 }}
                    type="checkbox"
                    name="food"
                    checked={formData.amenities.food}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Food</span>
                </label>
                <label className="flex items-center space-x-2">
                  <motion.input
                    whileHover={{ scale: 1.1 }}
                    type="checkbox"
                    name="parking"
                    checked={formData.amenities.parking}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Parking</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 4px 15px rgba(107, 114, 128, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handleClear}
                className="bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                Clear
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow disabled:bg-gray-400"
              >
                {isSubmitting ? "Booking..." : "Book Room"}
              </motion.button>
            </div>
          </motion.form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default RoomBookingForm;