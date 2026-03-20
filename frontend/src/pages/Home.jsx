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

      {/* Premium Experience Section - Replacement for Amenities/Accommodations/Services */}
      <section className="py-24 relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-20">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl"
            >
              <span className="text-blue-600 font-black tracking-[0.4em] uppercase text-xs mb-4 block">The Experience</span>
              <h2 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter leading-none mb-8">
                Curated Spaces for <br />
                <span className="italic font-serif font-light text-blue-600">Exceptional</span> Living.
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed max-w-lg">
                At Anuthama, we believe luxury lies in the details. From our handcrafted linens to the bespoke morning views, every element is designed to resonate with your soul.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="hidden md:flex gap-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-blue-600 border border-gray-100">
                <Wifi size={24} />
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-blue-600 border border-gray-100">
                <Waves size={24} />
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-blue-600 border border-gray-100">
                <Coffee size={24} />
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <FeatureCard
              image="https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=1974"
              title="Serene Sanctuaries"
              desc="Intelligently designed rooms that blend tropical aesthetics with modern comfort."
              link="/roombooking"
            />
            <FeatureCard
              image="https://images.unsplash.com/photo-1544124499-58912cbddaad?auto=format&fit=crop&q=80&w=1974"
              title="Culinary Artistry"
              desc="Explore a menu where local ingredients meet international culinary techniques."
              link="/foodordering"
            />
            <FeatureCard
              image="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=2070"
              title="Unforgettable Events"
              desc="Transform your special moments into lifelong memories in our elegant event spaces."
              link="/eventbooking"
            />
          </div>
        </div>
      </section>

      {/* Stats/Highlight Section */}
      <section className="py-20 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white rounded-full scale-110" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white rounded-full scale-125" />
        </div>

        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 text-center relative z-10">
          {[
            { n: "15+", t: "Luxury Suites" },
            { n: "4.9", t: "Guest Rating" },
            { n: "24/7", t: "Butler Service" },
            { n: "100%", t: "Privacy Guaranteed" }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <h3 className="text-5xl font-black mb-2">{stat.n}</h3>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">{stat.t}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Accommodations Preview Title Only */}
      <section className="pt-32 pb-12 bg-[#fafafa]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16">
            <div className="max-w-2xl">
              <span className="text-blue-600 font-black tracking-[0.4em] uppercase text-xs mb-4 block">The Collection</span>
              <h3 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight">Stay in <span className="italic font-serif">Absolute</span> Comfort.</h3>
            </div>
            <button
              onClick={() => navigate("/roombooking")}
              className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-gray-900 hover:text-blue-600 transition-colors group"
            >
              See all rooms <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
        <RoomsPreview />
      </section>

      {/* Gallery Section - Full width artistic */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 mb-20">
          <div className="flex flex-col md:flex-row items-end justify-between gap-8">
            <div>
              <span className="text-blue-600 font-black tracking-[0.4em] uppercase text-xs mb-4 block">Visual Story</span>
              <h3 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight">A Glimpse of <span className="italic font-serif">Paradise.</span></h3>
            </div>
          </div>
        </div>
        <div className="px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-[1600px] mx-auto">
            <div className="aspect-square rounded-[2rem] overflow-hidden group">
              <img src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Villa View" />
            </div>
            <div className="aspect-[3/4] rounded-[2rem] overflow-hidden mt-8 group md:translate-y-8">
              <img src="https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Pool Area" />
            </div>
            <div className="aspect-square rounded-[2rem] overflow-hidden group">
              <img src="https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Room Interior" />
            </div>
            <div className="aspect-[3/4] rounded-[2rem] overflow-hidden mt-8 group md:-translate-y-8">
              <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Dining Experience" />
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action - Elevated card */}
      <section className="py-32 relative overflow-hidden bg-[#fafafa]">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gray-900 rounded-[3.5rem] p-12 md:p-24 text-white shadow-3xl flex flex-col items-center text-center relative overflow-hidden"
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
              <span className="text-[20rem] font-black pointer-events-none select-none tracking-tighter">ANUTHAMA</span>
            </div>

            <span className="text-blue-500 font-black tracking-[0.4em] uppercase text-xs mb-8 block relative z-10">Reservations</span>
            <h4 className="text-5xl md:text-8xl font-black mb-10 leading-[0.9] tracking-tighter relative z-10">Ready for a <br /><span className="text-blue-500 italic font-serif font-light">Getaway?</span></h4>
            <div className="flex flex-col sm:flex-row gap-6 relative z-10">
              <button
                onClick={() => navigate("/roombooking")}
                className="px-12 py-6 bg-blue-600 text-white rounded-full font-black text-lg hover:bg-blue-700 transition-all active:scale-95 shadow-2xl shadow-blue-500/20"
              >
                Book Your Stay
              </button>
              <button
                onClick={() => navigate("/contactus")}
                className="px-12 py-6 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full font-black text-lg hover:bg-white/20 transition-all active:scale-95"
              >
                Inquire Service
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <End />
    </div>
  );
};

// Helper component for Feature Cards
const FeatureCard = ({ image, title, desc, link }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group"
    >
      <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden mb-8 shadow-xl bg-gray-100">
        <img src={image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={title} />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent" />
      </div>
      <h3 className="text-2xl font-black text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-500 font-medium mb-6 leading-relaxed">{desc}</p>
      <button
        onClick={() => navigate(link)}
        className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors"
      >
        Discover More <ArrowRight size={16} />
      </button>
    </motion.div>
  );
};

export default Home;
