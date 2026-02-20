import { Schema, model } from "mongoose";

const RoomInventorySchema = new Schema({
  roomId: { type: String, required: true, trim: true },
  inventoryId: { type: Schema.Types.ObjectId, ref: "Inventory", required: true },
  staffId: { type: Schema.Types.ObjectId, ref: "Guest", required: true },
  action: { type: String, enum: ["restock", "replacement"], required: true },
  quantity: { type: Number, default: 0, min: 0 },
  replacementReason: { type: String, trim: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

RoomInventorySchema.index({ roomId: 1, inventoryId: 1 });
RoomInventorySchema.index({ staffId: 1 });

export default model("RoomInventory", RoomInventorySchema);