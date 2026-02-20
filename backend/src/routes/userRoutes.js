import express from "express";
import { getUserProfile, getStaffList } from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", authMiddleware(["User", "Staff", "Admin"]), getUserProfile);
router.get("/staff", authMiddleware(["Admin"]), getStaffList);

export default router;