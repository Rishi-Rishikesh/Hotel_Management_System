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
        <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl font-bold text-gray-900 mb-4"
                    >
                        Our Luxurious <span className="text-blue-600">Rooms</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-600 max-w-2xl mx-auto"
                    >
                        Experience unparalleled comfort in our meticulously designed rooms, where every detail is tailored for your relaxation.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {rooms.map((room, index) => (
                        <motion.div
                            key={room._id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -10 }}
                            className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300"
                        >
                            <div className="relative h-64 overflow-hidden">
                                <img
                                    src={imageMap[room.type] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"}
                                    alt={room.type}
                                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                />
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-blue-600 font-bold text-sm shadow-md">
                                    LKR {room.pricePerNight} / Night
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{room.type} Room {room.roomNumber}</h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {room.description || "A beautiful room with modern amenities and a great view."}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center text-gray-500 text-sm">
                                        <svg className="w-4 h-4 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                        </svg>
                                        Up to {room.capacity} Guests
                                    </span>
                                    <Link
                                        to="/roombooking"
                                        className="text-blue-600 font-semibold hover:text-blue-700 transition-colors flex items-center"
                                    >
                                        View & Book
                                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <Link
                        to="/roombooking"
                        className="inline-flex items-center bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-blue-700 hover:shadow-blue-200 transition-all active:scale-95"
                    >
                        Explore All Rooms
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default RoomsPreview;
