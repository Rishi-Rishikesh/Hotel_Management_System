import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";
import banner1 from "../assets/images/banner1.jpg";
import banner2 from "../assets/images/banner2.jpg";

const images = [banner1, banner2];

const Slider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide effect every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 3000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="relative w-[100%] md:w-[80%] lg:w-[75%] h-[400px] overflow-hidden mx-auto">
      <motion.img
        key={currentIndex}
        src={images[currentIndex]}
        alt="Banner"
        className="w-full h-full object-cover"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.8 }}
      />

      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white border border-gray-300 p-4 shadow-lg rounded-md hover:bg-gray-100 transition"
      >
        <FaArrowLeft className="text-2xl text-gray-700" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white border border-gray-300 p-4 shadow-lg rounded-md hover:bg-gray-100 transition"
      >
        <FaArrowRight className="text-2xl text-gray-700" />
      </button>
    </div>
  );
};

export default Slider;
