import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import guestRoutes from "./src/routes/guestRoutes.js";
import foodTypeRoutes from "./src/routes/foodTypeRoutes.js";
import menuRoutes from "./src/routes/menuRoutes.js";
import reviewRoutes from "./src/routes/reviewRoutes.js";
import roomBookingRoutes from "./src/routes/roomBookingRoutes.js";
import hallBookingRoutes from "./src/routes/hallBookingRoutes.js";
import inventoryRoutes from "./src/routes/inventoryRoutes.js";
import roomRoutes from "./src/routes/roomsRoute.js";
import orderRoutes from "./src/routes/orderRoutes.js";
import taskRoutes from "./src/routes/taskRoutes.js";
import feedbackRoutes from "./src/routes/feedbackRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import hallRoutes from "./src/routes/hallRoutes.js";
import configRoutes from "./src/routes/configRoutes.js";
import firebaseAdmin from "./src/config/firebaseAdmin.js";
import cookieParser from "cookie-parser";
import cloudinary from "cloudinary";
import multer from "multer";
import fs from "fs";
import rateLimit from "express-rate-limit";
import schedulePeriodicCleaning from "./cron.js";
import "./src/models/Booking.model.js";
import "./src/models/Task.js";
import "./src/models/guestModel.js";
import Room from "./src/models/Room.js";

dotenv.config();

const app = express();

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many requests, please try again after 15 minutes",
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: "Too many requests from this IP, please try again after 15 minutes",
});

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);
app.options("*", cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting, exempting critical routes for authenticated users
app.use(async (req, res, next) => {
  const exemptRoutes = ["/api/tasks", "/api/rooms", "/api/users", "/api/config"];
  if (exemptRoutes.some((route) => req.path.startsWith(route))) {
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (token) {
      try {
        await firebaseAdmin.auth().verifyIdToken(token);
        return next();
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Token verification failed:`, error.message);
      }
    }
  }
  generalLimiter(req, res, next);
});

// Connect to MongoDB
connectDB();

// Routes
app.get("/", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

// Room Seeding Function
const seedDefaultRooms = async () => {
  try {
    const roomCount = await Room.countDocuments();
    if (roomCount === 0) {
      const defaultRooms = [
        {
          roomNumber: "101",
          type: "Single",
          pricePerNight: 5000,
          capacity: 1,
          description: "Comfortable single room with essential amenities.",
          status: "available",
        },
        {
          roomNumber: "102",
          type: "Double",
          pricePerNight: 8500,
          capacity: 2,
          description: "Spacious double room perfect for couples.",
          status: "available",
        },
      ];
      await Room.insertMany(defaultRooms);
      console.log("Default rooms seeded successfully.");
    }
  } catch (error) {
    console.error("Error seeding default rooms:", error);
  }
};

app.use("/api/guests/public", authLimiter);
app.use("/api/guests", guestRoutes);
app.use("/api/bookings/rooms", roomBookingRoutes);
app.use("/api/bookings/halls", hallBookingRoutes);
app.use("/api/foodtype", foodTypeRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/halls", hallRoutes);
app.use("/api/config", configRoutes);

// Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "Uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

app.post("/api/guests/upload", upload.single("profileImage"), (req, res) => {
  res.json({ success: true, file: req.file });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}`);
  await seedDefaultRooms();
});