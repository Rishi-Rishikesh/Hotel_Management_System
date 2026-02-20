import { Schema, model } from "mongoose";

const BookingSchema = new Schema({
  guestEmail: { type: Schema.Types.ObjectId, ref: "Guest", required: true },
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  roomNumber: { type: String, required: true },
  maleGuests: { type: Number, min: 0, default: 0 },
  femaleGuests: { type: Number, min: 0, default: 0 },
  childGuests: { type: Number, min: 0, default: 0 },
  totalGuests: { type: Number, min: 0, default: 0 },
  kitchenAccess: { type: String, enum: ["yes", "no"], required: true },
  stayReason: { type: String, required: true },
  paymentMethod: { type: String, required: true, enum: ["credit_card", "debit_card", "cash"] },
  bookingStatus: { type: String, default: "pending", enum: ["pending", "confirmed", "cancelled", "completed"] },
  isCancelledBeforeTwoDays: { type: Boolean, default: false },
  rejectedReason: { type: String },
  amenities: {
    airConditioning: { type: Boolean, default: false },
    food: { type: Boolean, default: false },
    parking: { type: Boolean, default: false },
  },
  createdAt: { type: Date, default: Date.now },
});

BookingSchema.index({ guestEmail: 1 });
BookingSchema.index({ roomNumber: 1, checkInDate: 1, checkOutDate: 1 });
BookingSchema.index({ bookingStatus: 1 });

export default model("Booking", BookingSchema);