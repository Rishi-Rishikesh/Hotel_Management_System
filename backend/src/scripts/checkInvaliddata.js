// scripts/checkInvalidData.js
import connectDB from "../src/config/db.js";
import Booking from "../models/bookingModel.js";

async function checkInvalidData() {
  try {
    await connectDB();
    const invalidBookings = await Booking.find({ guestEmail: { $not: { $type: "objectId" } } });
    console.log(`Invalid Bookings: ${invalidBookings.length}`, invalidBookings);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit();
  }
}

checkInvalidData();