import React, { useState } from "react";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, message } = formData;

    if (!name || !email || !message) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      // Mocking submission for now - replace with actual endpoint
      toast.success("Message sent successfully!");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen pt-24">
      {/* Header Section */}
      <section className="py-20 bg-gray-900 text-white overflow-hidden relative">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -mr-48 -mt-48" />

        <div className="max-w-7xl mx-auto px-6 text-center space-y-8 relative z-10">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter"
          >
            Contact <span className="italic font-serif font-light text-blue-400">Us.</span>
          </motion.h1>
          <p className="text-xl text-gray-400 font-serif font-light max-w-2xl mx-auto">
            Whether you have a question about our villas, or just want to say hello, we'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Main Content: Info & Form */}
      <section className="py-32 max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-20">
        {/* Left: Contact Info */}
        <div className="lg:col-span-4 space-y-16">
          <div className="space-y-4">
            <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.4em]">Get in Touch</h2>
            <h3 className="text-4xl font-black text-gray-900 leading-tight">We are here<br />for you.</h3>
          </div>

          <div className="space-y-10">
            <div className="flex items-start gap-6 group">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <FaPhoneAlt size={20} />
              </div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Call Us</p>
                <p className="text-xl font-black text-gray-900">+94 123 456 789</p>
              </div>
            </div>

            <div className="flex items-start gap-6 group">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <FaEnvelope size={20} />
              </div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Email Us</p>
                <p className="text-xl font-black text-gray-900">info@anuthamavilla.com</p>
              </div>
            </div>

            <div className="flex items-start gap-6 group">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <FaMapMarkerAlt size={20} />
              </div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Our Location</p>
                <p className="text-xl font-black text-gray-900">29 Sri Sudharmarama Mawatha, Wattala, Sri Lanka</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="lg:col-span-8 bg-[#fafafa] p-12 md:p-16 rounded-[3rem] shadow-xl border border-gray-100"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                <input
                  id="name"
                  type="text"
                  placeholder="Your Name"
                  className="w-full bg-white border border-gray-100 p-5 rounded-2xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all font-medium text-gray-900"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Your Email"
                  className="w-full bg-white border border-gray-100 p-5 rounded-2xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all font-medium text-gray-900"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-1">Your Message</label>
              <textarea
                id="message"
                placeholder="How can we help you?"
                className="w-full bg-white border border-gray-100 p-5 rounded-2xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all font-medium text-gray-900 h-48 resize-none"
                value={formData.message}
                onChange={handleChange}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative px-12 py-6 bg-gray-900 text-white rounded-full font-black text-lg shadow-2xl hover:shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
            >
              <span className="relative z-10 flex items-center gap-3">
                {isSubmitting ? "Sending..." : "Send Message"}
                <div className="translate-x-0 group-hover:translate-x-2 transition-transform">→</div>
              </span>
            </button>
          </form>
        </motion.div>
      </section>

      {/* Map Section or Additional Visual */}
      <section className="h-[500px] w-full bg-gray-200">
        <iframe
          className="w-full h-full grayscale-[0.3] contrast-[1.1] hover:grayscale-0 transition-all duration-1000"
          src="https://maps.google.com/maps?q=Anuthama%20Villa%20Wattala&t=&z=15&ie=UTF8&iwloc=&output=embed"
          allowFullScreen=""
          loading="lazy"
          title="Google Map"
        ></iframe>
      </section>
    </div>
  );
};

export default ContactUs;