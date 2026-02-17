import { Schema, model } from "mongoose";

const InventorySchema = new Schema({
  pname: { type: String, required: true, trim: true, unique: true },
  stock: { type: Number, required: true, min: 0 },
  category: {
    type: String,
    enum: ["linens", "toiletries", "cleaning", "food_beverage", "misc",'Electronics','others'],
    required: true,
  },
  description: { type: String, trim: true },
  lastUpdated: { type: Date, default: Date.now },
  updatedBy: { type: Schema.Types.ObjectId, ref: "Guest" },
});

// Indexes for performance
InventorySchema.index({ category: 1 });
InventorySchema.index({ pname: 1 });

export default model("Inventory", InventorySchema);