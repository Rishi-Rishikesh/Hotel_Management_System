import mongoose from "mongoose";
import Chat from "../models/chat.model.js";
import Guest from "../models/guestModel.js";

const formatTime = (date) => {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

const buildDisplayName = (guest) => {
  const fullName = `${guest.fname || ""} ${guest.lname || ""}`.trim();
  return fullName || guest.email || "User";
};

const isAdminRole = (role) => role === "Admin" || role === "Staff";

export const sendMessage = async (req, res) => {
  try {
    const { message, receiverId } = req.body;
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const sender = await Guest.findById(req.user?.mongoId).select("fname lname email role");
    if (!sender) {
      return res.status(404).json({ success: false, message: "Sender not found" });
    }

    const senderType = isAdminRole(sender.role) ? "admin" : "guest";
    const senderName = buildDisplayName(sender);

    let resolvedReceiverId = "admin";
    let receiverName = "Admin";
    let receiverType = "admin";

    if (senderType === "admin") {
      if (!receiverId || !mongoose.Types.ObjectId.isValid(receiverId)) {
        return res.status(400).json({ success: false, message: "Valid receiverId is required for admins" });
      }
      const receiver = await Guest.findById(receiverId).select("fname lname email role");
      if (!receiver) {
        return res.status(404).json({ success: false, message: "Receiver not found" });
      }
      resolvedReceiverId = receiver._id.toString();
      receiverName = buildDisplayName(receiver);
      receiverType = isAdminRole(receiver.role) ? "admin" : "guest";
    }

    const chatMessage = await Chat.create({
      senderId: sender._id.toString(),
      senderName,
      senderType,
      receiverId: resolvedReceiverId,
      receiverName,
      receiverType,
      message: message.trim(),
      time: formatTime(new Date()),
    });

    const io = req.app.get("io");
    if (io) {
      io.emit("receive_message", chatMessage);
    }

    res.status(201).json({ success: true, data: chatMessage });
  } catch (error) {
    console.error("sendMessage error:", error.message);
    res.status(500).json({ success: false, message: "Server error sending message" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const role = req.user?.role;
    if (!isAdminRole(role)) {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }
    const messages = await Chat.find().sort({ createdAt: 1 });
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error("getMessages error:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching messages" });
  }
};

export const getUserMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const role = req.user?.role;
    if (!isAdminRole(role) && req.user?.mongoId !== userId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const messages = await Chat.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    }).sort({ createdAt: 1 });

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error("getUserMessages error:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching user messages" });
  }
};

export const updateMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { newText } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid message ID" });
    }
    if (!newText || typeof newText !== "string" || !newText.trim()) {
      return res.status(400).json({ success: false, message: "New text is required" });
    }

    const message = await Chat.findById(id);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    const role = req.user?.role;
    if (message.senderId !== req.user?.mongoId && !isAdminRole(role)) {
      return res.status(403).json({ success: false, message: "Not allowed to edit this message" });
    }

    message.message = newText.trim();
    message.edited = true;
    await message.save();

    const io = req.app.get("io");
    if (io) {
      io.emit("message_edited", message);
    }

    res.status(200).json({ success: true, data: message });
  } catch (error) {
    console.error("updateMessage error:", error.message);
    res.status(500).json({ success: false, message: "Server error updating message" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid message ID" });
    }

    const message = await Chat.findById(id);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    const role = req.user?.role;
    if (message.senderId !== req.user?.mongoId && !isAdminRole(role)) {
      return res.status(403).json({ success: false, message: "Not allowed to delete this message" });
    }

    await Chat.findByIdAndDelete(id);

    const io = req.app.get("io");
    if (io) {
      io.emit("message_deleted", id);
    }

    res.status(200).json({ success: true, message: "Message deleted successfully" });
  } catch (error) {
    console.error("deleteMessage error:", error.message);
    res.status(500).json({ success: false, message: "Server error deleting message" });
  }
};
