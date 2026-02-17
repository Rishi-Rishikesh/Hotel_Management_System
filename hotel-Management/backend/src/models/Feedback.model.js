import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const FeedbackSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: [2, "Name must be at least 2 characters"],
  },
  email: {
    type: String,
    required: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email address"],
  },
  roomType: {
    type: String,
    required: true,
    enum: ["Room", "Hall", "Villa"],
  },
  cleanliness: {
    type: Number,
    required: true,
    min: [1, "Rating must be between 1 and 5"],
    max: [5, "Rating must be between 1 and 5"],
    validate: {
      validator: Number.isInteger,
      message: "Rating must be an integer",
    },
  },
  comfort: {
    type: Number,
    required: true,
    min: [1, "Rating must be between 1 and 5"],
    max: [5, "Rating must be between 1 and 5"],
    validate: {
      validator: Number.isInteger,
      message: "Rating must be an integer",
    },
  },
  staff: {
    type: Number,
    required: true,
    min: [1, "Rating must be between 1 and 5"],
    max: [5, "Rating must be between 1 and 5"],
    validate: {
      validator: Number.isInteger,
      message: "Rating must be an integer",
    },
  },
  location: {
    type: Number,
    required: true,
    min: [1, "Rating must be between 1 and 5"],
    max: [5, "Rating must be between 1 and 5"],
    validate: {
      validator: Number.isInteger,
      message: "Rating must be an integer",
    },
  },
  valueForMoney: {
    type: Number,
    required: true,
    min: [1, "Rating must be between 1 and 5"],
    max: [5, "Rating must be between 1 and 5"],
    validate: {
      validator: Number.isInteger,
      message: "Rating must be an integer",
    },
  },
  overallRating: {
    type: Number,
    required: true,
    min: [1, "Rating must be between 1 and 5"],
    max: [5, "Rating must be between 1 and 5"],
    validate: {
      validator: Number.isInteger,
      message: "Rating must be an integer",
    },
  },
  comments: {
    type: String,
    default: "",
    trim: true,
    maxlength: [500, "Comments cannot exceed 500 characters"],
  },
  suggestions: {
    type: String,
    default: "",
    trim: true,
    maxlength: [500, "Suggestions cannot exceed 500 characters"],
  },
  stayAgain: {
    type: Boolean,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default models.Feedback || model("Feedback", FeedbackSchema);