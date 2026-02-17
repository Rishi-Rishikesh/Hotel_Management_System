import Room from "../models/Room.js";

export const addRoom = async (req, res) => {
  try {
    const { roomNumber, type, pricePerNight, capacity, description, status } = req.body;

    // Validate required fields
    if (!roomNumber || !type || !pricePerNight || !capacity) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: roomNumber, type, pricePerNight, capacity",
      });
    }

    // Create new room
    const newRoom = new Room({
      roomNumber,
      type,
      pricePerNight,
      capacity,
      description,
      status,
    });

    await newRoom.save();
    res.status(201).json({
      success: true,
      message: "Room added successfully",
      data: newRoom,
    });
  } catch (error) {
    console.error("Error adding room:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: `Validation error: ${error.message}`,
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Room number already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error adding room",
    });
  }
};

export const getRooms = async (req, res) => {
  try {
    const { type, status, minPrice, maxPrice } = req.query;
    const query = {};

    // Apply filters
    if (type) query.type = { $in: type.split(",") };
    if (status) query.status = { $in: status.split(",") };
    if (minPrice || maxPrice) {
      query.pricePerNight = {};
      if (minPrice) query.pricePerNight.$gte = Number(minPrice);
      if (maxPrice) query.pricePerNight.$lte = Number(maxPrice);
    }

    const rooms = await Room.find(query).lean();
    if (!rooms.length) {
      return res.status(200).json({
        success: true,
        rooms: [],
        message: "No rooms found",
      });
    }

    res.status(200).json({
      success: true,
      rooms,
    });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch rooms",
    });
  }
};

export const updateRoom = async (req, res) => {
  try {
    const { roomNumber } = req.params;
    const { type, pricePerNight, capacity, description, status } = req.body;

    // Find and update room
    const room = await Room.findOneAndUpdate(
      { roomNumber },
      { type, pricePerNight, capacity, description, status },
      { new: true, runValidators: true }
    );

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Room updated successfully",
      data: room,
    });
  } catch (error) {
    console.error("Error updating room:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: `Validation error: ${error.message}`,
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error updating room",
    });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const { roomNumber } = req.params;

    const room = await Room.findOneAndDelete({ roomNumber });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting room:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting room",
    });
  }
};