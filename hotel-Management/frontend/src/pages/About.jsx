import React from "react";
import { motion } from "framer-motion";

const About = () => {
  return (
    <div className="bg-gray-100 py-16 px-4">
      <div className="max-w-7xl mx-auto text-center">
        {/* Title */}
        <motion.h1
          className="text-4xl font-bold text-blue-600 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          Welcome to Our Hotel
        </motion.h1>

        {/* Description */}
        <motion.p
          className="text-lg text-gray-700 mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          We offer luxury and comfort at affordable prices. Our goal is to make
          your stay as comfortable and enjoyable as possible, whether you're
          here for business or leisure. Our experienced team is always here to
          provide exceptional service.
        </motion.p>

        {/* Mission Section */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <h2 className="text-2xl font-semibold text-blue-600 mb-4">
            Our Mission
          </h2>
          <p className="text-lg text-gray-700">
            Our mission is to provide an unforgettable experience for every
            guest. From luxurious rooms to state-of-the-art amenities, we strive
            to offer a perfect blend of relaxation and convenience. Your comfort
            is our priority.
          </p>
        </motion.div>

        {/* Our Services */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-blue-600 mb-3">
              Luxury Rooms
            </h3>
            <p className="text-gray-700">
              Our rooms are designed to provide the utmost comfort and
              relaxation with modern amenities and beautiful views.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-blue-600 mb-3">
              Fine Dining
            </h3>
            <p className="text-gray-700">
              Indulge in exquisite dining experiences at our on-site restaurant,
              featuring local and international cuisine.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-blue-600 mb-3">
              Event Hosting
            </h3>
            <p className="text-gray-700">
              Our hotel offers exceptional facilities for conferences, weddings,
              and other special events, with professional service.
            </p>
          </div>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <h2 className="text-2xl font-semibold text-blue-600 mb-4">
            Get in Touch
          </h2>
          <p className="text-lg text-gray-700">
            If you have any questions or would like to make a reservation, feel
            free to reach out. We’d love to hear from you!
          </p>
          <div className="mt-4">
            <a href="tel:+123456789" className="text-blue-600 text-xl">
              Call Us: +123 456 789
            </a>
          </div>
          <div className="mt-2">
            <a href="mailto:info@hotel.com" className="text-blue-600 text-xl">
              Email: info@hotel.com
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
