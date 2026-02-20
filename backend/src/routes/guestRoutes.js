import express from "express";
import {
  signupGuest,
  loginGuest,
  getReservations,
  createStaff,
  getGuestMe,
  otpGuest,
  guestRegistration,
  getCloudinaryConfig,
  getDashboard,
  updateGuest,
  findGuest,
  getGuest,
  newPassword,
  deleteGuest,
  deleteProfileImage,
  getGuestById,
  uploadStaffProfileImage, // New controller function
} from "../controllers/guestController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import Guest from "../models/guestModel.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

// Guest signup and login
router.post("/signup", signupGuest);
router.post("/login", loginGuest);

// Get reservations for authenticated users
router.get("/reservations", authMiddleware(["User", "Admin"]), getReservations);

// Get guest by email (used for room bookings)
router.get("/email/:email", authMiddleware(["Admin"]), async (req, res) => {
  try {
    const guest = await Guest.findOne({ email: req.params.email }).select("fname lname phoneNumber");
    if (!guest) {
      return res.status(404).json({ success: false, message: "Guest not found" });
    }
    res.status(200).json({
      success: true,
      data: {
        firstName: guest.fname,
        lastName: guest.lname,
        phoneNumber: guest.phoneNumber,
      },
    });
  } catch (error) {
    console.error(`getGuestByEmail: ${req.method} ${req.originalUrl} - Error:`, error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create staff (admin only)
router.post("/staff", authMiddleware(["Admin"]), createStaff);

// Upload staff profile image (admin only)
router.post("/staff/upload", authMiddleware(["Admin"]), upload.single("profileImage"), uploadStaffProfileImage);

// Get current guest's details
router.get("/me", authMiddleware(["User", "Admin", "Staff"]), getGuestMe);

// OTP and registration
router.post("/otp", otpGuest);
router.post("/register", authMiddleware(["User", "Admin"]), guestRegistration);

// Cloudinary config
router.get("/cloudinary-config", getCloudinaryConfig);

// Dashboard and guest updates
router.get("/dashboard", authMiddleware(["User", "Admin", "Staff"]), getDashboard);
router.put("/update", authMiddleware(["User", "Admin", "Staff"]), updateGuest);

// Get guest by ID (for admin)
router.get("/find/:id", authMiddleware(["Admin"]), findGuest);

// Get all guests or staff (admin only)
router.get("/", authMiddleware(["Admin"]), getGuest);

// Update password and delete guest
router.put("/password", authMiddleware(["User", "Admin", "Staff"]), newPassword);
router.delete("/delete", authMiddleware(["User", "Admin", "Staff"]), deleteGuest);
router.delete("/profile-image", authMiddleware(["User", "Admin", "Staff"]), deleteProfileImage);

// Get guest by ID (for hall bookings)
router.get("/:id", authMiddleware(["User", "Staff", "Admin"]), getGuestById);

export default router;