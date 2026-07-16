import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Coffee, Wifi, Waves } from "lucide-react";
import RoomsPreview from "../components/RoomsPreview";
import End from "../components/End";

const Home = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <div className="bg-white selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center bg-[#fafafa] overflow-hidden">
        {/* bg blobs */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#eef2f7] -skew-x-6 translate-x-1/4 -z-10" />
        <motion.div
          initial={{ opacity: 0, scale: 1.2 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2 }}
          className="absolute top-20 left-10 w-72 h-72 bg-blue-100/40 rounded-full blur-[120px] -z-10"
        />

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 grid lg:grid-cols-2 gap-12 items-center py-28">

          {/* Left */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col space-y-8"
          >
            <motion.div variants={itemVariants} className="flex items-center gap-4">
              <div className="h-px w-10 bg-blue-600" />
              <span className="text-xs font-black text-blue-600 uppercase tracking-[0.4em]">
                The Pinnacle of Luxury
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-gray-900 leading-[0.95] tracking-tighter"
            >
              Timeless<br />
              <span className="italic font-serif font-light text-blue-600">Sophistication.</span>
            </motion.h1>

            <motion.div
              variants={itemVariants}
              className="h-1.5 w-28 bg-gradient-to-r from-blue-600 to-transparent rounded-full"
            />

            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl text-gray-500 max-w-lg leading-relaxed font-light font-serif"
            >
              Experience the art of living well at Anuthama Villa — a curated sanctuary where every moment is crafted into a masterpiece of comfort and grace.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => navigate("/roombooking")}
                className="group relative px-8 py-4 bg-gray-900 text-white overflow-hidden rounded-full font-bold transition-all shadow-xl hover:shadow-blue-200/50"
              >
                <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <span className="relative z-10 flex items-center gap-3">
                  Book a Room
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              <button
                onClick={() => navigate("/about")}
                className="px-8 py-4 border border-gray-300 text-gray-900 rounded-full font-bold hover:bg-gray-50 hover:border-gray-900 transition-all"
              >
                Explore Story
              </button>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center gap-10 pt-6 border-t border-gray-100 w-fit">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Rating</p>
                <p className="text-2xl font-black text-gray-900">4.9 / 5.0</p>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Service</p>
                <p className="text-2xl font-black text-gray-900">24 / 7</p>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Suites</p>
                <p className="text-2xl font-black text-gray-900">15 +</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right — Image */}
          <motion.div
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full"
          >
            <div className="relative aspect-[4/5] w-full rounded-[2.5rem] overflow-hidden shadow-2xl group bg-gray-100">
              <img
                src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=2070"
                alt="Anuthama Villa"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-6 right-6 bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-2xl text-white max-w-[180px]"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">Location</p>
                <p className="text-sm font-black leading-snug">Coastal Serenity, Prime Destination</p>
              </motion.div>
            </div>

            <div className="absolute -top-4 -right-4 w-full h-full border-2 border-blue-600/20 rounded-[2.5rem] -z-10" />
            <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-blue-400/10 rounded-full blur-2xl -z-10" />
          </motion.div>
        </div>
      </section>

      {/* ── Feature Cards ── */}
      <section className="py-24 bg-white">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">

          <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-16">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-blue-600 font-black tracking-[0.4em] uppercase text-xs mb-3 block">The Experience</span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tighter leading-none mb-6">
                Curated Spaces for<br />
                <span className="italic font-serif font-light text-blue-600">Exceptional</span> Living.
              </h2>
              <p className="text-gray-500 text-base sm:text-lg leading-relaxed max-w-lg">
                At Anuthama, luxury lives in the details — from handcrafted linens to bespoke morning views.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="hidden md:flex gap-3"
            >
              {[Wifi, Waves, Coffee].map((Icon, i) => (
                <div key={i} className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-blue-600">
                  <Icon size={22} />
                </div>
              ))}
            </motion.div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              image="https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=1974"
              title="Serene Sanctuaries"
              desc="Intelligently designed rooms blending tropical aesthetics with modern comfort."
              link="/roombooking"
            />
            <FeatureCard
              image="https://images.unsplash.com/photo-1544124499-58912cbddaad?auto=format&fit=crop&q=80&w=1974"
              title="Culinary Artistry"
              desc="Local ingredients meet international culinary techniques on every plate."
              link="/foodordering"
            />
            <FeatureCard
              image="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=2070"
              title="Unforgettable Events"
              desc="Transform your special moments into lifelong memories in our elegant spaces."
              link="/eventbooking"
            />
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="py-20 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
          <div className="w-[700px] h-[700px] border border-white rounded-full" />
          <div className="absolute w-[500px] h-[500px] border border-white rounded-full" />
        </div>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 grid grid-cols-2 md:grid-cols-4 gap-10 text-center relative z-10">
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
              <h3 className="text-4xl sm:text-5xl font-black mb-2">{stat.n}</h3>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">{stat.t}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Rooms Preview ── */}
      <section className="pt-28 pb-12 bg-[#fafafa]">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
          <div className="flex flex-col sm:flex-row items-end justify-between gap-6 mb-14">
            <div>
              <span className="text-blue-600 font-black tracking-[0.4em] uppercase text-xs mb-3 block">The Collection</span>
              <h3 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight">
                Stay in <span className="italic font-serif font-light">Absolute</span> Comfort.
              </h3>
            </div>
            <button
              onClick={() => navigate("/roombooking")}
              className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-900 hover:text-blue-600 transition-colors group whitespace-nowrap"
            >
              See all rooms <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
        <RoomsPreview />
      </section>

      {/* ── Gallery ── */}
      <section className="py-28 bg-white">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 mb-16">
          <span className="text-blue-600 font-black tracking-[0.4em] uppercase text-xs mb-3 block">Visual Story</span>
          <h3 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight">
            A Glimpse of <span className="italic font-serif font-light">Paradise.</span>
          </h3>
        </div>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { src: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=800", cls: "aspect-square" },
              { src: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&q=80&w=800", cls: "aspect-[3/4] md:mt-8" },
              { src: "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=800", cls: "aspect-square" },
              { src: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800", cls: "aspect-[3/4] md:-mt-8" },
            ].map(({ src, cls }, i) => (
              <div key={i} className={`${cls} rounded-[1.5rem] overflow-hidden group`}>
                <img src={src} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Gallery" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 bg-[#fafafa]">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gray-900 rounded-[2.5rem] p-10 sm:p-16 lg:p-24 text-white flex flex-col items-center text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-5 flex items-center justify-center pointer-events-none select-none">
              <span className="text-[12rem] sm:text-[18rem] font-black tracking-tighter">ANUTHAMA</span>
            </div>
            <span className="text-blue-400 font-black tracking-[0.4em] uppercase text-xs mb-6 relative z-10">Reservations</span>
            <h4 className="text-4xl sm:text-6xl lg:text-8xl font-black mb-8 leading-[0.9] tracking-tighter relative z-10">
              Ready for a<br />
              <span className="text-blue-400 italic font-serif font-light">Getaway?</span>
            </h4>
            <div className="flex flex-col sm:flex-row gap-4 relative z-10">
              <button
                onClick={() => navigate("/roombooking")}
                className="px-10 py-5 bg-blue-600 text-white rounded-full font-black text-base hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-500/20"
              >
                Book Your Stay
              </button>
              <button
                onClick={() => navigate("/contactus")}
                className="px-10 py-5 bg-white/10 border border-white/20 text-white rounded-full font-black text-base hover:bg-white/20 transition-all active:scale-95"
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

const FeatureCard = ({ image, title, desc, link }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group cursor-pointer"
      onClick={() => navigate(link)}
    >
      <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden mb-6 shadow-lg bg-gray-100">
        <img src={image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={title} />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent" />
      </div>
      <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm sm:text-base leading-relaxed mb-4">{desc}</p>
      <span className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-blue-600 group-hover:text-blue-700 transition-colors">
        Discover More <ArrowRight size={15} />
      </span>
    </motion.div>
  );
};

export default Home;
