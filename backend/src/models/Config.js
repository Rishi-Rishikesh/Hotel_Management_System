import { Schema, model } from "mongoose";

const ConfigSchema = new Schema({
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true },
});

export default model("Config", ConfigSchema);