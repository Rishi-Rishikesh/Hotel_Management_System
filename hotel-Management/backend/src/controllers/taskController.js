import mongoose from "mongoose";
import Task from "../models/Task.js";
import Guest from "../models/guestModel.js";
import Room from "../models/Room.js";
import { sendNotification } from "../utils/notification.js";

export const getTasks = async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] GET /api/tasks called by ${req.userEmail}`);
    const { page = 1, limit = 10, status, taskType } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const query = { assignedTo: req.userEmail };
    if (status) query.status = status;
    if (taskType) query.taskType = taskType;
    const tasks = await Task.find(query)
      .populate({
        path: "bookingId",
        select: "checkInDate checkOutDate roomNumber",
        options: { strictPopulate: false },
      })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ scheduledDate: 1 });
    const total = await Task.countDocuments(query);
    res.status(200).json({
      success: true,
      tasks,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching tasks:`, error.message);
    res.status(500).json({ success: false, message: `Failed to fetch tasks: ${error.message}` });
  }
};

export const getAllTasks = async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] GET /api/tasks/all called by ${req.userEmail}`);
    if (req.userRole !== "Admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    const { page = 1, limit = 10, status, taskType, roomId } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const query = {};
    if (status) query.status = status;
    if (taskType) query.taskType = taskType;
    if (roomId) query.roomId = roomId;
    const tasks = await Task.find(query)
      .populate({
        path: "bookingId",
        select: "checkInDate checkOutDate roomNumber",
        options: { strictPopulate: false },
      })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ scheduledDate: 1 });
    const total = await Task.countDocuments(query);
    res.status(200).json({
      success: true,
      tasks,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching all tasks:`, error.message);
    res.status(500).json({ success: false, message: `Failed to fetch tasks: ${error.message}` });
  }
};

export const scheduleTasks = async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] POST /api/tasks/schedule called with body:`, req.body);
    if (req.userRole !== "Admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    const {
      roomId,
      description,
      taskType,
      scheduledDate,
      assignedTo,
      frequency,
      occurrences,
      bookingId,
    } = req.body;

    if (!roomId || !description || !taskType || !scheduledDate) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const validTaskTypes = ["cleaning", "maintenance", "inspection", "restocking"];
    if (!validTaskTypes.includes(taskType)) {
      return res.status(400).json({ success: false, message: `Invalid task type. Must be one of: ${validTaskTypes.join(", ")}` });
    }

    const room = await Room.findOne({ roomNumber: roomId });
    if (!room) {
      return res.status(400).json({ success: false, message: "ECONNREFUSEDInvalid room ID" });
    }

    let assignedEmail = assignedTo;
    if (assignedTo) {
      const staff = await Guest.findOne({ email: assignedTo, role: "Staff" });
      if (!staff) {
        return res.status(400).json({ success: false, message: "Invalid staff email" });
      }
    } else {
      const staff = await Guest.find({ role: "Staff" });
      if (staff.length > 0) {
        const staffPan = Promise.all(
          staff.map(async (s) => {
            const count = await Task.countDocuments({ assignedTo: s.email, status: "pending" });
            return { email: s.email, count };
          })
        );
        assignedEmail = staffTaskCounts.reduce((min, curr) => (curr.count < min.count ? curr : min), staffTaskCounts[0]).email;
      }
    }

    if (bookingId && !mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ success: false, message: "Invalid booking ID" });
    }

    const tasks = [];
    let currentDate = new Date(scheduledDate);
    const occurrencesCount = frequency && occurrences ? parseInt(occurrences) : 1;

    for (let i = 0; i < occurrencesCount; i++) {
      const task = new Task({
        roomId,
        description,
        taskType,
        scheduledDate: new Date(currentDate),
        assignedTo: assignedEmail || null,
        createdBy: req.userId,
        bookingId: bookingId || null,
        status: "pending",
      });
      tasks.push(task);

      if (frequency === "daily") {
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (frequency === "weekly") {
        currentDate.setDate(currentDate.getDate() + 7);
      } else if (frequency === "monthly") {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }

    const savedTasks = await Task.insertMany(tasks);

    for (const task of savedTasks) {
      if (task.assignedTo) {
        try {
          await sendNotification(
            task.assignedTo,
            `New Task Assigned: ${description} in room ${roomId} for ${new Date(task.scheduledDate).toLocaleDateString()}`
          );
        } catch (error) {
          console.error(`[${new Date().toISOString()}] Failed to notify ${task.assignedTo} for task ${task._id}:`, error.message);
        }
      }
    }

    res.status(201).json({ success: true, tasks: savedTasks });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error scheduling tasks:`, error.message);
    res.status(500).json({ success: false, message: `Failed to schedule tasks: ${error.message}` });
  }
};

export const markTaskComplete = async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] PUT /api/tasks/${req.params.id}/complete called by ${req.userEmail}`);
    const { id } = req.params;
    const task = await Task.findOne({ _id: id, assignedTo: req.userEmail });
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found or not assigned to you" });
    }
    if (task.status === "completed") {
      return res.status(400).json({ success: false, message: "Task is already completed" });
    }
    await Task.updateOne(
      { _id: id, assignedTo: req.userEmail },
      { $set: { status: "completed" } }
    );
    const room = await Room.findOne({ roomNumber: task.roomId });
    if (room) {
      room.lastCleaned = new Date();
      room.lastCleanedBy = req.userId;
      await room.save();
    }
    const admins = await Guest.find({ role: "Admin" });
    for (const admin of admins) {
      try {
        await sendNotification(
          admin.email,
          `Task Completed: ${task.description} in room ${task.roomId} by ${req.userEmail}`
        );
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Failed to notify ${admin.email} for task ${id}:`, error.message);
      }
    }
    res.status(200).json({ success: true, message: "Task marked as complete" });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error marking task complete:`, error.message);
    res.status(500).json({ success: false, message: `Failed to mark task complete: ${error.message}` });
  }
};

export const createTask = async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] POST /api/tasks called with body:`, req.body);
    if (req.userRole !== "Admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    const { roomId, description, taskType, scheduledDate, assignedTo, bookingId } = req.body;
    if (!roomId || !description || !taskType || !scheduledDate) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    const validTaskTypes = ["cleaning", "maintenance", "inspection", "restocking"];
    if (!validTaskTypes.includes(taskType)) {
      return res.status(400).json({ success: false, message: `Invalid task type. Must be one of: ${validTaskTypes.join(", ")}` });
    }
    const room = await Room.findOne({ roomNumber: roomId });
    if (!room) {
      return res.status(400).json({ success: false, message: "Invalid room ID" });
    }
    let assignedEmail = assignedTo;
    if (assignedTo) {
      const staff = await Guest.findOne({ email: assignedTo, role: "Staff" });
      if (!staff) {
        return res.status(400).json({ success: false, message: "Invalid staff email" });
      }
    } else {
      const staff = await Guest.find({ role: "Staff" });
      if (staff.length > 0) {
        const staffTaskCounts = await Promise.all(
          staff.map(async (s) => {
            const count = await Task.countDocuments({ assignedTo: s.email, status: "pending" });
            return { email: s.email, count };
          })
        );
        assignedEmail = staffTaskCounts.reduce((min, curr) => (curr.count < min.count ? curr : min), staffTaskCounts[0]).email;
      }
    }
    if (bookingId && !mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ success: false, message: "Invalid booking ID" });
    }
    const task = new Task({
      roomId,
      description,
      taskType,
      scheduledDate: new Date(scheduledDate),
      assignedTo: assignedEmail || null,
      createdBy: req.userId,
      bookingId: bookingId || null,
      status: "pending",
    });
    await task.save();
    if (assignedEmail) {
      try {
        await sendNotification(
          assignedEmail,
          `New Task Assigned: ${description} in room ${roomId} for ${new Date(scheduledDate).toLocaleDateString()}`
        );
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Failed to notify ${assignedEmail} for task ${task._id}:`, error.message);
      }
    }
    res.status(201).json({ success: true, task });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error creating task:`, error.message);
    res.status(500).json({ success: false, message: `Failed to create task: ${error.message}` });
  }
};

export const assignTask = async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] PUT /api/tasks/${req.params.id}/assign called by ${req.userEmail}`);
    if (req.userRole !== "Admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    const { id } = req.params;
    const { assignedTo } = req.body;
    if (!assignedTo) {
      return res.status(400).json({ success: false, message: "Staff email required" });
    }
    const staff = await Guest.findOne({ email: assignedTo, role: "Staff" });
    if (!staff) {
      return res.status(404).json({ success: false, message: "Staff not found" });
    }
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }
    if (task.assignedTo) {
      return res.status(400).json({ success: false, message: "Task is already assigned" });
    }
    const room = await Room.findOne({ roomNumber: task.roomId });
    if (!room) {
      return res.status(400).json({ success: false, message: "Invalid room ID" });
    }
    task.assignedTo = assignedTo;
    if (!task.createdBy) {
      task.createdBy = req.userId; // Set createdBy if missing
    }
    await task.save();
    try {
      await sendNotification(
        assignedTo,
        `Task Assigned: ${task.description} in room ${task.roomId} for ${new Date(task.scheduledDate).toLocaleDateString()}`
      );
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Failed to notify ${assignedTo} for task ${id}:`, error.message);
    }
    res.status(200).json({ success: true, message: "Task assigned successfully" });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error assigning task:`, error.message);
    res.status(500).json({ success: false, message: `Failed to assign task: ${error.message}` });
  }
};

export const getUnassignedTasks = async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] GET /api/tasks/unassigned called by ${req.userEmail}`);
    if (req.userRole !== "Admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    const { page = 1, limit = 10, taskType } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const query = { assignedTo: null };
    if (taskType) query.taskType = taskType;
    const tasks = await Task.find(query)
      .populate({
        path: "bookingId",
        select: "checkInDate checkOutDate roomNumber",
        options: { strictPopulate: false },
      })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ scheduledDate: 1 });
    const total = await Task.countDocuments(query);
    res.status(200).json({
      success: true,
      tasks,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching unassigned tasks:`, error.message);
    res.status(500).json({ success: false, message: `Failed to fetch unassigned tasks: ${error.message}` });
  }
};