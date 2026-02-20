// models/adminNotificationModel.js
import { Schema, model } from 'mongoose';

const adminNotificationSchema = new Schema({
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
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export default model('AdminNotification', adminNotificationSchema);