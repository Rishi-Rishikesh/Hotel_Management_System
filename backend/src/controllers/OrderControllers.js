import mongoose from "mongoose";
import Order from "../models/Order.js";
import Booking from "../models/Booking.js";
import Task from "../models/Task.js";
import Guest from "../models/guestModel.js";
import Config from "../models/Config.js";
import { sendNotification } from "../utils/notification.js";

export const getOrders = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { userId, items, totalPrice, deliveryTime, roomId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Items are required" });
    }
    if (!totalPrice || typeof totalPrice !== "number") {
      return res.status(400).json({ success: false, message: "Total price is required" });
    }
    if (!deliveryTime) {
      return res.status(400).json({ success: false, message: "Delivery time is required" });
    }
    const booking = await Booking.findOne({
      guestEmail: req.userEmail,
      roomNumber: roomId,
      bookingStatus: "confirmed",
      checkInDate: { $lte: new Date() },
      checkOutDate: { $gte: new Date() },
    });
    if (!booking) {
      return res.status(403).json({ success: false, message: "No active booking found" });
    }
    const order = new Order({ userId, items, totalPrice, deliveryTime });
    await order.save();
    const staff = await Guest.find({ role: "Staff", status: "Active" });
    if (staff.length === 0) {
      return res.status(500).json({ success: false, message: "No active staff available" });
    }
    const lastAssigned = await Config.findOne({ key: "lastAssignedStaff" });
    const nextIndex = lastAssigned
      ? (staff.findIndex((s) => s._id.toString() === lastAssigned.value) + 1) % staff.length
      : 0;
    const assignedStaff = staff[nextIndex];
    const task = new Task({
      staffId: assignedStaff._id,
      orderId: order._id,
      roomId,
      description: `Deliver food to Room ${roomId}`,
      status: "pending",
    });
    await task.save();
    await Config.updateOne(
      { key: "lastAssignedStaff" },
      { value: assignedStaff._id.toString() },
      { upsert: true }
    );
    await sendNotification(assignedStaff.email, `New task: Deliver food to Room ${roomId}`);
    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getStaffOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const tasks = await Task.find({ staffId: req.userId, status: "pending" })
      .populate("orderId")
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    const orders = tasks.map((task) => task.orderId).filter((order) => order);
    const total = await Task.countDocuments({ staffId: req.userId, status: "pending" });
    res.status(200).json({
      success: true,
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Error fetching staff orders:", error);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};