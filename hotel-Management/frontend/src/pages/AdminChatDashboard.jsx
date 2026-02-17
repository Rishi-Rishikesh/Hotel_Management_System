import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const socket = io("http://localhost:4000", {
  transports: ["websocket"],
  withCredentials: true,
});

function AdminChatDashboard() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Fetch all chat history
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/chats/all", { withCredentials: true });
        if (response.data.success && response.data.data) {
          const loadedMessages = response.data.data.map((msg) => ({
            ...msg,
            self: msg.senderType === "admin", // Admin's own messages
          }));
          setMessages(loadedMessages);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, []);

  // Receive new messages realtime
  useEffect(() => {
    socket.on("receive_message", (data) => {
      console.log("Realtime message received:", data);
      setMessages((prev) => [...prev, { ...data, self: data.senderType === "admin" }]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (message.trim() !== "") {
      const now = new Date();
      const formattedTime = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');

      const messageData = {
        senderId: "admin-123", // Fixed Admin ID
        senderName: "Admin",
        senderType: "admin",
        receiverId: "guest-user-123", // Hardcoded Guest User
        receiverName: "Guest User",
        receiverType: "guest",
        message: message,
        time: formattedTime,
      };

      socket.emit("send_message", messageData);

      try {
        await axios.post("http://localhost:4000/api/chats/send", messageData, { withCredentials: true });
        console.log("Message saved to MongoDB ✅");
      } catch (error) {
        console.error("Error saving message:", error);
      }

      setMessages((prev) => [...prev, { ...messageData, self: true }]);
      setMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-6 flex flex-col"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Admin Chat Dashboard</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Back
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto mb-4 p-2 space-y-2">
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`max-w-xs p-3 rounded-lg shadow-md ${
                msg.self
                  ? "bg-gradient-to-r from-green-400 to-green-600 text-white ml-auto"
                  : "bg-gray-300 text-gray-800 mr-auto"
              }`}
            >
              <p className="break-words">{msg.message}</p>
              <p className="text-xs text-right opacity-70 mt-1">{msg.time}</p>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex items-center gap-2 mt-4">
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a reply..."
            className="flex-1 p-3 border rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-green-300"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={sendMessage}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-3 rounded-full shadow-md"
          >
            Reply
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

export default AdminChatDashboard;

