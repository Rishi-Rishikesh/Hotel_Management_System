import React from "react";
import { motion } from "framer-motion";

const About = () => {
  return (
    <div className="bg-white selection:bg-blue-100 selection:text-blue-900">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-gray-900 text-white">
        <div className="absolute inset-0 opacity-40">
          <img
            src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=2070"
            alt="Anuthama Villa"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 text-center space-y-6 max-w-4xl px-4">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black tracking-tighter"
          >
            Living <span className="italic font-serif font-light text-blue-400">Poetry.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl font-light font-serif text-gray-300"
          >
            Anuthama Villa is more than a stay; it's a curated experience of coastal elegance and timeless grace.
          </motion.p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-32 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.4em]">Our Core</h2>
            <h3 className="text-5xl md:text-6xl font-black text-gray-900 leading-tight">Crafting Memories<br />Since Day One.</h3>
          </div>
          <p className="text-xl text-gray-500 leading-relaxed font-serif font-light">
            Born from a passion for true hospitality, Anuthama Villa was designed as a sanctuary for those who seek the extraordinary. Every stone, every light, and every smile is intentional.
          </p>
          <p className="text-lg text-gray-600">
            We offer luxury and comfort at affordable prices. Our goal is to make your stay as comfortable and enjoyable as possible, whether you're here for business or leisure. Our experienced team is always here to provide exceptional service.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl"
        >
          <img
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=2070"
            alt="Interior"
            className="w-full h-full object-cover"
          />
        </motion.div>
      </section>

      {/* Mission Section - Dark */}
      <section className="py-32 bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-sm font-black text-blue-400 uppercase tracking-[0.4em] mb-6">Our Mission</h2>
            <p className="text-3xl md:text-5xl font-serif font-light leading-snug italic">
              "To provide an unforgettable experience for every guest, blending luxurious convenience with the warmth of a private home."
            </p>
          </motion.div>

          <div className="h-px w-24 bg-blue-600 mx-auto" />

          <p className="text-gray-400 text-lg max-w-2xl mx-auto font-medium">
            From luxurious rooms to state-of-the-art amenities, we strive to offer a perfect blend of relaxation and convenience. Your comfort is our priority.
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-32 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-12">
          {[
            { title: "Luxury Rooms", desc: "Designed to provide the utmost comfort and relaxation with modern amenities." },
            { title: "Fine Dining", desc: "Indulge in exquisite dining experiences featuring local and international cuisine." },
            { title: "Event Hosting", desc: "Exceptional facilities for conferences, weddings, and special events." }
          ].map((value, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-10 bg-gray-50 rounded-[2.5rem] border border-gray-100 hover:shadow-xl transition-all group"
            >
              <h4 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">{value.title}</h4>
              <p className="text-gray-500 font-serif leading-relaxed italic">{value.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default About;
