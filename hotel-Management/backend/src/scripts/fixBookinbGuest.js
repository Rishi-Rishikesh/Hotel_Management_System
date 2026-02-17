import connectDB from "../config/db.js";
import Booking from "../models/Booking.model.js";
import Guest from "../models/guestModel.js";

async function fixBookingGuest() {
  try {
    await connectDB();
    console.log("Fetching bookings with invalid guestEmail...");
    const bookings = await Booking.find({
      guestEmail: { $not: { $type: "objectId" } },
    });

    console.log(`Found ${bookings.length} bookings with invalid guestEmail`);

    for (const booking of bookings) {
      const email = booking.guestEmail;
      console.log(`Processing booking ID: ${booking._id}, guestEmail: ${email}`);
      const guest = await Guest.findOne({ email: { $regex: `^${email}$`, $options: "i" } });
      if (guest) {
        booking.guestEmail = guest._id;
        await booking.save();
        console.log(`Updated booking ID: ${booking._id} with guest ID: ${guest._id}`);
      } else {
        await booking.deleteOne();
        console.log(`Deleted booking ID: ${booking._id} (no matching guest)`);
      }
    }

    console.log("Finished fixing bookings");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit();
  }
}

fixBookingGuest();