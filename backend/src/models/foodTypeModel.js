import mongoose from "mongoose";

const foodTypeSchema = new mongoose.Schema({
  type: String,
});

const FoodType = mongoose.model("FoodType", foodTypeSchema, "foodtype");

export default FoodType;
