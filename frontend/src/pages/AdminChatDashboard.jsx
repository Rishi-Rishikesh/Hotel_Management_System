import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../AuthContext";

function AdminChatDashboard() {
  const { token, role } = useAuth();
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedGuestId, setSelectedGuestId] = useState("");
  const [sendError, setSendError] = useState("");
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const userIdRef = useRef(null);

  useEffect(() => {
    userIdRef.current = currentUser?._id || null;
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser?._id) return;
    setMessages((prev) =>
      prev.map((msg) => ({
        ...msg,
        self: msg.senderId === currentUser._id,
      }))
    );
  }, [currentUser]);

  useEffect(() => {
    const socket = io("http://localhost:4000", {
      transports: ["websocket"],
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on("receive_message", (data) => {
      setMessages((prev) => {
        if (prev.some((msg) => msg._id === data._id)) return prev;
        return [
          ...prev,
          { ...data, self: data.senderId === userIdRef.current },
        ];
      });
    });

    socket.on("message_edited", (updatedMessage) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === updatedMessage._id
            ? { ...msg, message: updatedMessage.message, edited: true }
            : msg
        )
      );
    });

    socket.on("message_deleted", (id) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== id));
    });

    return () => {
      socket.off("receive_message");
      socket.off("message_edited");
      socket.off("message_deleted");
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setLoadingUser(false);
        return;
      }
      try {
        const response = await axios.get(
          "http://localhost:4000/api/users/me",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data?.user) {
          setCurrentUser(response.data.user);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchProfile();
  }, [token]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!token) return;
      try {
        const response = await axios.get("http://localhost:4000/api/chats/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success && response.data.data) {
          setMessages(
            response.data.data.map((msg) => ({
              ...msg,
              self: msg.senderId === userIdRef.current,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [token]);

  const guestOptions = useMemo(() => {
    const map = new Map();
    messages.forEach((msg) => {
      const guestId =
        msg.senderType === "guest" ? msg.senderId : msg.receiverId;
      if (!guestId || guestId === "admin") return;
      const guestName =
        msg.senderType === "guest" ? msg.senderName : msg.receiverName;
      if (!map.has(guestId)) {
        map.set(guestId, guestName || "Guest");
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [messages]);

  useEffect(() => {
    if (!selectedGuestId && guestOptions.length > 0) {
      setSelectedGuestId(guestOptions[0].id);
    }
  }, [guestOptions, selectedGuestId]);

  const filteredMessages = useMemo(() => {
    if (!selectedGuestId) return messages;
    return messages.filter(
      (msg) =>
        msg.senderId === selectedGuestId ||
        msg.receiverId === selectedGuestId
    );
  }, [messages, selectedGuestId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [filteredMessages]);

  const sendMessage = async () => {
    setSendError("");
    if (!message.trim() || !token) return;
    if (!selectedGuestId) {
      setSendError("Select a guest to reply.");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:4000/api/chats/send",
        { message, receiverId: selectedGuestId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newMessage = response.data.data;
      setMessages((prev) => {
        if (prev.some((msg) => msg._id === newMessage._id)) return prev;
        return [...prev, { ...newMessage, self: true }];
      });
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      setSendError("Failed to send message.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <span className="text-gray-700">Loading chat...</span>
      </div>
    );
  }

  if (!token || !currentUser || (role !== "Admin" && role !== "Staff")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-700 mb-4">
            Admin access is required to view this page.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-6 flex flex-col"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Admin Chat Dashboard
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Back
          </motion.button>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <label className="text-sm text-gray-700">Reply to:</label>
          <select
            value={selectedGuestId}
            onChange={(e) => setSelectedGuestId(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="">Select guest</option>
            {guestOptions.map((guest) => (
              <option key={guest.id} value={guest.id}>
                {guest.name}
              </option>
            ))}
          </select>
          {sendError && <span className="text-sm text-red-600">{sendError}</span>}
        </div>

        <div className="flex-1 overflow-y-auto mb-4 p-2 space-y-2">
          {filteredMessages.map((msg) => (
            <motion.div
              key={msg._id || `${msg.senderId}-${msg.time}-${msg.message}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`max-w-xs p-3 rounded-lg shadow-md ${
                msg.self
                  ? "bg-gradient-to-r from-green-400 to-green-600 text-white ml-auto"
                  : "bg-gray-300 text-gray-800 mr-auto"
              }`}
            >
              <p>{msg.message}</p>
              <div className="flex justify-between mt-2 text-xs opacity-70">
                <span>{msg.time} {msg.edited ? "(edited)" : ""}</span>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex items-center gap-2 mt-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a reply..."
            className="flex-1 p-3 border rounded-lg focus:outline-none"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={sendMessage}
            className="bg-blue-600 text-white px-5 py-3 rounded-lg"
          >
            Send
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

export default AdminChatDashboard;
