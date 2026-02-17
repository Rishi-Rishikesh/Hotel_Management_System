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
            className="w-full h-full"
            src="https://www.google.com/maps/place/Anuthama+Villa/@6.9745819,79.8896766,17z/data=!3m1!4b1!4m9!3m8!1s0x3ae2599eb56da70d:0x53256cc0bbd73f47!5m2!4m1!1i2!8m2!3d6.9745819!4d79.8896766!16s%2Fg%2F11fjvtr40t?entry=ttu&g_ep=EgoyMDI1MDMxOS4yIKXMDSoASAFQAw%3D%3D"
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
