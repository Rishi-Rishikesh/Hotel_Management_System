import express from "express";
import { addFeedback, getFeedbacks, getFeedbackById } from "../controllers/feedbackController.js";

const router = express.Router();

router.post("/", addFeedback);
router.get("/", getFeedbacks);
router.get("/:id", getFeedbackById);

export default router;