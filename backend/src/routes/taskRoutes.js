import express from "express";
import { getTasks, getAllTasks, scheduleTasks, markTaskComplete, createTask, assignTask, getUnassignedTasks } from "../controllers/taskController.js";
import firebaseAdmin from "../config/firebaseAdmin.js";

const router = express.Router();

// Middleware to verify Firebase token
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }
  try {
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
    req.userId = decodedToken.uid;
    req.userRole = decodedToken.role || (await firebaseAdmin.auth().getUser(decodedToken.uid)).customClaims?.role;
    req.userEmail = decodedToken.email;
    if (!req.userId) {
      throw new Error("User ID is missing in token");
    }
    console.log(`[${new Date().toISOString()}] Token verified for user: ${req.userEmail}, role: ${req.userRole}`);
    next();
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Token verification error:`, error.message);
    res.status(500).json({ success: false, message: "Invalid or expired token" });
  }
};

// Routes
router.get("/", verifyToken, getTasks);
router.get("/all", verifyToken, getAllTasks);
router.get("/unassigned", verifyToken, getUnassignedTasks);
router.post("/schedule", verifyToken, scheduleTasks);
router.post("/", verifyToken, createTask);
router.put("/:id/complete", verifyToken, markTaskComplete);
router.put("/:id/assign", verifyToken, assignTask);

export default router;