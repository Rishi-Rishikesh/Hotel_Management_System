import Menu from "../models/orderModel.js";

export const getMenu = async (req, res) => {
  try {
    const email = req.cookies.email;

    if (!email) {
      return res.send("Unauthorized access");
    }

    const existingEventBooking = await EventBooking.findOne({ email: email });
    const existingRoomBooking = await RoomBooking.findOne({ email: email });

    if (!existingEventBooking || !existingRoomBooking) {
      return res.send(false);
    }

    const menu = await Menu.find();
    res.send(menu);
  } catch (error) {
    console.error("Error fetching menu items:", error);
    res.send(false);
  }
};
