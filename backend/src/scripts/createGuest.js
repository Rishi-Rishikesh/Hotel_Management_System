// scripts/createGuest.js
import connectDB from "../src/config/db.js";
import Guest from "../models/guestModel.js";

async function createGuest() {
  try {
    await connectDB();
    const email = "krishikesh2001@gmail.com";
    const existingGuest = await Guest.findOne({ email });
    if (existingGuest) {
      console.log("Guest already exists:", existingGuest);
      return;
    }
    const newGuest = new Guest({
      email,
      role: "Admin",
      fname: "Krishikesh",
      lname: "Unknown", // Update as needed
      phoneNumber: "+94234567890", // Update as needed
      // Add other required fields per your Guest schema
    });
    await newGuest.save();
    console.log("Created new guest:", newGuest);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit();
  }
}

createGuest();