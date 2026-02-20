// 📦 src/models/chatModel.js
import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    senderType: { type: String, enum: ["guest", "admin"], required: true },
    receiverId: { type: String, required: true },
    receiverName: { type: String, required: true },
    receiverType: { type: String, enum: ["guest", "admin"], required: true },
    message: { type: String, required: true },
    time: { type: String, required: true },
    edited: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
