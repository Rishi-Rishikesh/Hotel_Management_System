const mongoose = require("mongoose");
const Task = require("../models/Task.js");

async function checkUnassignedTasks() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    const unassignedTasks = await Task.find({ staffId: null });
    console.log("Unassigned Tasks:", unassignedTasks);
    console.log("Count of Unassigned Tasks:", unassignedTasks.length);

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error checking unassigned tasks:", error);
  }
}

checkUnassignedTasks();