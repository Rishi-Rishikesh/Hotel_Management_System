import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const socket = io("http://localhost:4000", {
  transports: ["websocket"],
  withCredentials: true,
});

function ChatContainer() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [menuOpenId, setMenuOpenId] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const user = {
    _id: "guest-user-123",
    fname: "Guest",
    lname: "User",
  };

  useEffect(() => {
    fetchMessages();

    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, { ...data, self: data.senderId === user._id }]);
    });

    socket.on("message_edited", (updatedMessage) => {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === updatedMessage._id ? { ...msg, message: updatedMessage.message, edited: true } : msg))
      );
    });

    socket.on("message_deleted", (id) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== id));
    });

    return () => {
      socket.off("receive_message");
      socket.off("message_edited");
      socket.off("message_deleted");
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`http://localhost:4000/api/chats/mine/${user._id}`, { withCredentials: true });
      setMessages(
        res.data.data.map((msg) => ({
          ...msg,
          self: msg.senderId === user._id,
        }))
      );
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };
  

  const handleSendMessage = async () => {
    if (message.trim() !== "") {
      const now = new Date();
      const formattedTime = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');

      const messageData = {
        senderId: user._id,
        senderName: user.fname + " " + user.lname,
        senderType: "guest",
        receiverId: "admin-123",
        receiverName: "Admin",
        receiverType: "admin",
        message: message,
        time: formattedTime,
      };

      try {
        const res = await axios.post("http://localhost:4000/api/chats/send", messageData, { withCredentials: true });
        socket.emit("send_message", res.data.data);

        setMessages((prev) => [...prev, { ...res.data.data, self: true }]);
        setMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const handleEditMessage = (msg) => {
    setEditingMessageId(msg._id);
    setEditingText(msg.message);
    setMenuOpenId(null);
  };

  const saveEditedMessage = async () => {
    if (!editingText.trim()) return;

    try {
      const res = await axios.put(`http://localhost:4000/api/chats/update/${editingMessageId}`, { newText: editingText }, { withCredentials: true });
      const updatedMessage = res.data.data;

      socket.emit("edit_message", updatedMessage);

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === updatedMessage._id ? { ...msg, message: updatedMessage.message, edited: true } : msg
        )
      );
      setEditingMessageId(null);
      setEditingText("");
    } catch (error) {
      console.error("Error saving edited message:", error);
    }
  };

  const deleteMessage = async (id) => {
    try {
      await axios.delete(`http://localhost:4000/api/chats/delete/${id}`, { withCredentials: true });
      socket.emit("delete_message", id);

      setMessages((prev) => prev.filter((msg) => msg._id !== id));
      setMenuOpenId(null);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSendMessage();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 flex flex-col"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Chat with Support</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
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
              className={`relative max-w-xs p-3 rounded-lg shadow-md ${
                msg.self ? "bg-gradient-to-r from-purple-500 to-pink-400 text-white ml-auto" : "bg-gray-300 mr-auto text-gray-800"
              }`}
            >
              {msg.self && (
                <div className="absolute top-2 right-2">
                  <button onClick={() => setMenuOpenId(menuOpenId === msg._id ? null : msg._id)}>
                    ⋯
                  </button>
                  {menuOpenId === msg._id && (
                    <div className="absolute right-0 mt-2 bg-white border rounded shadow-lg text-gray-800 z-10">
                      <button onClick={() => handleEditMessage(msg)} className="block px-4 py-2 hover:bg-gray-100 w-full text-left">Edit</button>
                      <button onClick={() => deleteMessage(msg._id)} className="block px-4 py-2 hover:bg-gray-100 w-full text-left">Delete</button>
                    </div>
                  )}
                </div>
              )}

              {editingMessageId === msg._id ? (
                <div>
                  <input
                    className="w-full p-2 rounded text-black"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && saveEditedMessage()}
                  />
                  <button onClick={saveEditedMessage} className="text-sm bg-green-500 mt-1 px-2 py-1 rounded text-white">
                    Save
                  </button>
                </div>
              ) : (
                <>
                  <p>{msg.message}</p>
                  <div className="flex justify-between mt-2 text-xs opacity-70">
                    <span>{msg.time} {msg.edited ? "(edited)" : ""}</span>
                  </div>
                </>
              )}
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex items-center gap-2 mt-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-3 rounded-full shadow-lg">
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 p-3 rounded-full border-none focus:outline-none text-white placeholder-white bg-transparent"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            className="bg-white text-purple-700 font-bold px-5 py-3 rounded-full shadow-md"
          >
            Send
          </motion.button>
        </div>

      </motion.div>
    </div>
  );
}

export default ChatContainer;
