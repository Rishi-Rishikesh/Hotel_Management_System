import Guest from "../models/guestModel.js";

export const getUserProfile = async (req, res) => {
  try {
    console.log(`getUserProfile: ${req.method} ${req.originalUrl} - Starting with userId: ${req.userId}, role: ${req.userRole}`);
    if (!req.userId) {
      console.error(`getUserProfile: Missing userId`);
      return res.status(401).json({ success: false, message: "User ID not found. Please authenticate" });
    }

    const user = await Guest.findOne({ firebaseUid: req.userId }).select("email role status");
    if (!user) {
      console.log(`getUserProfile: User not found for UID: ${req.userId}`);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    console.log(`getUserProfile: User found:`, user);
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error(`getUserProfile: Error:`, {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ success: false, message: "Server error fetching user profile" });
  }
};



export const getStaffList = async (req, res) => {
  try {
    const staff = await Guest.find({ role: "Staff" }).select("name email");
    res.status(200).json({ success: true, staff });
  } catch (error) {
    console.error("Error fetching staff list:", error);
    res.status(500).json({ success: false, message: `Failed to fetch staff list: ${error.message}` });
  }
};