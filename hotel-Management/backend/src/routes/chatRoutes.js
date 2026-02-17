import express from "express";
import { sendMessage,getUserMessages, getMessages, updateMessage, deleteMessage } from "../controllers/chatController.js";

const router = express.Router();


router.post("/send", sendMessage);
router.get("/all", getMessages);
router.put("/update/:id", updateMessage);
router.delete("/delete/:id", deleteMessage);
router.get('/mine/:userId', getUserMessages);


export default router;
