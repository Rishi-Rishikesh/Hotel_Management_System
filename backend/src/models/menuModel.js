import mongoose from "mongoose";

const menuSchema = new mongoose.Schema({
  type: String,
  name: String,
  price: Number,
});

const Menu = mongoose.model("Menu", menuSchema, "menu");

export default Menu;
