import express from "express";
import { addRoom, getRooms, updateRoom, deleteRoom } from "../controllers/roomController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import Room from "../models/Room.js";

const router = express.Router();

console.log("Registering room routes...");

router.get("/public", getRooms);
router.get("/", authMiddleware(["User", "Admin"]), getRooms);
router.get("/staff", authMiddleware(["Staff"]), async (req, res) => {
  try {
    const rooms = await Room.find()
      .select("roomNumber _id")
      .lean();
    if (!rooms.length) {
      return res.status(200).json({ success: true, data: [], message: "No rooms found" });
    }
    res.status(200).json({ success: true, data: rooms });
  } catch (error) {
    console.error("Error fetching staff rooms:", error);
    res.status(500).json({ success: false, message: "Failed to fetch rooms" });
  }
});
router.post("/", authMiddleware(["Admin"]), addRoom);
router.put("/:roomNumber", authMiddleware(["Admin"]), updateRoom);
router.delete("/:roomNumber", authMiddleware(["Admin"]), deleteRoom);

console.log("Room routes registered");

// Check room availability
router.post('/check-availability', authMiddleware, async (req, res) => {
  const { roomNumber, checkIn, checkOut } = req.body;

  if (!roomNumber || !checkIn || !checkOut) {
    return res.status(400).json({ success: false, message: 'Room number, check-in, and check-out dates are required' });
  }

  try {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    const existingBookings = await Booking.find({
      roomNumber,
      status: { $ne: 'cancelled' },
      $or: [
        {
          checkIn: { $lte: checkOutDate },
          checkOut: { $gte: checkInDate },
        },
      ],
    });

    if (existingBookings.length > 0) {
      return res.status(409).json({ success: false, message: 'Room is already booked for the selected dates' });
    }

    return res.status(200).json({ success: true, message: 'Room is available' });
  } catch (error) {
    console.error('Check Room Availability Error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;