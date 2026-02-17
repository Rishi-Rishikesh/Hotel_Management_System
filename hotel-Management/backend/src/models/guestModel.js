import mongoose from "mongoose";

const guestSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  firebaseUid: { type: String, unique: true, sparse: true }, // Optional
  fname: { type: String },
  lname: { type: String },
  address: { type: String },
  nic: { type: String },
  phoneNumber: { type: String },
  gender: { type: String },
  profileImage: { type: String },
  role: { type: String, enum: ["User", "Staff", "Admin"], default: "User" },
  status: { type: String, enum: ["Active", "Non-Active"], default: "Active" },
  lastLogin: { type: Date },
}, { timestamps: true });


guestSchema.index({ firebaseUid: 1 }); // For authMiddleware.js
guestSchema.index({ email: 1 }); // For login and uniqueness
guestSchema.index({ fname: 1 });

export default mongoose.model("Guest", guestSchema);