import connectDB from "../config/db.js";
import HallBooking from "../models/HallBooking.model.js";
import Guest from "../models/guestModel.js";

async function fixHallBookingGuest() {
  try {
    await connectDB();
    console.log("Fetching hall bookings with invalid guest...");
    const bookings = await HallBooking.find({
      guest: { $not: { $type: "objectId" } },
    });

    console.log(`Found ${bookings.length} hall bookings with invalid guest`);

    for (const booking of bookings) {
      const email = booking.guest;
      console.log(`Processing hall booking ID: ${booking._id}, guest: ${email}`);
      const guest = await Guest.findOne({ email });
      if (guest) {
        booking.guest = guest._id;
        await booking.save();
        console.log(`Updated hall booking ID: ${booking._id} with guest ID: ${guest._id}`);
      } else {
        await booking.deleteOne();
        console.log(`Deleted hall booking ID: ${booking._id} (no matching guest)`);
      }
    }

    console.log("Finished fixing hall bookings");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit();
  }
}

fixHallBookingGuest();













// // scripts/fixHallBookingGuest.js
// import connectDB from "../src/config/db.js";
// import HallBooking from "../models/hallBookingModel.js";
// import Guest from "../models/guestModel.js";

// async function fixHallBookingGuest() {
//   try {
//     await connectDB();
//     console.log("Fetching hall bookings with invalid guest...");
//     const bookings = await HallBooking.find({
//       guest: { $not: { $type: "objectId" } },
//     });

//     console.log(`Found ${bookings.length} hall bookings with invalid guest`);

//     for (const booking of bookings) {
//       const email = booking.guest;
//       console.log(`Processing hall booking ID: ${booking._id}, guest: ${email}`);
//       const guest = await Guest.findOne({ email });
//       if (guest) {
//         booking.guest = guest._id;
//         await booking.save();
//         console.log(`Updated hall booking ID: ${booking._id} with guest ID: ${guest._id}`);
//       } else {
//         booking.guest = null;
//         await booking.save();
//         console.log(`Set guest to null for hall booking ID: ${booking._id} (no matching guest)`);
//       }
//     }

//     console.log("Finished fixing hall bookings");
//   } catch (error) {
//     console.error("Error:", error);
//   } finally {
//     process.exit();
//   }
// }

// fixHallBookingGuest();