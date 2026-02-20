import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  taskType: {
    type: String,
    enum: ["cleaning", "maintenance", "inspection", "restocking"],
    required: true,
  },
  scheduledDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending",
  },
  assignedTo: {
    type: String,
    default: null,
  },
  createdBy: {
    type: String, // Firebase UID
    required: true,
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    default: null,
  },
}, { timestamps: true });

export default mongoose.model("Task", taskSchema);