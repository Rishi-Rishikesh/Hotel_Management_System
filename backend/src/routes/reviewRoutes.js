import express from "express";
import {
  getUserReviews,
  submitReview,
  getItemReviews,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js"; // Adjust path if needed
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/MY", authMiddleware(["User", "Admin"]), getUserReviews);
router.post("/", authMiddleware(["User", "Admin"]), submitReview);
router.get("/:type/:itemId", getItemReviews);
router.put("/:id", authMiddleware(["User", "Admin"]), updateReview);
router.delete("/:id", authMiddleware(["User", "Admin"]), deleteReview);

export default router;