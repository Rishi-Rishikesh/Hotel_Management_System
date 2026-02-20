import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema(
  {
    itemId: { type: String, required: true },
    type: { type: String, enum: ['room', 'hall'], required: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('Review', ReviewSchema);