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
      <section className="relative min-h-[95vh] flex items-center overflow-hidden bg-[#fafafa]">
        {/* Artistic Background Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#f0f4f8] -skew-x-12 translate-x-1/4 -z-10" />
        <motion.div
          initial={{ opacity: 0, scale: 1.2 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute top-20 left-10 w-64 h-64 bg-blue-100/30 rounded-full blur-[100px] -z-10"
        />

        <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full grid lg:grid-cols-12 gap-8 items-center py-24">
          {/* Left Column - Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-8 flex flex-col space-y-10 relative z-10"
          >
            <motion.div variants={itemVariants} className="flex items-center space-x-4">
              <div className="h-px w-12 bg-blue-600" />
              <span className="text-sm font-black text-blue-600 uppercase tracking-[0.4em] mb-1">
                The Pinnacle of Luxury
              </span>
            </motion.div>

            <div className="space-y-4">
              <motion.h1
                variants={itemVariants}
                className="text-7xl md:text-9xl font-black text-gray-900 leading-[0.95] tracking-tighter"
              >
                Timeless<br />
                <span className="italic font-serif font-light text-blue-600/90">Sophistication.</span>
              </motion.h1>
              <motion.div
                variants={itemVariants}
                className="h-2 w-32 bg-gradient-to-r from-blue-600 to-transparent rounded-full ml-1"
              />
            </div>

            <motion.p
              variants={itemVariants}
              className="text-xl md:text-2xl text-gray-500 max-w-xl leading-relaxed font-light font-serif"
            >
              Experience the art of living well at Anuthama Villa. A curated sanctuary where every moment is crafted into a masterpiece of comfort and grace.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-6 pt-4">
              <button
                onClick={() => navigate("/roombooking")}
                className="group relative px-10 py-6 bg-gray-900 text-white overflow-hidden rounded-full font-bold transition-all shadow-2xl hover:shadow-blue-200/50"
              >
                <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <span className="relative z-10 flex items-center gap-3">
                  Reservation
                  <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </span>
              </button>
              <button
                onClick={() => navigate("/about")}
                className="px-10 py-6 bg-transparent text-gray-900 border border-gray-200 rounded-full font-bold hover:bg-gray-50 transition-all hover:border-gray-900"
              >
                Explore Story
              </button>
            </motion.div>

            {/* Micro Stats */}
            <motion.div variants={itemVariants} className="flex items-center gap-12 pt-8 border-t border-gray-100 w-fit">
              <div className="group">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-blue-600 transition-colors">Rating</p>
                <p className="text-2xl font-black text-gray-900">4.9/5.0</p>
              </div>
              <div className="w-px h-10 bg-gray-100" />
              <div className="group">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-blue-600 transition-colors">Service</p>
                <p className="text-2xl font-black text-gray-900">24/7</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Image Showcase */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-4 relative"
          >
            <div className="relative aspect-[4/5] w-full rounded-[3rem] overflow-hidden shadow-default group bg-gray-100">
              <img
                src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=2070"
                alt="Luxury Anuthama Villa"
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000"
              />
              {/* Image Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60" />

              {/* Floating Element */}
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-8 right-8 bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-2xl text-white max-w-[200px]"
              >
                <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Location</p>
                <p className="text-sm font-black leading-tight">Coastal Serenity, Prime Destination</p>
              </motion.div>
            </div>

            {/* Decorative Frames */}
            <div className="absolute -top-6 -right-6 w-full h-full border-2 border-blue-600/20 rounded-[3rem] -z-10 translate-x-2 translate-y-2" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -z-10" />
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
