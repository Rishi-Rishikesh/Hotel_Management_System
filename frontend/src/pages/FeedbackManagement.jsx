import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const FeedbackForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    roomType: '',
    cleanliness: 0,
    comfort: 0,
    staff: 0,
    location: 0,
    valueForMoney: 0,
    overallRating: 0,
    comments: '',
    suggestions: '',
    stayAgain: null,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const handleRatingChange = (category, value) => {
    setFormData({
      ...formData,
      [category]: value,
    });

    if (errors[category]) {
      setErrors({
        ...errors,
        [category]: null,
      });
    }
  };

  const handleRadioChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value === 'yes',
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.roomType.trim()) newErrors.roomType = 'Room type is required';

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.cleanliness === 0) newErrors.cleanliness = 'Please rate the cleanliness';
    if (formData.comfort === 0) newErrors.comfort = 'Please rate the comfort';
    if (formData.staff === 0) newErrors.staff = 'Please rate the staff';
    if (formData.location === 0) newErrors.location = 'Please rate the location';
    if (formData.valueForMoney === 0) newErrors.valueForMoney = 'Please rate the value for money';
    if (formData.overallRating === 0) newErrors.overallRating = 'Please provide an overall rating';

    if (formData.stayAgain === null) newErrors.stayAgain = 'Please answer this question';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post('http://localhost:4000/api/feedback', formData);

      if (response.data.success) {
        setSubmitted(true);
        window.scrollTo(0, 0);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setErrors({
        submit: 'There was an error submitting your feedback. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ rating, onRatingChange, size = 'medium' }) => {
    const starSize = size === 'large' ? 'text-3xl' : 'text-2xl';

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className={`flex gap-1 ${starSize}`}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.span
            key={star}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className={`cursor-pointer transition-all duration-200 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
            onClick={() => onRatingChange(star)}
          >
            ★
          </motion.span>
        ))}
      </motion.div>
    );
  };

  const ThankYouPage = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center py-12 px-5 max-w-2xl mx-auto"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-blue-500 text-white w-16 h-16 text-4xl rounded-full flex items-center justify-center mx-auto mb-5 shadow-md"
        >
          ✓
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-3xl font-medium text-gray-800 mb-5"
        >
          Thank You, {formData.name}!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-3 text-gray-600"
        >
          Your feedback has been successfully submitted.
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-3 text-gray-600"
        >
          We appreciate you taking the time to share your experience with us. Your feedback helps us improve our services and provide an even better stay for future guests.
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-6 text-gray-600"
        >
          We hope to welcome you back again soon!
        </motion.p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/guestdashboard')}
          className="px-6 py-2 rounded-full text-white font-medium bg-gradient-to-r from-blue-500 to-teal-500 shadow-lg hover:from-blue-600 hover:to-teal-600 transition-all duration-300"
        >
          Go to Guest Dashboard
        </motion.button>
      </motion.div>
    );
  };

  const FormInput = ({ label, type, name, value, onChange, error, required }) => {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-5"
      >
        <label htmlFor={name} className="block mb-2 font-medium text-gray-600">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full p-3 border rounded-lg bg-gray-50 text-gray-800 focus:ring-2 focus:ring-blue-400 transition-colors duration-300 ${
            error ? 'border-red-500 bg-red-50' : 'border-gray-200'
          }`}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </motion.div>
    );
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen flex justify-center items-start p-5 bg-gradient-to-b from-blue-50 to-teal-100"
      >
        <div className="w-full max-w-4xl bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
          <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-blue-500 to-teal-500 text-white text-center py-10 px-5 relative"
          >
            <h1 className="text-3xl font-semibold mb-2">Anuthama Villa Experience</h1>
            <p className="text-base opacity-90 font-light">We value your feedback</p>
          </motion.header>

          <ThankYouPage />

          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-center py-5 text-gray-500 text-sm border-t border-gray-200"
          >
            <p>© {new Date().getFullYear()} Anuthama Villa. All rights reserved.</p>
          </motion.footer>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex justify-center items-start p-5 bg-gradient-to-b from-blue-50 to-teal-100"
    >
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-blue-500 to-teal-500 text-white text-center py-10 px-5 relative"
        >
          <h1 className="text-3xl font-semibold mb-2">Anuthama Villa Experience</h1>
          <p className="text-base opacity-90 font-light">We value your feedback</p>
        </motion.header>

        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-10 bg-white rounded-lg p-6 shadow-sm border-l-4 border-blue-500"
            >
              <h2 className="text-xl font-medium text-gray-800 mb-5 pb-2 border-b border-gray-200">
                Guest Information
              </h2>

              <FormInput
                label="Full Name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                required
              />

              <FormInput
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
              />

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mb-5"
              >
                <label htmlFor="roomType" className="block mb-2 font-medium text-gray-600">
                  Accommodation Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="roomType"
                  name="roomType"
                  value={formData.roomType}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg bg-gray-50 text-gray-800 focus:ring-2 focus:ring-blue-400 transition-colors duration-300 ${
                    errors.roomType ? ' iguest-dashboard' : 'border-gray-200'
                  }`}
                >
                  <option value="">Please select</option>
                  <option value="Room">Room</option>
                  <option value="Hall">Hall</option>
                  <option value="Villa">Villa</option>
                </select>
                {errors.roomType && <p className="mt-1 text-sm text-red-500">{errors.roomType}</p>}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-10 bg-white rounded-lg p-6 shadow-sm border-l-4 border-blue-500"
            >
              <h2 className="text-xl font-medium text-gray-800 mb-5 pb-2 border-b border-gray-200">
                Rate Your Experience
              </h2>
              <p className="mb-4 text-gray-600 text-sm">
                Please rate the following aspects of your stay (1-5 stars)
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="flex flex-col"
                >
                  <label className="mb-2 font-medium text-gray-600">
                    Cleanliness <span className="text-red-500">*</span>
                  </label>
                  <StarRating
                    rating={formData.cleanliness}
                    onRatingChange={(value) => handleRatingChange('cleanliness', value)}
                  />
                  {errors.cleanliness && (
                    <p className="mt-1 text-sm text-red-500">{errors.cleanliness}</p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="flex flex-col"
                >
                  <label className="mb-2 font-medium text-gray-600">
                    Comfort <span className="text-red-500">*</span>
                  </label>
                  <StarRating
                    rating={formData.comfort}
                    onRatingChange={(value) => handleRatingChange('comfort', value)}
                  />
                  {errors.comfort && <p className="mt-1 text-sm text-red-500">{errors.comfort}</p>}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="flex flex-col"
                >
                  <label className="mb-2 font-medium text-gray-600">
                    Staff & Service <span className="text-red-500">*</span>
                  </label>
                  <StarRating
                    rating={formData.staff}
                    onRatingChange={(value) => handleRatingChange('staff', value)}
                  />
                  {errors.staff && <p className="mt-1 text-sm text-red-500">{errors.staff}</p>}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="flex flex-col"
                >
                  <label className="mb-2 font-medium text-gray-600">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <StarRating
                    rating={formData.location}
                    onRatingChange={(value) => handleRatingChange('location', value)}
                  />
                  {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location}</p>}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="flex flex-col"
                >
                  <label className="mb-2 font-medium text-gray-600">
                    Value for Money <span className="text-red-500">*</span>
                  </label>
                  <StarRating
                    rating={formData.valueForMoney}
                    onRatingChange={(value) => handleRatingChange('valueForMoney', value)}
                  />
                  {errors.valueForMoney && (
                    <p className="mt-1 text-sm text-red-500">{errors.valueForMoney}</p>
                  )}
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="pt-5 mt-5 border-t border-dashed border-gray-200 flex flex-col items-center"
              >
                <label className="text-lg font-medium text-gray-600 mb-4">
                  Overall Experience <span className="text-red-500">*</span>
                </label>
                <StarRating
                  rating={formData.overallRating}
                  onRatingChange={(value) => handleRatingChange('overallRating', value)}
                  size="large"
                />
                {errors.overallRating && (
                  <p className="mt-2 text-sm text-red-500">{errors.overallRating}</p>
                )}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="mb-10 bg-white rounded-lg p-6 shadow-sm border-l-4 border-blue-500"
            >
              <h2 className="text-xl font-medium text-gray-800 mb-5 pb-2 border-b border-gray-200">
                Additional Feedback
              </h2>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="mb-5"
              >
                <label htmlFor="comments" className="block mb-2 font-medium text-gray-600">
                  What did you enjoy most about your stay?
                </label>
                <textarea
                  id="comments"
                  name="comments"
                  value={formData.comments}
                  onChange={handleChange}
                  rows="4"
                  className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-800 focus:ring-2 focus:ring-blue-400"
                ></textarea>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.1 }}
                className="mb-5"
              >
                <label htmlFor="suggestions" className="block mb-2 font-medium text-gray-600">
                  How could we improve your experience?
                </label>
                <textarea
                  id="suggestions"
                  name="suggestions"
                  value={formData.suggestions}
                  onChange={handleChange}
                  rows="4"
                  className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-800 focus:ring-2 focus:ring-blue-400"
                ></textarea>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="mb-5"
              >
                <label className="block mb-2 font-medium text-gray-600">
                  Would you stay with us again? <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-6">
                  <motion.label
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 1.3 }}
                    className="flex items-center cursor-pointer text-gray-600"
                  >
                    <input
                      type="radio"
                      name="stayAgain"
                      value="yes"
                      checked={formData.stayAgain === true}
                      onChange={handleRadioChange}
                      className="w-4 h-4 text-blue-500 mr-2"
                    />
                    Yes
                  </motion.label>
                  <motion.label
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 1.4 }}
                    className="flex items-center cursor-pointer text-gray-600"
                  >
                    <input
                      type="radio"
                      name="stayAgain"
                      value="no"
                      checked={formData.stayAgain === false}
                      onChange={handleRadioChange}
                      className="w-4 h-4 text-blue-500 mr-2"
                    />
                    No
                  </motion.label>
                </div>
                {errors.stayAgain && <p className="mt-1 text-sm text-red-500">{errors.stayAgain}</p>}
              </motion.div>
            </motion.div>

            {errors.submit && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="mb-5 text-red-500 text-center p-2 bg-red-50 rounded-lg"
              >
                {errors.submit}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.5 }}
              className="flex justify-center mt-8"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isSubmitting}
                className={`px-8 py-3 rounded-full text-white font-medium text-lg bg-gradient-to-r from-blue-500 to-teal-500 shadow-lg hover:from-blue-600 hover:to-teal-600 transition-all duration-300 ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </motion.button>
            </motion.div>
          </form>
        </div>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.6 }}
          className="text-center py-5 text-gray-500 text-sm border-t border-gray-200"
        >
          <p>© {new Date().getFullYear()} Anuthama Villa. All rights reserved.</p>
        </motion.footer>
      </div>
    </motion.div>
  );
};

export default FeedbackForm;