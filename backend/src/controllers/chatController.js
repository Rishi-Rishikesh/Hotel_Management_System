// // src/controllers/chatController.js
// import Chat from "../models/chat.model.js";

// // ✅ Send Message
// export const sendMessage = async (req, res) => {
//   try {
//     const { senderId, senderName, senderType, receiverId, receiverName, receiverType, message, time } = req.body;

//     if (!senderId || !senderName || !senderType || !receiverId || !receiverName || !receiverType || !message || !time) {
//       return res.status(400).json({ success: false, message: "All fields are required" });
//     }

//     const newMessage = new Chat({
//       senderId,
//       senderName,
//       senderType,
//       receiverId,
//       receiverName,
//       receiverType,
//       message,
//       time,
//     });

//     await newMessage.save();

//     res.status(201).json({ success: true, data: newMessage });
//   } catch (error) {
//     console.error("Error sending message:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// // ✅ Get all messages
// export const getMessages = async (req, res) => {
//   try {
//     const messages = await Chat.find().sort({ createdAt: 1 });
//     res.json({ success: true, data: messages });
//   } catch (error) {
//     console.error("Fetch error:", error);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// };

// // ✅ Update (Edit) Message
// export const updateMessage = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { newText } = req.body;
//     const message = await Chat.findById(id);
//     if (!message) {
//       return res.status(404).json({ success: false, message: "Message not found" });
//     }
//     message.message = newText;
//     message.edited = true;
//     await message.save();
//     res.json({ success: true, data: message });
//   } catch (error) {
//     console.error("Update error:", error);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// };

// // ✅ Delete Message
// export const deleteMessage = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const message = await Chat.findByIdAndDelete(id);
//     if (!message) {
//       return res.status(404).json({ success: false, message: "Message not found" });
//     }
//     res.json({ success: true, message: "Message deleted successfully" });
//   } catch (error) {
//     console.error("Delete error:", error);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// };

// // Get user-specific messages
// export const getUserMessages = async (req, res) => {
//     try {
//       const { userId } = req.params;
//       const messages = await Chat.find({
//         $or: [
//           { senderId: userId },
//           { receiverId: userId }
//         ]
//       }).sort({ createdAt: 1 });
  
//       res.status(200).json({ success: true, data: messages });
//     } catch (error) {
//       console.error("Fetch user messages error:", error);
//       res.status(500).json({ success: false, message: "Server error" });
//     }
//   };
  

//   // src/controllers/chatController.js
// import { askGPT } from "../services/gptService.js";

// export const askGptForReply = async (req, res) => {
//   try {
//     const { userMessage } = req.body;
//     if (!userMessage) {
//       return res.status(400).json({ success: false, message: "Message is required" });
//     }

//     const gptReply = await askGPT(userMessage);
    
//     res.status(200).json({ success: true, reply: gptReply });
//   } catch (error) {
//     console.error("GPT Error:", error);
//     res.status(500).json({ success: false, message: "Failed to get GPT reply" });
//   }
// };
