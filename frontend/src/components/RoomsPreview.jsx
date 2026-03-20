import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import singleRoom from "../assets/room 4.jpeg";
import doubleRoom from "../assets/room 3.jpg";
import suiteRoom from "../assets/room 5.jpg";

const RoomsPreview = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    const imageMap = {
        Single: singleRoom,
        Double: doubleRoom,
        Suite: suiteRoom,
    };

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await axios.get("http://localhost:4000/api/rooms/public");
                if (response.data.success) {
                    const roomsData = Array.isArray(response.data.rooms) ? response.data.rooms :
                        Array.isArray(response.data.data) ? response.data.data : [];
                    setRooms(roomsData.slice(0, 3)); // Only show top 3
                }
            } catch (error) {
                console.error("Error fetching rooms preview:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRooms();
    }, []);

    if (loading) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {rooms.map((room, index) => (
                    <motion.div
                        key={room._id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -10 }}
                        className="bg-white rounded-3xl overflow-hidden shadow-default hover:shadow-2xl transition-all duration-500 border border-gray-100"
                    >
                        <div className="relative h-72 overflow-hidden">
                            <img
                                src={imageMap[room.type] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"}
                                alt={room.type}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl text-blue-600 font-black text-sm shadow-xl">
                                LKR {room.pricePerNight}
                            </div>
                        </div>
                        <div className="p-8">
                            <h3 className="text-2xl font-black text-gray-900 mb-2">{room.type} Suite</h3>
                            <p className="text-gray-500 text-sm mb-6 line-clamp-2 font-medium">
                                {room.description || "A luxury sanctuary where contemporary design meets tropical elegance."}
                            </p>
                            <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                <span className="flex items-center text-gray-400 font-bold text-xs uppercase tracking-widest">
                                    Capacity: {room.capacity} Guests
                                </span>
                                <Link
                                    to="/roombooking"
                                    className="text-blue-600 font-black text-sm uppercase tracking-widest hover:text-blue-700 transition-colors flex items-center gap-2"
                                >
                                    Book Now
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="text-center mt-20">
                <Link
                    to="/roombooking"
                    className="inline-flex items-center bg-gray-900 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-blue-600 transition-all active:scale-95"
                >
                    View All Accommodations
                </Link>
            </div>
        </div>
    );
};

export default RoomsPreview;
