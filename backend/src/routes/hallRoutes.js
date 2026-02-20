import express from "express";
import { addHall, getHalls, updateHall, deleteHall,getAvailableHalls } from "../controllers/hallController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import Hall from "../models/Hall.model.js";

const router = express.Router();

console.log("Registering hall routes...");
router.get("/", authMiddleware(["User", "Admin"]), (req, res, next) => {
  console.log("GET /api/halls/ - Request received", {
    headers: {
      authorization: req.headers.authorization ? "Bearer <redacted>" : "None",
    },
    user: req.user, // Log user from authMiddleware
  });
  getHalls(req, res, next);
});
router.get("/staff", authMiddleware(["Staff"]), async (req, res) => {
  try {
    console.log("GET /api/halls/staff - Request received");
    const halls = await Hall.find()
      .select("number _id")
      .lean();
    if (!halls.length) {
      return res.status(200).json({ success: true, data: [], message: "No halls found" });
    }
    res.status(200).json({ success: true, data: halls });
  } catch (error) {
    console.error("Error fetching staff halls:", error.message, error.stack);
    res.status(500).json({ success: false, message: "Failed to fetch halls" });
  }
});
router.post("/", authMiddleware(["Admin"]), addHall);
router.put("/:number", authMiddleware(["Admin"]), updateHall);
router.delete("/:number", authMiddleware(["Admin"]), deleteHall);
router.get('/available', authMiddleware(['User', 'Admin']), getAvailableHalls);
console.log("Hall routes registered");

export default router;