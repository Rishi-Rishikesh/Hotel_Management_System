import Booking from "../models/Booking.model.js";
import Guest from "../models/guestModel.js";
import Room from "../models/Room.js";
import Task from "../models/Task.js";
import mongoose from "mongoose";
import { sendNotification } from "../utils/notification.js";

export async function createRoomBooking(req, res) {
  try {
    const {
      checkInDate,
      checkOutDate,
      roomNumber,
      maleGuests,
      femaleGuests,
      childGuests,
      totalGuests,
      kitchenAccess,
      stayReason,
      paymentMethod,
      amenities,
    } = req.body;

    console.log("Received booking data:", req.body);

    if (
      !checkInDate ||
      !checkOutDate ||
      !roomNumber ||
      !kitchenAccess ||
      !stayReason ||
      !paymentMethod ||
      totalGuests === undefined
    ) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    if (totalGuests !== (maleGuests || 0) + (femaleGuests || 0) + (childGuests || 0)) {
      return res.status(400).json({ success: false, message: "Total guests mismatch" });
    }

    if (totalGuests === (childGuests || 0) && totalGuests > 0) {
      return res.status(400).json({ success: false, message: "Bookings cannot consist of only children" });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    if (checkIn >= checkOut) {
      return res.status(400).json({ success: false, message: "Check-out date must be after check-in date" });
    }

    const guest = await Guest.findOne({ email: req.userEmail });
    if (!guest) {
      return res.status(404).json({ success: false, message: "Guest not found" });
    }

    const existingBookings = await Booking.find({
      roomNumber,
      $or: [
        { checkInDate: { $lte: checkOut }, checkOutDate: { $gte: checkIn } },
      ],
      bookingStatus: { $in: ["pending", "confirmed"] },
    });

    if (existingBookings.length > 0) {
      return res.status(409).json({ success: false, message: "Room already booked for these dates" });
    }

    const newBooking = new Booking({
      guestEmail: guest._id,
      checkInDate,
      checkOutDate,
      roomNumber,
      maleGuests,
      femaleGuests,
      childGuests,
      totalGuests,
      kitchenAccess,
      stayReason,
      paymentMethod,
      amenities,
      bookingStatus: "pending",
    });

    const savedBooking = await newBooking.save();

    res.status(201).json({
      success: true,
      data: {
        ...savedBooking.toObject(),
        guest: {
          firstName: guest.fname,
          lastName: guest.lname,
          phoneNumber: guest.phoneNumber,
        },
      },
    });
  } catch (error) {
    console.error("Error in createRoomBooking:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function approveRoomBooking(req, res) {
  try {
    if (req.userRole !== "Admin") {
      return res.status(403).json({ success: false, message: "Only admins can approve bookings" });
    }
    const bookingId = req.params.id;
    if (!mongoose.isValidObjectId(bookingId)) {
      return res.status(400).json({ success: false, message: "Invalid booking ID" });
    }
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    if (booking.bookingStatus !== "pending") {
      return res.status(400).json({ success: false, message: "Booking is not pending" });
    }
    booking.bookingStatus = "confirmed";
    const updatedBooking = await booking.save();
    const guest = await Guest.findById(updatedBooking.guestEmail);
    const room = await Room.findOne({ roomNumber: booking.roomNumber });
    if (room) {
      room.status = "occupied";
      await room.save();
    }
    const staff = await Guest.find({ role: "Staff" });
    let staffId = null;
    if (staff.length > 0) {
      const staffTaskCounts = await Promise.all(
        staff.map(async (s) => {
          const count = await Task.countDocuments({ staffId: s._id, status: "pending" });
          return { staffId: s._id, count };
        })
      );
      staffId = staffTaskCounts.reduce((min, curr) => (curr.count < min.count ? curr : min), staffTaskCounts[0]).staffId;
    }
    const task = new Task({
      roomId: booking.roomNumber,
      description: `Clean room ${booking.roomNumber} before guest check-in`,
      taskType: "pre-check-in",
      scheduledDate: booking.checkInDate,
      bookingId: booking._id,
      staffId,
    });
    await task.save();
    const io = req.app.get("io");
    io.emit("new_task", { task });
    if (staffId) {
      const assignedStaff = await Guest.findById(staffId);
      try {
        await sendNotification(assignedStaff.email, `Task assigned: Clean room ${booking.roomNumber} before check-in`);
        io.emit("task_assigned", { taskId: task._id, staffId });
      } catch (error) {
        console.error("Notification failed:", error);
      }
    }
    res.status(200).json({
      success: true,
      data: {
        ...updatedBooking.toObject(),
        guest: {
          firstName: guest?.fname || "Unknown",
          lastName: guest?.lname || "Unknown",
          phoneNumber: guest?.phoneNumber || "N/A",
        },
      },
    });
  } catch (error) {
    console.error(`approveRoomBooking: Error for booking ${req.params.id}:`, {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    res.status(500).json({ success: false, message: `Internal server error: ${error.message}` });
  }
}

export async function checkoutRoomBooking(req, res) {
  try {
    if (req.userRole !== "Admin") {
      return res.status(403).json({ success: false, message: "Only admins can mark check-out" });
    }
    const bookingId = req.params.id;
    if (!mongoose.isValidObjectId(bookingId)) {
      return res.status(400).json({ success: false, message: "Invalid booking ID" });
    }
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    if (booking.bookingStatus !== "confirmed") {
      return res.status(400).json({ success: false, message: "Booking is not confirmed" });
    }
    booking.bookingStatus = "completed";
    const updatedBooking = await booking.save();
    const guest = await Guest.findById(updatedBooking.guestEmail);
    const room = await Room.findOne({ roomNumber: booking.roomNumber });
    if (room) {
      room.status = "available";
      await room.save();
    }
    const staff = await Guest.find({ role: "Staff" });
    let staffId = null;
    if (staff.length > 0) {
      const staffTaskCounts = await Promise.all(
        staff.map(async (s) => {
          const count = await Task.countDocuments({ staffId: s._id, status: "pending" });
          return { staffId: s._id, count };
        })
      );
      staffId = staffTaskCounts.reduce((min, curr) => (curr.count < min.count ? curr : min), staffTaskCounts[0]).staffId;
    }
    const task = new Task({
      roomId: booking.roomNumber,
      description: `Clean room ${booking.roomNumber} after guest check-out`,
      taskType: "post-check-out",
      scheduledDate: new Date(),
      bookingId: booking._id,
      staffId,
    });
    await task.save();
    const io = req.app.get("io");
    io.emit("new_task", { task });
    if (staffId) {
      const assignedStaff = await Guest.findById(staffId);
      try {
        await sendNotification(assignedStaff.email, `Task assigned: Clean room ${booking.roomNumber} after check-out`);
        io.emit("task_assigned", { taskId: task._id, staffId });
      } catch (error) {
        console.error("Notification failed:", error);
      }
    }
    res.status(200).json({
      success: true,
      data: {
        ...updatedBooking.toObject(),
        guest: {
          firstName: guest?.fname || "Unknown",
          lastName: guest?.lname || "Unknown",
          phoneNumber: guest?.phoneNumber || "N/A",
        },
      },
    });
  } catch (error) {
    console.error(`checkoutRoomBooking: Error for booking ${req.params.id}:`, {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    res.status(500).json({ success: false, message: `Internal server error: ${error.message}` });
  }
}

export async function getAllRoomBookings(req, res) {
  console.log(`getAllRoomBookings: ${req.method} ${req.originalUrl} - User email: ${req.userEmail}, Role: ${req.userRole}`);
  try {
    if (req.userRole !== "Admin") {
      console.log(`getAllRoomBookings: ${req.method} ${req.originalUrl} - Access denied. User role: ${req.userRole}`);
      return res.status(403).json({ success: false, message: "Only admins can view all bookings" });
    }
    const { page = 1, limit = 10, status } = req.query;
    const query = status ? { bookingStatus: status } : {};
    console.log(`getAllRoomBookings: ${req.method} ${req.originalUrl} - Query:`, query);

    const bookings = await Booking.find(query)
      .populate({
        path: "guestEmail",
        model: "Guest",
        select: "fname lname phoneNumber email",
        match: { _id: { $exists: true } },
        transform: (doc) => {
          if (!doc) {
            console.warn(`getAllRoomBookings: ${req.method} ${req.originalUrl} - Guest not found for booking`);
            return null;
          }
          return {
            firstName: doc.fname || "Unknown",
            lastName: doc.lname || "Unknown",
            phoneNumber: doc.phoneNumber || "N/A",
            email: doc.email || "N/A",
          };
        },
      })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await Booking.countDocuments(query);
    console.log(`getAllRoomBookings: ${req.method} ${req.originalUrl} - Fetched ${bookings.length} bookings, Total: ${total}`);

    res.status(200).json({
      success: true,
      data: bookings.map((booking) => ({
        ...booking.toObject(),
        guest: booking.guestEmail || null,
      })),
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error(`getAllRoomBookings: ${req.method} ${req.originalUrl} - Error:`, {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    res.status(500).json({ success: false, message: `Internal server error: ${error.message}` });
  }
}

export async function getMyRoomBookings(req, res) {
  try {
    console.log(`getMyRoomBookings - User UID: ${req.userId}`);
    const guest = await Guest.findOne({ firebaseUid: req.userId });
    
    if (!guest) {
      console.error(`getMyRoomBookings - Guest not found for UID: ${req.userId}`);
      return res.status(404).json({ success: false, message: "Guest not found" });
    }

    const bookings = await Booking.find({ guestEmail: guest._id })
      .populate("guestEmail", "fname lname phoneNumber")
      .sort({ createdAt: -1 })
      .lean();

    console.log(`getMyRoomBookings - Fetched ${bookings.length} bookings for guest ${guest._id}`);
    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("getMyRoomBookings - Error:", {
      message: error.message,
      stack: error.stack,
      userId: req.userId,
    });
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
}

export async function getBookings(req, res) {
  try {
    const guest = await Guest.findOne({ email: req.userEmail });
    if (!guest) {
      return res.status(404).json({ success: false, message: "Guest not found" });
    }
    const bookings = await Booking.find({
      guestEmail: guest._id,
      bookingStatus: "confirmed",
      checkInDate: { $lte: new Date() },
      checkOutDate: { $gte: new Date() },
    }).sort({ createdAt: -1 });

    const enrichedBookings = bookings.map((booking) => ({
      ...booking.toObject(),
      guest: {
        firstName: guest.fname,
        lastName: guest.lname,
        phoneNumber: guest.phoneNumber,
      },
    }));

    res.status(200).json({ success: true, data: enrichedBookings });
  } catch (error) {
    console.error("Error in getBookings:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getStaffBookings(req, res) {
  try {
    const user = await Guest.findOne({ email: req.userEmail });
    if (!["Staff", "Admin"].includes(user.role)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { page = 1, limit = 10 } = req.query;
    const bookings = await Booking.find({
      bookingStatus: "confirmed",
      checkInDate: { $lte: new Date() },
      checkOutDate: { $gte: new Date() },
    })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Booking.countDocuments({
      bookingStatus: "confirmed",
      checkInDate: { $lte: new Date() },
      checkOutDate: { $gte: new Date() },
    });

    const enrichedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const guest = await Guest.findById(booking.guestEmail);
        return {
          ...booking.toObject(),
          guest: {
            firstName: guest?.fname || "Unknown",
            lastName: guest?.lname || "Unknown",
            phoneNumber: guest?.phoneNumber || "N/A",
          },
        };
      })
    );

    res.status(200).json({
      success: true,
      data: enrichedBookings,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Error in getStaffBookings:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getRoomBookingById(req, res) {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const guest = await Guest.findById(booking.guestEmail);

    res.status(200).json({
      success: true,
      data: {
        ...booking.toObject(),
        guest: {
          firstName: guest?.fname || "Unknown",
          lastName: guest?.lname || "Unknown",
          phoneNumber: guest?.phoneNumber || "N/A",
        },
      },
    });
  } catch (error) {
    console.error("Error in getRoomBookingById:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateRoomBooking(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid booking ID" });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Validate updates
    if (updates.checkInDate || updates.checkOutDate) {
      const checkIn = new Date(updates.checkInDate || booking.checkInDate);
      const checkOut = new Date(updates.checkOutDate || booking.checkOutDate);
      if (checkIn >= checkOut) {
        return res.status(400).json({ success: false, message: "Check-out date must be after check-in date" });
      }

      // Check for overlapping bookings
      const existingBookings = await Booking.find({
        roomNumber: booking.roomNumber,
        _id: { $ne: id },
        $or: [
          { checkInDate: { $lte: checkOut }, checkOutDate: { $gte: checkIn } },
        ],
        bookingStatus: { $in: ["pending", "confirmed"] },
      });

      if (existingBookings.length > 0) {
        return res.status(409).json({ success: false, message: "Room already booked for these dates" });
      }
    }

    // Update booking with provided fields
    Object.assign(booking, updates);
    await booking.save();

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    console.error("Error in updateRoomBooking:", error);
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
}

export async function deleteRoomBooking(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid booking ID" });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Allow deletion only for cancelled or completed bookings
    if (booking.bookingStatus !== "cancelled" && booking.bookingStatus !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Only cancelled or completed bookings can be deleted by users",
      });
    }

    await Booking.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Error in deleteRoomBooking:", error);
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
}

export async function rejectRoomBooking(req, res) {
  try {
    if (req.userRole !== "Admin") {
      return res.status(403).json({ success: false, message: "Only admins can reject bookings" });
    }
    const bookingId = req.params.id;
    console.log(`rejectRoomBooking: Processing booking ID: ${bookingId}`);
    if (!mongoose.isValidObjectId(bookingId)) {
      console.error(`rejectRoomBooking: Invalid booking ID: ${bookingId}`);
      return res.status(400).json({ success: false, message: "Invalid booking ID" });
    }
    const { rejectedReason } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      console.error(`rejectRoomBooking: Booking not found: ${bookingId}`);
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    if (booking.bookingStatus !== "pending") {
      console.warn(`rejectRoomBooking: Booking is not pending: ${bookingId}, status: ${booking.bookingStatus}`);
      return res.status(400).json({ success: false, message: "Booking is not pending" });
    }
    console.log(`rejectRoomBooking: Booking found, guestEmail: ${booking.guestEmail}`);
    if (!mongoose.isValidObjectId(booking.guestEmail)) {
      console.error(`rejectRoomBooking: Invalid guestEmail for booking ${bookingId}: ${booking.guestEmail}`);
      return res.status(400).json({ success: false, message: "Invalid guestEmail in booking" });
    }
    booking.bookingStatus = "cancelled";
    booking.rejectedReason = rejectedReason || "Cancelled by admin";
    const updatedBooking = await booking.save();
    const guest = await Guest.findById(updatedBooking.guestEmail);
    if (!guest) {
      console.warn(`rejectRoomBooking: Guest not found for guestEmail: ${updatedBooking.guestEmail}`);
    }
    res.status(200).json({
      success: true,
      data: {
        ...updatedBooking.toObject(),
        guest: {
          firstName: guest?.fname || "Unknown",
          lastName: guest?.lname || "Unknown",
          phoneNumber: guest?.phoneNumber || "N/A",
        },
      },
    });
  } catch (error) {
    console.error(`rejectRoomBooking: Error for booking ${req.params.id}:`, {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    res.status(500).json({ success: false, message: `Internal server error: ${error.message}` });
  }
}