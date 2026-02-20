import { Schema, model } from "mongoose";

const RoomSchema = new Schema({
  roomNumber: { type: String, required: true, unique: true },
  type: { type: String, required: true, enum: ["Single", "Double", "Suite"] },
  pricePerNight: { type: Number, required: true, min: 500 },
  capacity: { type: Number, required: true, min: 1 },
  description: { type: String },
  status: {
    type: String,
    enum: ["available", "occupied", "maintenance"],
    default: "available",
  },
  lastCleaned: { type: Date, default: null },
  lastCleanedBy: { type: String,
      default: null },
  createdAt: { type: Date, default: Date.now },
});

// RoomSchema.index({ lastCleaned: 1 });

export default model("Room", RoomSchema);