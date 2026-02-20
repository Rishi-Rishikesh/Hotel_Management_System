import mongoose from "mongoose";

const deleted_guestSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  reason: String,
});

const DeletedGuest = mongoose.model(
  "DeletedGuest",
  deleted_guestSchema,
  "deleted_guest"
);

export default DeletedGuest;
