import React from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaMapMarkerAlt, FaPhone, FaFax } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-800 to-blue-600 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand Info */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-white">Anuthama Villa</h3>
          <p className="text-blue-100">
            We provide exceptional service and products to help businesses grow
            and thrive. Our team is committed to excellence and customer
            satisfaction.
          </p>
          <div className="flex gap-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-blue-200 transition-colors"
            >
              <FaFacebook size={20} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-blue-200 transition-colors"
            >
              <FaTwitter size={20} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-blue-200 transition-colors"
            >
              <FaInstagram size={20} />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-blue-200 transition-colors"
            >
              <FaLinkedin size={20} />
            </a>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">Contact Info</h3>
          <div className="flex items-start gap-3">
            <FaMapMarkerAlt className="mt-1 text-blue-200" />
            <p className="text-blue-100">123 Business Ave, City, Country</p>
          </div>
          <div className="flex items-center gap-3">
            <FaPhone className="text-blue-200" />
            <p className="text-blue-100">077-692-6012</p>
          </div>
          <div className="flex items-center gap-3">
            <FaFax className="text-blue-200" />
            <p className="text-blue-100">+123 456 788</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <Link 
                to="/about" 
                className="text-blue-100 hover:text-white transition-colors flex items-center gap-2"
              >
                <span className="w-2 h-2 bg-blue-300 rounded-full"></span>
                About Us
              </Link>
            </li>
            {/* <li>
              <Link 
                to="/services" 
                className="text-blue-100 hover:text-white transition-colors flex items-center gap-2"
              >
                <span className="w-2 h-2 bg-blue-300 rounded-full"></span>
                Services
              </Link>
            </li> */}
            <li>
              <Link 
                to="/contactus" 
                className="text-blue-100 hover:text-white transition-colors flex items-center gap-2"
              >
                <span className="w-2 h-2 bg-blue-300 rounded-full"></span>
                Contact Us
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-blue-400 mt-8 pt-6 text-center text-blue-100 text-sm">
        <p>&copy; {new Date().getFullYear()} Anuthama Villa. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;