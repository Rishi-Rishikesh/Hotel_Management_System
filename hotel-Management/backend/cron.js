// import cron from "node-cron";
// import Room from "./src/models/Room.js";
// import Task from "./src/models/Task.js";
// import Guest from "./src/models/guestModel.js";
// import Config from "./src/models/Config.js";
// import { sendNotification } from "./src/utils/notification.js";

// const schedulePeriodicCleaning = (io) => {
//   cron.schedule("0 0 * * *", async () => {
//     console.log("Running periodic cleaning check...");
//     try {
//       const config = await Config.findOne({ key: "CLEANING_THRESHOLD_DAYS" });
//       const thresholdDays = config ? parseInt(config.value) : 3;
//       const thresholdDate = new Date(Date.now() - thresholdDays * 24 * 60 * 60 * 1000);
//       const rooms = await Room.find({
//         $or: [{ lastCleaned: { $lt: thresholdDate } }, { lastCleaned: null }],
//         status: { $ne: "occupied" },
//       });
//       const staff = await Guest.find({ role: "Staff" });
//       for (const room of rooms) {
//         let staffId = null;
//         if (staff.length > 0) {
//           const staffTaskCounts = await Promise.all(
//             staff.map(async (s) => {
//               const count = await Task.countDocuments({ staffId: s._id, status: "pending" });
//               return { staffId: s._id, count };
//             })
//           );
//           staffId = staffTaskCounts.reduce((min, curr) => (curr.count < min.count ? curr : min), staffTaskCounts[0]).staffId;
//         }
//         const task = new Task({
//           roomId: room.roomNumber,
//           description: `Periodic cleaning for room ${room.roomNumber}`,
//           taskType: "periodic",
//           scheduledDate: new Date(),
//           staffId,
//         });
//         await task.save();
//         io.emit("new_task", { task });
//         if (staffId) {
//           const assignedStaff = await Guest.findById(staffId);
//           try {
//             await sendNotification(assignedStaff.email, `Task assigned: Periodic cleaning for room ${room.roomNumber}`);
//             io.emit("task_assigned", { taskId: task._id, staffId });
//           } catch (error) {
//             console.error("Notification failed:", error);
//           }
//         }
//       }
//       console.log(`Created ${rooms.length} periodic cleaning tasks`);
//     } catch (error) {
//       console.error("Error in periodic cleaning cron:", error);
//     }
//   });
// };

// export default schedulePeriodicCleaning;

import Task from "./src/models/Task.js";
import Guest from "./src/models/guestModel.js";
import cron from "node-cron";
// import Room from "./src/models/Room.js";

async function schedulePeriodicCleaning(io) {
  cron.schedule("0 0 * * *", async () => {
    try {
      console.log("Running periodic cleaning task creation");
      const rooms = await Room.find({}); // Example: Get all rooms
      for (const room of rooms) {
        let assignedStaffId = null;
        const staff = await Guest.find({ role: "Staff" });
        if (staff.length > 0) {
          const staffTaskCounts = await Promise.all(
            staff.map(async (s) => {
              const count = await Task.countDocuments({ staffId: s.firebaseUid, status: "pending" });
              return { staffId: s.firebaseUid, count };
            })
          );
          assignedStaffId = staffTaskCounts.reduce((min, curr) => (curr.count < min.count ? curr : min), staffTaskCounts[0]).staffId;
        } else {
          console.warn(`No staff available for room ${room.roomNumber}`);
          continue; // Skip task creation or set staffId: null if unassigned tasks are allowed
        }
        const task = new Task({
          roomId: room.roomNumber,
          description: `Periodic cleaning for room ${room.roomNumber}`,
          taskType: "periodic",
          scheduledDate: new Date(),
          staffId: assignedStaffId,
        });
        await task.save();
        io.emit("new_task", { task });
        const staffMember = await Guest.findOne({ firebaseUid: assignedStaffId });
        if (staffMember) {
          await sendNotification(staffMember.email, `Task assigned: ${task.description}`);
        }
      }
    } catch (error) {
      console.error("Error in periodic cleaning:", error);
    }
  });
}

export default schedulePeriodicCleaning;