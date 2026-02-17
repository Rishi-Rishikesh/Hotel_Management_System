import connectDB from "../src/config/db.js";
import Guest from "../models/guestModel.js";

async function fixGuestRole() {
  try {
    await connectDB();
    const email = "krishikesh2001@gmail.com";
    const guest = await Guest.findOne({ email });
    if (!guest) {
      console.log("Guest not found");
      return;
    }
    console.log("Current role:", guest.role);
    if (guest.role !== "Admin") {
      guest.role = "Admin";
      await guest.save();
      console.log("Updated role to Admin");
    } else {
      console.log("Role is already Admin");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit();
  }
}

fixGuestRole();