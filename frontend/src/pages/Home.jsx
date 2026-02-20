import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  MapPin,
  Star,
  Clock,
  ShieldCheck,
  Coffee,
  Wifi,
  Wind,
  Waves
} from "lucide-react";
import Slider from "../components/Slider";
import RoomsPreview from "../components/RoomsPreview";
import ServiceSection from "../components/ServiceSection";
import Gallery from "../components/Gallery";
import End from "../components/End";

const Home = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  return (
    <div className="bg-white selection:bg-blue-100 selection:text-blue-900">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-24 pb-16 overflow-hidden">
        {/* Background Decorative Blobs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-blue-50 rounded-full blur-3xl opacity-60 -z-10" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-teal-50 rounded-full blur-3xl opacity-50 -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col space-y-8"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-full text-blue-600 font-bold text-sm uppercase tracking-widest shadow-sm">
              <Star size={16} className="fill-blue-600" />
              <span>Elite Boutique Stay</span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-black text-gray-900 leading-[1.1] tracking-tighter">
              Refined <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">Elegance</span> in Every Detail.
            </motion.h1>

            <motion.p variants={itemVariants} className="text-xl md:text-2xl text-gray-600 max-w-lg leading-relaxed font-medium">
              Anuthama Villa offers a sanctuary of peace and world-class luxury, tailored for those who appreciate the finer things.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-4 pt-4">
              <button
                onClick={() => navigate("/roombooking")}
                className="group px-8 py-5 bg-gray-900 text-white rounded-2xl font-bold flex items-center gap-3 hover:bg-blue-600 transition-all shadow-2xl shadow-gray-200 active:scale-95"
              >
                Book Your Experience
                <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </button>
              <button
                onClick={() => navigate("/about")}
                className="px-8 py-5 bg-white text-gray-900 border-2 border-gray-100 rounded-2xl font-bold hover:border-gray-900 transition-all active:scale-95 shadow-sm"
              >
                Our Story
              </button>
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-3 gap-8 pt-10 border-t border-gray-100">
              <div>
                <span className="block text-3xl font-black text-gray-900">4.9/5</span>
                <span className="text-sm font-bold text-gray-400 uppercase">Guest Rating</span>
              </div>
              <div>
                <span className="block text-3xl font-black text-gray-900">24/7</span>
                <span className="text-sm font-bold text-gray-400 uppercase">Concierge</span>
              </div>
              <div>
                <span className="block text-3xl font-black text-gray-900">100%</span>
                <span className="text-sm font-bold text-gray-400 uppercase">Privacy</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 50 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-br from-blue-100 to-teal-100 rounded-[3rem] -rotate-3 blur-sm -z-10" />
            <div className="p-2 bg-white rounded-[2.5rem] shadow-2xl overflow-hidden ring-1 ring-gray-100">
              <Slider />
            </div>

            {/* Float Badge */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-8 -left-8 bg-white p-6 rounded-3xl shadow-2xl border border-gray-50 flex items-center gap-4 hidden md:flex"
            >
              <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center">
                <ShieldCheck size={28} />
              </div>
              <div>
                <p className="text-sm font-black text-gray-900 leading-none">Safe & Secure</p>
                <p className="text-xs font-bold text-gray-400 mt-1">Verified Luxury</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Quick Amenities */}
      <section className="py-12 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto whitespace-nowrap no-scrollbar flex justify-between items-center gap-12 text-gray-400 font-bold uppercase tracking-[0.2em] text-sm">
          <div className="flex items-center gap-3"><Wifi size={18} /> High Speed Wifi</div>
          <div className="flex items-center gap-3"><Waves size={18} /> Infinity Pool</div>
          <div className="flex items-center gap-3"><Coffee size={18} /> Gourmet Dining</div>
          <div className="flex items-center gap-3"><Wind size={18} /> Nature Trails</div>
          <div className="flex items-center gap-3"><Clock size={18} /> 24h Service</div>
        </div>
      </section>

      {/* Accommodations Preview */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 mb-20">
          <div className="max-w-2xl">
            <h2 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-4">The Collection</h2>
            <h3 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight">Stay in <span className="italic font-serif">Absolute</span> Comfort.</h3>
          </div>
        </div>
        <RoomsPreview />
      </section>

      {/* Services Section */}
      <ServiceSection />

      {/* Gallery & Showcase */}
      <section className="py-32 bg-gray-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h2 className="text-sm font-black text-blue-400 uppercase tracking-widest mb-4">Our Gallery</h2>
            <h3 className="text-5xl md:text-6xl font-black tracking-tight">Glimpses of Paradise.</h3>
          </div>
          <p className="text-gray-400 text-lg max-w-sm font-medium">
            Explore the stunning landscapes and architectural marvels that await you at Anuthama Villa.
          </p>
        </div>
        <Gallery />
      </section>

      {/* Call to Action */}
      <section className="py-32 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-blue-600 rounded-[3rem] p-16 md:p-24 text-white shadow-3xl shadow-blue-200"
          >
            <h4 className="text-5xl md:text-7xl font-black mb-8 leading-tight">Ready for a getaway?</h4>
            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-2xl mx-auto">
              Book your stay today and discover why we are the preferred choice for elite travelers.
            </p>
            <button
              onClick={() => navigate("/roombooking")}
              className="px-12 py-6 bg-white text-blue-600 rounded-2xl font-black text-xl hover:bg-gray-100 transition-all active:scale-95 shadow-xl"
            >
              Check Availability Now
            </button>
          </motion.div>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-50 rounded-full blur-[100px] -z-10" />
      </section>

      <End />
    </div>
  );
};

export default Home;
