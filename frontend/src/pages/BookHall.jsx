import React, { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import background from "../assets/Eveentes.jpeg";
import { auth } from "../firebaseConfig";

const Bookhall = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedHall, checkIn, checkOut, guests } = location.state || {};

  const [formData, setFormData] = useState({
    hallNumber: selectedHall?.number || "",
    eventDate: checkIn || "",
    endDate: checkOut || "",
    checkInTime: "",
    checkOutTime: "",
    numberOfGuests: guests || 0,
    eventType: "",
    additionalServices: [],
    specialRequests: "",
    paymentMethod: "",
    totalPrice: parseInt(selectedHall?.price?.replace("LKR ", "")) || 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submissionError, setSubmissionError] = useState(null);

  const eventTypes = ["wedding", "conference", "party", "other"];
  const additionalServiceOptions = [
    { id: "catering", label: "Catering Service", price: 15000 },
    { id: "decor", label: "Decoration Package", price: 8000 },
    { id: "audioVisual", label: "Audio/Visual Equipment", price: 10000 },
    { id: "photography", label: "Photography Service", price: 12000 },
    { id: "security", label: "Security Personnel", price: 5000 },
  ];

  useEffect(() => {
    if (selectedHall) {
      setFormData((prev) => ({
        ...prev,
        hallNumber: selectedHall.number,
        eventDate: checkIn || "",
        endDate: checkOut || "",
        numberOfGuests: guests || 0,
        totalPrice: parseInt(selectedHall.price.replace("LKR ", "")) || 0,
      }));
    }
  }, [selectedHall, checkIn, checkOut, guests]);

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
      numberOfGuests:
        action === "increase"
          ? Math.min(prev.numberOfGuests + 10, 1000)
          : Math.max(prev.numberOfGuests - 10, 0),
    }));
    if (errors.numberOfGuests) {
      setErrors((prev) => ({ ...prev, numberOfGuests: null }));
    }
  };

  const handleGuestInput = (e) => {
    let value = e.target.value;
    value = value === "" ? 0 : Math.max(0, Math.min(1000, Number(value)));
    setFormData((prev) => ({ ...prev, numberOfGuests: value }));
    if (errors.numberOfGuests) {
      setErrors((prev) => ({ ...prev, numberOfGuests: null }));
    }
  };

  const handleServiceChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      let updatedServices = [...prev.additionalServices];
      if (checked) {
        updatedServices.push(value);
      } else {
        updatedServices = updatedServices.filter((service) => service !== value);
      }
      return { ...prev, additionalServices: updatedServices };
    });
  };

  const handleEventTypeChange = (eventType) => {
    setFormData((prev) => ({ ...prev, eventType }));
    if (errors.eventType) {
      setErrors((prev) => ({ ...prev, eventType: null }));
    }
  };

  const handlePaymentMethodChange = (paymentMethod) => {
    setFormData((prev) => ({ ...prev, paymentMethod }));
    if (errors.paymentMethod) {
      setErrors((prev) => ({ ...prev, paymentMethod: null }));
    }
  };

  const calculateTotalPrice = () => {
    let basePrice = parseInt(selectedHall?.price?.replace("LKR ", "")) || 0;
    let additionalServicesTotal = formData.additionalServices.reduce(
      (total, serviceId) => {
        const service = additionalServiceOptions.find(
          (option) => option.id === serviceId
        );
        return total + (service ? service.price : 0);
      },
      0
    );
    return basePrice + additionalServicesTotal;
  };

  const validate = () => {
    let newErrors = {};

    if (!formData.hallNumber) {
      newErrors.hallNumber = "Hall number is required";
    }

    if (!formData.eventDate) {
      newErrors.eventDate = "Event date is required";
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const eventDate = new Date(formData.eventDate);
      if (eventDate < today) {
        newErrors.eventDate = "Event date cannot be in the past";
      }
    }

    if (!formData.checkInTime) {
      newErrors.checkInTime = "Check-in time is required";
    }

    if (
      formData.endDate &&
      formData.eventDate &&
      new Date(formData.endDate) < new Date(formData.eventDate)
    ) {
      newErrors.endDate = "End date cannot be before event date";
    }

    if (!formData.eventType) {
      newErrors.eventType = "Event type is required";
    }

    if (formData.numberOfGuests < 1) {
      newErrors.numberOfGuests = "At least one guest is required";
    } else if (
      selectedHall?.capacity &&
      formData.numberOfGuests > selectedHall.capacity
    ) {
      newErrors.numberOfGuests = `Number of guests exceeds hall capacity (${selectedHall.capacity})`;
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = "Payment method is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      if (!auth.currentUser) {
        toast.error("Please log in to book a hall", {
          position: "top-right",
          autoClose: 5000,
        });
        navigate("/login");
        return;
      }

      const token = await auth.currentUser.getIdToken();

      const totalPrice = calculateTotalPrice();
      const bookingData = {
        hallNumber: formData.hallNumber,
        eventDate: formData.eventDate,
        endDate: formData.endDate || null,
        checkInTime: formData.checkInTime,
        checkOutTime: formData.checkOutTime || "",
        eventType: formData.eventType,
        numberOfGuests: formData.numberOfGuests,
        additionalServices: formData.additionalServices,
        specialRequests: formData.specialRequests || "",
        paymentMethod: formData.paymentMethod,
        totalPrice,
      };

      console.log("Sending booking data:", bookingData);

      const response = await fetch("http://localhost:4000/api/bookings/halls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Booking failed");
      }

      toast.success("Hall booking successful! ", {
        position: "top-right",
        autoClose: 3000,
      });
      setFormData({
        hallNumber: selectedHall?.number || "",
        eventDate: "",
        endDate: "",
        checkInTime: "",
        checkOutTime: "",
        numberOfGuests: 0,
        eventType: "",
        additionalServices: [],
        specialRequests: "",
        paymentMethod: "",
        totalPrice: parseInt(selectedHall?.price?.replace("LKR ", "")) || 0,
      });
      setTimeout(() => navigate("/guestdashboard"), 3500);
    } catch (error) {
      setSubmissionError(`Booking failed: ${error.message}`);
      toast.error(`Booking failed: ${error.message}`, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewHistory = async () => {
    try {
      if (!auth.currentUser) {
        toast.error("Please log in to view booking history", {
          position: "top-right",
          autoClose: 5000,
        });
        navigate("/login");
        return;
      }

      const token = await auth.currentUser.getIdToken();

      const response = await fetch("http://localhost:4000/api/bookings/halls/my", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        navigate("/bookinghistory", { state: { bookings: data.data } });
      } else {
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
      className="min-h-screen bg-cover bg-center relative font-sans"
      style={{ backgroundImage: `url(${background})` }}
    >
      <ToastContainer />
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative max-w-5xl mx-auto p-8 pb-12">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex justify-between items-center mb-10"
        >
          <h1 className="text-4xl font-bold text-white">Hall Booking</h1>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            onClick={handleViewHistory}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-300"
          >
            View Booking History
          </motion.button>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="bg-white border border-gray-100 rounded-2xl p-8 shadow-lg"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Book Your Event Hall
          </h2>

          {selectedHall && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-blue-50 p-4 rounded-lg mb-6 shadow-sm"
            >
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-full mr-3">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h-2m-2 0h-2m-2 0h-2m-2 0h-2M9 7h1m4 0h1m-1 4h1m-5 4h1m-1 4h1m4-8h1m-1 4h1m-5 4h1"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Hall {selectedHall.number}
                  </h3>
                  <p className="text-gray-600">
                    Capacity: {selectedHall.capacity} people
                  </p>
                  <p className="text-blue-600 font-medium">
                    Base Price: {selectedHall.price}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {submissionError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="p-4 rounded-lg mb-6 bg-red-100 border-l-4 border-red-500 text-red-700"
            >
              <div className="flex items-center">
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
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{submissionError}</span>
              </div>
            </motion.div>
          )}

          <motion.div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Event Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div className="relative">
                <input
                  type="date"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleInputChange}
                  className="w-full p-3 pt-5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm peer text-gray-800"
                  required
                />
                <label
                  htmlFor="eventDate"
                  className="absolute left-3 top-1 text-sm font-medium text-gray-500 bg-white px-1 transition-all duration-200 peer-focus:-top-2 peer-focus:text-blue-600 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400"
                >
                  Event Date *
                </label>
                {errors.eventDate && (
                  <span className="text-red-500 text-sm mt-1 block">
                    {errors.eventDate}
                  </span>
                )}
              </motion.div>

              <motion.div className="relative">
                <input
                  type="time"
                  name="checkInTime"
                  value={formData.checkInTime}
                  onChange={handleInputChange}
                  className="w-full p-3 pt-5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm peer text-gray-800"
                  required
                />
                <label
                  htmlFor="checkInTime"
                  className="absolute left-3 top-1 text-sm font-medium text-gray-500 bg-white px-1 transition-all duration-200 peer-focus:-top-2 peer-focus:text-blue-600 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400"
                >
                  Check-in Time *
                </label>
                {errors.checkInTime && (
                  <span className="text-red-500 text-sm mt-1 block">
                    {errors.checkInTime}
                  </span>
                )}
              </motion.div>

              <motion.div className="relative">
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full p-3 pt-5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm peer text-gray-800"
                />
                <label
                  htmlFor="endDate"
                  className="absolute left-3 top-1 text-sm font-medium text-gray-500 bg-white px-1 transition-all duration-200 peer-focus:-top-2 peer-focus:text-blue-600 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400"
                >
                  End Date
                </label>
                {errors.endDate && (
                  <span className="text-red-500 text-sm mt-1 block">
                    {errors.endDate}
                  </span>
                )}
              </motion.div>

              <motion.div className="relative">
                <input
                  type="time"
                  name="checkOutTime"
                  value={formData.checkOutTime}
                  onChange={handleInputChange}
                  className="w-full p-3 pt-5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm peer text-gray-800"
                />
                <label
                  htmlFor="checkOutTime"
                  className="absolute left-3 top-1 text-sm font-medium text-gray-500 bg-white px-1 transition-all duration-200 peer-focus:-top-2 peer-focus:text-blue-600 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400"
                >
                  Check-out Time
                </label>
              </motion.div>
            </div>

            <motion.div className="mt-6">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Number of Guests *
              </label>
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.1, backgroundColor: "rgb(59, 130, 246)" }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => handleGuestChange("decrease")}
                  className="w-10 h-10 flex items-center justify-center bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all duration-200 shadow-md"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M20 12H4"
                    />
                  </svg>
                </motion.button>
                <input
                  type="number"
                  value={formData.numberOfGuests}
                  onChange={handleGuestInput}
                  className="w-20 text-center p-2 border border-gray-200 rounded-lg bg-white text-gray-800 font-medium"
                  placeholder="0"
                />
                <motion.button
                  whileHover={{ scale: 1.1, backgroundColor: "rgb(59, 130, 246)" }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => handleGuestChange("increase")}
                  className="w-10 h-10 flex items-center justify-center bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all duration-200 shadow-md"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </motion.button>
              </div>
              {errors.numberOfGuests && (
                <span className="text-red-500 text-sm mt-1 block">
                  {errors.numberOfGuests}
                </span>
              )}
            </motion.div>

            <motion.div className="mt-6">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Event Type *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {eventTypes.map((event, index) => (
                  <motion.div
                    key={event}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 + 0.1 * index }}
                    className="flex items-center"
                  >
                    <input
                      type="radio"
                      name="eventType"
                      id={`event-${event}`}
                      value={event}
                      checked={formData.eventType === event}
                      onChange={() => handleEventTypeChange(event)}
                      className="hidden peer"
                    />
                    <label
                      htmlFor={`event-${event}`}
                      className="flex-1 p-3 rounded-lg bg-white border border-gray-200 text-gray-700 font-medium cursor-pointer hover:bg-blue-50 transition-all duration-200 peer-checked:bg-blue-100 peer-checked:border-blue-500 peer-checked:text-blue-800"
                    >
                      {event.charAt(0).toUpperCase() + event.slice(1)}
                    </label>
                  </motion.div>
                ))}
              </div>
              {errors.eventType && (
                <span className="text-red-500 text-sm mt-1 block">
                  {errors.eventType}
                </span>
              )}
            </motion.div>
          </motion.div>

          <motion.div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Additional Services
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {additionalServiceOptions.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 + 0.1 * index }}
                  className="flex items-center p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-blue-50 transition-all duration-200"
                >
                  <input
                    type="checkbox"
                    name="additionalServices"
                    id={`service-${service.id}`}
                    value={service.id}
                    checked={formData.additionalServices.includes(service.id)}
                    onChange={handleServiceChange}
                    className="w-5 h-5 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor={`service-${service.id}`}
                    className="ml-3 text-gray-700 font-medium cursor-pointer"
                  >
                    {service.label} (+LKR {service.price.toLocaleString()})
                  </label>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Special Requests
            </h3>
            <div className="relative">
              <textarea
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleInputChange}
                className="w-full p-4 pt-6 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm peer text-gray-800 h-32"
                placeholder=" "
              />
              <label
                htmlFor="specialRequests"
                className="absolute left-3 top-1 text-sm font-medium text-gray-500 bg-white px-1 transition-all duration-200 peer-focus:-top-2 peer-focus:text-blue-600 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400"
              >
                Special Requests or Notes
              </label>
            </div>
          </motion.div>

          <motion.div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Price Summary
            </h3>
            <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
              <div className="space-y-2 text-gray-700">
                <div className="flex justify-between">
                  <span>Base Rate</span>
                  <span className="font-medium">
                    LKR {selectedHall?.price?.replace("LKR ", "") || 0}
                  </span>
                </div>
                {formData.additionalServices.map((serviceId) => {
                  const service = additionalServiceOptions.find(
                    (opt) => opt.id === serviceId
                  );
                  return service ? (
                    <div key={service.id} className="flex justify-between">
                      <span>{service.label}</span>
                      <span className="font-medium">
                        LKR {service.price.toLocaleString()}
                      </span>
                    </div>
                  ) : null;
                })}
                <div className="flex justify-between font-semibold border-t border-gray-200 pt-2 mt-2 text-gray-800">
                  <span>Total</span>
                  <span className="text-blue-600">
                    LKR {calculateTotalPrice().toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Payment Method *
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { value: "credit_card", label: "Credit Card" },
                { value: "debit_card", label: "Debit Card" },
                { value: "cash", label: "Cash" },
              ].map((method, index) => (
                <motion.div
                  key={method.value}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + 0.1 * index }}
                  className="flex items-center"
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    id={`payment-${method.value}`}
                    value={method.value}
                    checked={formData.paymentMethod === method.value}
                    onChange={() => handlePaymentMethodChange(method.value)}
                    className="hidden peer"
                  />
                  <label
                    htmlFor={`payment-${method.value}`}
                    className="flex-1 p-3 rounded-lg bg-white border border-gray-200 text-gray-700 font-medium cursor-pointer hover:bg-blue-50 transition-all duration-200 peer-checked:bg-blue-100 peer-checked:border-blue-500 peer-checked:text-blue-800"
                  >
                    {method.label}
                  </label>
                </motion.div>
              ))}
            </div>
            {errors.paymentMethod && (
              <span className="text-red-500 text-sm mt-1 block">
                {errors.paymentMethod}
              </span>
            )}
          </motion.div>

          <motion.div className="flex justify-end gap-4">
            <Link to="/eventbooking">
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 4px 15px rgba(239, 68, 68, 0.3)",
                }}
                whileTap={{ scale: 0.95 }}
                type="button"
                className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-red-600 transition-all duration-300"
              >
                Go Back
              </motion.button>
            </Link>
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
              }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                    />
                  </svg>
                  Processing...
                </>
              ) : (
                "Confirm Booking"
              )}
            </motion.button>
          </motion.div>
        </motion.form>
      </div>
    </motion.div>
  );
};

export default Bookhall;