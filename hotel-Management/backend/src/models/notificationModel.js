// models/notificationModel.js
import { Schema, model } from 'mongoose';

const notificationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'Guest',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Order', 'OrderPlaced', 'OrderUpdated', 'OrderCancelled'], // Add all relevant types
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export default model('Notification', notificationSchema);