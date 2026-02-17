import Review from "../models/Review.js";
import Booking from "../models/Booking.model.js";
import HallBooking from "../models/HallBooking.model.js";
import Guest from "../models/guestModel.js";
import mongoose from "mongoose";

export const getUserReviews = async (req, res) => {
  try {
    const userId = req.userId; // From authMiddleware
    console.log(`getUserReviews - Fetching reviews for userId: ${userId}`);
    const reviews = await Review.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    console.error("getUserReviews - Error:", {
      message: error.message,
      stack: error.stack,
      userId: req.userId,
    });
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};

export const submitReview = async (req, res) => {
  try {
    const { itemId, type, userName, rating, comment, bookingId } = req.body;

    // Validate required fields
    if (!itemId || !type || !userName || !rating || !comment || !bookingId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Validate type
    if (!["room", "hall"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid type: must be 'room' or 'hall'",
      });
    }

    // Validate bookingId format
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid bookingId format",
      });
    }

    // Get userId from authMiddleware
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Find guest by firebaseUid
    const guest = await Guest.findOne({ firebaseUid: userId });
    if (!guest) {
      return res.status(404).json({
        success: false,
        message: "Guest not found",
      });
    }

    // Validate booking exists and belongs to guest
    let booking;
    if (type === "room") {
      booking = await Booking.findOne({ _id: bookingId, guestEmail: guest._id });
    } else {
      booking = await HallBooking.findOne({ _id: bookingId, guest: guest._id });
    }

    if (!booking) {
      return res.status(400).json({
        success: false,
        message: `Booking not found for ${type}`,
      });
    }

    // Create review
    const review = new Review({
      itemId,
      type,
      userId,
      userName,
      rating,
      comment,
      bookingId,
      createdAt: new Date(),
    });

    await review.save();

    res.status(201).json({
      success: true,
      review,
    });
  } catch (error) {
    console.error("submitReview - Error:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
      body: req.body,
      userId: req.userId,
      userEmail: req.userEmail,
      errors: error.errors || {},
    });
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: `Validation error: ${error.message}`,
      });
    }
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    });
  }
};

export const getItemReviews = async (req, res) => {
  try {
    const { type, itemId } = req.params;
    console.log(`getItemReviews - Fetching reviews for type: ${type}, itemId: ${itemId}`);
    if (!["room", "hall"].includes(type)) {
      return res.status(400).json({ success: false, message: "Invalid review type" });
    }
    const reviews = await Review.find({ type, itemId }).sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    console.error("getItemReviews - Error:", {
      message: error.message,
      stack: error.stack,
      params: req.params,
    });
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const userId = req.userId; // From authMiddleware
    console.log(`updateReview - Updating review id: ${req.params.id} for userId: ${userId}`);
    
    // Validate required fields
    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Rating and comment are required",
      });
    }

    const review = await Review.findOneAndUpdate(
      { _id: req.params.id, userId },
      { rating, comment, updatedAt: new Date() },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found or unauthorized",
      });
    }

    res.json({ success: true, review });
  } catch (error) {
    console.error("updateReview - Error:", {
      message: error.message,
      stack: error.stack,
      userId: req.userId,
      reviewId: req.params.id,
    });
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const userId = req.userId; // From authMiddleware
    console.log(`deleteReview - Deleting review id: ${req.params.id} for userId: ${userId}`);
    
    const review = await Review.findOneAndDelete({ _id: req.params.id, userId });
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found or unauthorized",
      });
    }

    res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    console.error("deleteReview - Error:", {
      message: error.message,
      stack: error.stack,
      userId: req.userId,
      reviewId: req.params.id,
    });
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};