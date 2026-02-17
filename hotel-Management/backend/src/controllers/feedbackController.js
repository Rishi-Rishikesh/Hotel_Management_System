import Feedback from "../models/Feedback.model.js";

export const addFeedback = async (req, res) => {
  try {
    const {
      name,
      email,
      roomType,
      cleanliness,
      comfort,
      staff,
      location,
      valueForMoney,
      overallRating,
      comments,
      suggestions,
      stayAgain,
    } = req.body;

    // Enhanced validation
    if (!name || !email || !roomType || stayAgain === null) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    if (!["Room", "Hall", "Villa"].includes(roomType)) {
      return res.status(400).json({ success: false, message: "Invalid room type" });
    }

    const ratings = [cleanliness, comfort, staff, location, valueForMoney, overallRating];
    for (const rating of ratings) {
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, message: "Ratings must be integers between 1 and 5" });
      }
    }

    const newFeedback = new Feedback({
      name,
      email,
      roomType,
      cleanliness,
      comfort,
      staff,
      location,
      valueForMoney,
      overallRating,
      comments,
      suggestions,
      stayAgain,
    });

    await newFeedback.save();
    console.log("Feedback added to the database successfully");
    res.status(201).json({ success: true });
  } catch (error) {
    console.error("Error adding feedback:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to add feedback" });
  }
};

export const getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find();

    if (feedbacks.length === 0) {
      return res.status(404).json({ success: false, message: "No feedback found" });
    }

    res.status(200).json({ success: true, feedbacks });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ success: false, message: "Failed to fetch feedback" });
  }
};

export const getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ success: false, message: "Feedback not found" });
    }

    res.status(200).json({ success: true, feedback });
  } catch (error) {
    console.error("Error fetching feedback by ID:", error);
    res.status(500).json({ success: false, message: "Failed to fetch feedback" });
  }
};