import { Schema, model } from "mongoose";

const HallBookingSchema = new Schema({
  guest: { type: Schema.Types.ObjectId, ref: "Guest", required: true }, // Changed from guestEmail to guest
  hall: { type: Schema.Types.ObjectId, ref: "Hall", required: true }, // Added hall reference
  hallNumber: { type: String, required: true },
  eventDate: { type: Date, required: true },
  endDate: { type: Date },
  checkInTime: { type: String, required: true },
  checkOutTime: { type: String },
  eventType: { type: String, required: true },
  numberOfGuests: { type: Number, required: true, min: 1 },
  additionalServices: [{ type: String }],
  specialRequests: { type: String },
  paymentMethod: {
    type: String,
    required: true,
    enum: ["credit_card", "debit_card", "cash"],
  },
  totalPrice: { type: Number, required: true, min: 0 },
  bookingStatus: {
    type: String,
    default: "pending",
    enum: ["pending", "confirmed", "cancelled"],
  },
  isCancelledBeforeTwoDays: { type: Boolean, default: false },
  rejectedReason: { type: String },
  createdAt: { type: Date, default: Date.now },
});

HallBookingSchema.index({ guest: 1 });
HallBookingSchema.index({ hall: 1, eventDate: 1 });
HallBookingSchema.index({ hallNumber: 1, eventDate: 1 });
HallBookingSchema.index({ bookingStatus: 1 });

export default model("HallBooking", HallBookingSchema);