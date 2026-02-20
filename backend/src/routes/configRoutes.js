import express from "express";
import { getConfig, updateConfig } from "../controllers/configController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware(["Admin"]), getConfig);
router.put("/", authMiddleware(["Admin"]), updateConfig);

export default router;