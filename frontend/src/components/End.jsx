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
    <section className="bg-[#f1f4f1] text-gray-900 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20">
        {/* Left Side: Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="space-y-12"
        >
          <div>
            <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.4em] mb-4">Reviews</h2>
            <h3 className="text-5xl font-black tracking-tight text-gray-900">Guest<br />Experiences.</h3>
          </div>

          <div className="space-y-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative pl-8 border-l-2 border-blue-600/20 group hover:border-blue-600 transition-colors"
              >
                <p className="text-xl text-gray-600 font-serif italic leading-relaxed">
                  "{testimonial.text}"
                </p>
                <p className="mt-4 text-sm font-black uppercase tracking-widest text-gray-900">
                  — {testimonial.name}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Side: Map & Address */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex flex-col space-y-8"
        >
          <div className="rounded-[2.5rem] overflow-hidden shadow-2xl bg-white p-2 ring-1 ring-gray-200 h-[450px]">
            <iframe
              className="w-full h-full rounded-[2rem] grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
              src="https://maps.google.com/maps?q=Anuthama%20Villa%20Wattala&t=&z=15&ie=UTF8&iwloc=&output=embed"
              allowFullScreen=""
              loading="lazy"
              title="Google Map"
            ></iframe>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default End;
