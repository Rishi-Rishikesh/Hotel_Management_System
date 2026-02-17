import mongoose from "mongoose";

const hallSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true }, // e.g., "H001"
  capacity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 }, // Price in LKR
  status: { type: String, enum: ["Available", "Booked", "Mainteance"], default: "Available" }, 
  description: { type: String },
  Facilities: { type: [String] },
  location: { type: String },
  createdAt: { type: Date, default: Date.now },
});

hallSchema.index({ number: 1 });

export default mongoose.model("Hall", hallSchema);