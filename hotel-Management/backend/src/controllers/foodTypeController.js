import FoodType from "../models/foodTypeModel.js";

export const getFoodType = async (req, res) => {
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

    const foodTypes = await FoodType.find();
    res.send(foodTypes);
  } catch (error) {
    console.error("Error fetching food types:", error);
    res.send(false);
  }
};
