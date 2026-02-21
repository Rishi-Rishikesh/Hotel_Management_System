import express from "express";
import {
  sendMessage,
  getUserMessages,
  getMessages,
  updateMessage,
  deleteMessage,
} from "../controllers/chatController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/send", authMiddleware(["User", "Admin", "Staff"]), sendMessage);
router.get("/all", authMiddleware(["Admin", "Staff"]), getMessages);
router.put("/update/:id", authMiddleware(["User", "Admin", "Staff"]), updateMessage);
router.delete("/delete/:id", authMiddleware(["User", "Admin", "Staff"]), deleteMessage);
router.get("/mine/:userId", authMiddleware(["User", "Admin", "Staff"]), getUserMessages);

export default router;
