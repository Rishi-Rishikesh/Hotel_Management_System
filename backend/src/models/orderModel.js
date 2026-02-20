import { Schema, model } from 'mongoose';

const orderSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'Guest' },
  items: [
    {
      id: { type: Number, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      image: { type: String },
      description: { type: String },
      mealType: { type: String },
      category: { type: String },
    },
  ],
  totalPrice: { type: Number, required: true },
  deliveryTime: { type: String, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
}, { timestamps: true });

orderSchema.index({ userId: 1 });
export default model('Order', orderSchema);