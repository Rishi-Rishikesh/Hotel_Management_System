import mongoose from "mongoose";
import { checkDateOverlap } from "../utils/bookingUtils.js";
import HallBooking from "../models/HallBooking.model.js";
import Guest from "../models/guestModel.js";
import Hall from "../models/Hall.model.js";

export async function createHallBooking(req, res) {
  try {
    const {
      hallNumber,
      eventDate,
      endDate,
      checkInTime,
      checkOutTime,
      eventType,
      numberOfGuests,
      additionalServices,
      specialRequests,
      paymentMethod,
      totalPrice,
    } = req.body;

    console.log("Received hall booking data:", req.body);
    console.log("req.userEmail:", req.userEmail);

    if (
      !hallNumber ||
      !eventDate ||
      !checkInTime ||
      !eventType ||
      !numberOfGuests ||
      !paymentMethod ||
      totalPrice === undefined
    ) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const validPaymentMethods = ["credit_card", "debit_card", "cash"];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment method. Must be one of: ${validPaymentMethods.join(", ")}`,
      });
    }

    const eventDateObj = new Date(eventDate);
    const endDateObj = endDate ? new Date(endDate) : eventDateObj;
    if (isNaN(eventDateObj)) {
      return res.status(400).json({ success: false, message: "Invalid event date format" });
    }
    if (endDate && isNaN(endDateObj)) {
      return res.status(400).json({ success: false, message: "Invalid end date format" });
    }
    if (endDate && eventDateObj > endDateObj) {
      return res.status(400).json({
        success: false,
        message: "End date must be on or after event date",
      });
    }

    const guest = await Guest.findOne({ email: req.userEmail });
    if (!guest) {
      return res.status(404).json({ success: false, message: "Guest not found" });
    }

    const hall = await Hall.findOne({ number: hallNumber });
    if (!hall) {
      return res.status(404).json({ success: false, message: "Hall not found" });
    }

    const existingBookings = await HallBooking.find({
      hall: hall._id,
      eventDate: eventDateObj,
      bookingStatus: { $in: ["pending", "confirmed"] },
    });

    if (existingBookings.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Hall already booked for this date",
      });
    }

    const newHallBooking = new HallBooking({
      guest: guest._id,
      hall: hall._id,
      hallNumber,
      eventDate,
      endDate,
      checkInTime,
      checkOutTime,
      eventType,
      numberOfGuests,
      additionalServices: additionalServices || [],
      specialRequests,
      paymentMethod,
      totalPrice,
      bookingStatus: "pending",
    });

    const savedBooking = await newHallBooking.save();

    const populatedBooking = await HallBooking.findById(savedBooking._id)
      .populate("guest", "fname lname phoneNumber")
      .populate("hall", "number capacity price");

    res.status(201).json({
      success: true,
      data: {
        ...populatedBooking.toObject(),
        guest: {
          firstName: populatedBooking.guest?.fname || "Unknown",
          lastName: populatedBooking.guest?.lname || "Unknown",
          phoneNumber: populatedBooking.guest?.phoneNumber || "N/A",
        },
        hall: {
          number: populatedBooking.hall?.number || hallNumber,
          capacity: populatedBooking.hall?.capacity || 0,
          price: populatedBooking.hall?.price || 0,
        },
      },
    });
  } catch (error) {
    console.error("Error in createHallBooking:", error);
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
}

export async function getAllHallBookings(req, res) {
  console.log(`getAllHallBookings: ${req.method} ${req.originalUrl} - User email: ${req.userEmail}, Role: ${req.userRole}`);
  try {
    if (req.userRole !== "Admin") {
      console.log(`getAllHallBookings: ${req.method} ${req.originalUrl} - Access denied. User role: ${req.userRole}`);
      return res.status(403).json({ success: false, message: "Only admins can view all bookings" });
    }
    const { page = 1, limit = 10, status } = req.query;
    const query = status ? { bookingStatus: status } : {};
    console.log(`getAllHallBookings: ${req.method} ${req.originalUrl} - Query:`, query);

    const bookings = await HallBooking.find(query)
      .populate({
        path: "guest",
        model: "Guest",
        select: "fname lname phoneNumber email",
        transform: (doc) => {
          if (!doc) {
            console.warn(`getAllHallBookings: Guest not found for booking`);
            return { firstName: "Unknown", lastName: "Unknown", phoneNumber: "N/A", email: "N/A" };
          }
          return {
            firstName: doc.fname || "Unknown",
            lastName: doc.lname || "Unknown",
            phoneNumber: doc.phoneNumber || "N/A",
            email: doc.email || "N/A",
          };
        },
      })
      .populate({
        path: "hall",
        model: "Hall",
        select: "number capacity price",
        transform: (doc) => {
          if (!doc) {
            console.warn(`getAllHallBookings: Hall not found for booking`);
            return { number: "N/A", capacity: 0, price: 0 };
          }
          return {
            number: doc.number || "N/A",
            capacity: doc.capacity || 0,
            price: doc.price || 0,
          };
        },
      })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await HallBooking.countDocuments(query);
    console.log(`getAllHallBookings: Fetched ${bookings.length} bookings, Total: ${total}`);

    res.status(200).json({
      success: true,
      data: bookings.map((booking) => ({
        ...booking.toObject(),
        guest: booking.guest || { firstName: "Unknown", lastName: "Unknown", phoneNumber: "N/A" },
        hall: booking.hall || { number: booking.hallNumber || "N/A", capacity: 0, price: 0 },
      })),
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error(`getAllHallBookings: Error:`, {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    res.status(500).json({ success: false, message: `Internal server error: ${error.message}` });
  }
}

export async function getHallBookingById(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const booking = await HallBooking.findById(id)
      .populate("guest", "fname lname phoneNumber")
      .populate("hall", "number capacity price")
      .lean();

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Hall booking not found",
      });
    }

    res.status(200).json({
      success: true,
      booking: {
        ...booking,
        guest: {
          firstName: booking.guest?.fname || "Unknown",
          lastName: booking.guest?.lname || "Unknown",
          phoneNumber: booking.guest?.phoneNumber || "N/A",
        },
        hall: {
          number: booking.hall?.number || booking.hallNumber || "N/A",
          capacity: booking.hall?.capacity || 0,
          price: booking.hall?.price || 0,
        },
      },
    });
  } catch (error) {
    console.error("Error in getHallBookingById:", error);
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
}

export async function getHallBookingsByHallId(req, res) {
  try {
    const hall = await Hall.findOne({ number: req.params.hallId });
    if (!hall) {
      return res.status(404).json({ success: false, message: "Hall not found" });
    }

    const bookings = await HallBooking.find({ hall: hall._id })
      .populate("guest", "fname lname phoneNumber")
      .populate("hall", "number capacity price")
      .sort({ eventDate: 1 });

    res.status(200).json({
      success: true,
      data: bookings.map((booking) => ({
        ...booking.toObject(),
        guest: {
          firstName: booking.guest?.fname || "Unknown",
          lastName: booking.guest?.lname || "Unknown",
          phoneNumber: booking.guest?.phoneNumber || "N/A",
        },
        hall: {
          number: booking.hall?.number || booking.hallNumber || "N/A",
          capacity: booking.hall?.capacity || 0,
          price: booking.hall?.price || 0,
        },
      })),
    });
  } catch (error) {
    console.error("Error in getHallBookingsByHallId:", error);
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
}

export async function getMyHallBookings(req, res) {
  try {
    console.log(`getMyHallBookings - User UID: ${req.userId}`);
    const guest = await Guest.findOne({ firebaseUid: req.userId });
    if (!guest) {
      console.error(`getMyHallBookings - Guest not found for UID: ${req.userId}`);
      return res.status(404).json({ success: false, message: "Guest not found" });
    }

    const bookings = await HallBooking.find({ guest: guest._id })
      .populate("guest", "fname lname phoneNumber")
      .populate("hall", "number capacity price")
      .sort({ createdAt: -1 })
      .lean();

    console.log(`getMyHallBookings - Fetched ${bookings.length} bookings for guest ${guest._id}`);
    res.status(200).json({
      success: true,
      bookings: bookings.map((booking) => ({
        ...booking,
        guest: {
          firstName: booking.guest?.fname || "Unknown",
          lastName: booking.guest?.lname || "Unknown",
          phoneNumber: booking.guest?.phoneNumber || "N/A",
        },
        hall: {
          number: booking.hall?.number || booking.hallNumber || "N/A",
          capacity: booking.hall?.capacity || 0,
          price: booking.hall?.price || 0,
        },
      })),
    });
  } catch (error) {
    console.error("getMyHallBookings - Error:", {
      message: error.message,
      stack: error.stack,
      userId: req.userId,
    });
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
}




export async function updateHallBooking(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid booking ID' });
    }

    const booking = await HallBooking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    Object.assign(booking, updates);
    await booking.save();

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    console.error('Error in updateHallBooking:', error);
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
}

export async function deleteHallBooking(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid booking ID' });
    }

    const booking = await HallBooking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.bookingStatus !== 'cancelled' && booking.bookingStatus !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Only cancelled or completed bookings can be deleted by users',
      });
    }

    await HallBooking.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error in deleteHallBooking:', error);
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
}


export async function approveHallBooking(req, res) {
  try {
    console.log(`approveHallBooking: Processing booking ID: ${req.params.id}, User: ${req.userEmail}, Role: ${req.userRole}`);

    if (req.userRole !== "Admin") {
      console.log(`approveHallBooking: Access denied. User role: ${req.userRole}`);
      return res.status(403).json({
        success: false,
        message: "Only admins can approve bookings",
      });
    }

    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      console.error(`approveHallBooking: Invalid booking ID: ${id}`);
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const booking = await HallBooking.findById(id);
    if (!booking) {
      console.error(`approveHallBooking: Booking not found: ${id}`);
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.bookingStatus !== "pending") {
      console.warn(`approveHallBooking: Booking is not pending: ${id}, Status: ${booking.bookingStatus}`);
      return res.status(400).json({
        success: false,
        message: `Booking is not pending, current status: ${booking.bookingStatus}`,
      });
    }

    booking.bookingStatus = "confirmed";
    const updatedBooking = await booking.save();

    // Populate guest and hall data, handle missing data gracefully
    const populatedBooking = await HallBooking.findById(updatedBooking._id)
      .populate("guest", "fname lname phoneNumber")
      .populate("hall", "number capacity price");

    console.log(`approveHallBooking: Booking ${id} approved successfully`);

    res.status(200).json({
      success: true,
      data: {
        ...populatedBooking.toObject(),
        guest: {
          firstName: populatedBooking.guest?.fname || "Unknown",
          lastName: populatedBooking.guest?.lname || "Unknown",
          phoneNumber: populatedBooking.guest?.phoneNumber || "N/A",
        },
        hall: {
          number: populatedBooking.hall?.number || populatedBooking.hallNumber || "N/A",
          capacity: populatedBooking.hall?.capacity || 0,
          price: populatedBooking.hall?.price || 0,
        },
      },
    });
  } catch (error) {
    console.error(`approveHallBooking: Error for booking ${req.params.id}:`, {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
}

export async function rejectHallBooking(req, res) {
  try {
    if (req.userRole !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can reject bookings",
      });
    }

    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      console.error(`rejectHallBooking: Invalid booking ID: ${id}`);
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const { rejectedReason } = req.body;
    const booking = await HallBooking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.bookingStatus !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Booking is not pending, current status: ${booking.bookingStatus}`,
      });
    }

    booking.bookingStatus = "cancelled";
    booking.rejectedReason = rejectedReason || "Cancelled by admin";
    const updatedBooking = await booking.save();

    const populatedBooking = await HallBooking.findById(updatedBooking._id)
      .populate("guest", "fname lname phoneNumber")
      .populate("hall", "number capacity price");

    res.status(200).json({
      success: true,
      data: {
        ...populatedBooking.toObject(),
        guest: {
          firstName: populatedBooking.guest?.fname || "Unknown",
          lastName: populatedBooking.guest?.lname || "Unknown",
          phoneNumber: populatedBooking.guest?.phoneNumber || "N/A",
        },
        hall: {
          number: populatedBooking.hall?.number || populatedBooking.hallNumber || "N/A",
          capacity: populatedBooking.hall?.capacity || 0,
          price: populatedBooking.hall?.price || 0,
        },
      },
    });
  } catch (error) {
    console.error("Error in rejectHallBooking:", error);
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
}


