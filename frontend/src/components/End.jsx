import React from "react";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "John Doe",
    text: "Amazing experience! The service was top-notch and the ambiance was perfect.",
  },
  {
    name: "Jane Smith",
    text: "Absolutely loved the place. A must-visit for everyone!",
  },
  {
    name: "Michael Lee",
    text: "The views were breathtaking, and the hospitality was fantastic!",
  },
];

const End = () => {
  return (
    <motion.div
      className="flex flex-col md:flex-row justify-between items-start max-w-6xl mx-auto py-16 px-6 space-y-12 md:space-y-0 md:space-x-12"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1 }}
      viewport={{ once: true }}
    >
      <motion.div
        className="w-full md:w-1/2 space-y-6"
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl font-bold text-gray-800">
          What Our Guests Say
        </h2>
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            className="bg-gray-100 p-6 rounded-lg shadow-lg"
            whileHover={{ scale: 1.05 }}
          >
            <p className="text-gray-700 italic">"{testimonial.text}"</p>
            <p className="text-gray-900 font-semibold mt-2">
              - {testimonial.name}
            </p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="w-full md:w-1/2"
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Find Us Here</h2>
        <div className="w-full h-72 md:h-96 rounded-lg overflow-hidden shadow-lg">
          <iframe
            className="w-full h-full grayscale-[20%] hover:grayscale-0 transition-all duration-700"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15065.91834789547!2d-151.741490!3d-16.500413!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7694119853a5531b%3A0x869894e6378e0ea5!2sBora%20Bora!5e0!3m2!1sen!2s!4v1711200000000!5m2!1sen!2s"
            allowFullScreen=""
            loading="lazy"
            title="Google Map"
          ></iframe>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default End;
