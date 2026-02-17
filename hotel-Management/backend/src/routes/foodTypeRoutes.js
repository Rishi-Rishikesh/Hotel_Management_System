import express from "express";
import { getFoodType } from "../controllers/foodTypeController.js";

const router = express.Router();

router.get("/getfoodtype", getFoodType);

export default router;
