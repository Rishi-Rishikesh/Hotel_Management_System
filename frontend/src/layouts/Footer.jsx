import React from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaMapMarkerAlt, FaPhone, FaEnvelope } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-950 text-white pt-24 pb-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-16">
        {/* Brand Column */}
        <div className="md:col-span-5 space-y-8">
          <div className="flex flex-col -space-y-1">
            <span className="text-3xl font-black tracking-tighter">ANUTHAMA</span>
            <span className="text-xs font-bold text-blue-500 tracking-[0.4em] uppercase">Boutique Villa</span>
          </div>
          <p className="text-gray-500 text-lg font-serif italic max-w-sm leading-relaxed">
            "Where every sunset tells a story, and every stay becomes a timeless memory."
          </p>
          <div className="flex gap-6">
            {[FaFacebook, FaTwitter, FaInstagram, FaLinkedin].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-blue-500 hover:bg-blue-500/10 transition-all duration-300"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        {/* Info Column */}
        <div className="md:col-span-4 space-y-8">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.3em]">Contact</h3>
          <div className="space-y-6">
            <div className="flex items-start gap-4 text-gray-400 group">
              <FaMapMarkerAlt className="mt-1 text-blue-500" size={18} />
              <p className="font-medium group-hover:text-white transition-colors leading-relaxed">
                29 Sri Sudharmarama Mawatha,<br />Wattala, Sri Lanka
              </p>
            </div>
            <div className="flex items-center gap-4 text-gray-400 group">
              <FaPhone className="text-blue-500" size={18} />
              <p className="font-medium group-hover:text-white transition-colors">+94 123 456 789</p>
            </div>
            <div className="flex items-center gap-4 text-gray-400 group">
              <FaEnvelope className="text-blue-500" size={18} />
              <p className="font-medium group-hover:text-white transition-colors">hello@anuthamavilla.lk</p>
            </div>
          </div>
        </div>

        {/* Links Column */}
        <div className="md:col-span-3 space-y-8">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.3em]">Explore</h3>
          <ul className="space-y-4">
            {['About', 'Rooms', 'Dining', 'Privacy Policy'].map(item => (
              <li key={item}>
                <Link
                  to={item === 'About' ? '/about' : '#'}
                  className="text-gray-400 hover:text-blue-500 font-medium transition-colors flex items-center gap-2 group"
                >
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Underline & Copyright */}
      <div className="max-w-7xl mx-auto px-6 mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-gray-600 text-sm font-medium">
          © {new Date().getFullYear()} Anuthama Boutique Villa. Handcrafted Excellence.
        </p>
        <div className="flex gap-8 text-gray-600 text-xs font-black uppercase tracking-widest">
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Sitemap</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;