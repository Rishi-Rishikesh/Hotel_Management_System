import Hall from "../models/Hall.model.js";

export const addHall = async (req, res) => {
  try {
    const { number, capacity, price, description, facilities, status } = req.body;

    // Validate required fields
    if (!number || !capacity || !price) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: number, capacity, price",
      });
    }

    // Create new hall
    const newHall = new Hall({
      number,
      capacity,
      price,
      description,
      facilities: facilities || [],
      status,
    });

    await newHall.save();
    res.status(201).json({
      success: true,
      message: "Hall added successfully",
      data: newHall,
    });
  } catch (error) {
    console.error("Error adding hall:", error.message, error.stack);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: `Validation error: ${error.message}`,
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Hall number already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error adding hall",
    });
  }
};

export const getHalls = async (req, res) => {
  try {
    const { capacity, status, minPrice, maxPrice } = req.query;
    console.log("getHalls - Query parameters:", req.query); // Log query params
    const query = {};
    if (capacity) query.capacity = { $gte: Number(capacity) };
    if (status) query.status = { $in: status.split(",") };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    console.log("getHalls - MongoDB query:", query); // Log constructed query
    const halls = await Hall.find(query).lean();
    console.log("getHalls - Found halls:", halls); // Log fetched halls
    if (!halls.length) {
      return res.status(200).json({
        success: true,
        halls: [],
        message: "No halls found",
      });
    }
    res.status(200).json({
      success: true,
      halls,
    });
  } catch (error) {
    console.error("Error fetching halls:", error.message, error.stack);
    res.status(500).json({
      success: false,
      message: "Failed to fetch halls",
    });
  }
};

export const updateHall = async (req, res) => {
  try {
    const { number } = req.params;
    const { capacity, price, description, facilities, status } = req.body;

    // Find and update hall
    const hall = await Hall.findOneAndUpdate(
      { number },
      { capacity, price, description, facilities, status },
      { new: true, runValidators: true }
    );

    if (!hall) {
      return res.status(404).json({
        success: false,
        message: "Hall not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Hall updated successfully",
      data: hall,
    });
  } catch (error) {
    console.error("Error updating hall:", error.message, error.stack);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: `Validation error: ${error.message}`,
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error updating hall",
    });
  }
};

export const deleteHall = async (req, res) => {
  try {
    const { number } = req.params;

    const hall = await Hall.findOneAndDelete({ number });

    if (!hall) {
      return res.status(404).json({
        success: false,
        message: "Hall not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Hall deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting hall:", error.message, error.stack);
    res.status(500).json({
      success: false,
      message: "Server error deleting hall",
    });
  }
};



export async function getAvailableHalls(req, res) {
  try {
    // Fetch all halls (you can add filters, e.g., for availability)
    const halls = await Hall.find({}).select('number capacity');
    res.status(200).json({
      success: true,
      data: halls,
    });
  } catch (error) {
    console.error('Error in getAvailableHalls:', error);
    res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
}