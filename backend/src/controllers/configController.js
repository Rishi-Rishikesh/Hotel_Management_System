import Config from "../models/Config.js";

export const getConfig = async (req, res) => {
  try {
    if (req.userRole !== "Admin") {
      return res.status(403).json({ success: false, message: "Only admins can view config" });
    }
    const config = await Config.findOne({ key: "CLEANING_THRESHOLD_DAYS" });
    res.status(200).json({
      success: true,
      data: config ? { key: config.key, value: parseInt(config.value) } : { key: "CLEANING_THRESHOLD_DAYS", value: 3 },
    });
  } catch (error) {
    console.error("Error fetching config:", error);
    res.status(500).json({ success: false, message: `Failed to fetch config: ${error.message}` });
  }
};

export const updateConfig = async (req, res) => {
  try {
    if (req.userRole !== "Admin") {
      return res.status(403).json({ success: false, message: "Only admins can update config" });
    }
    const { key, value } = req.body;
    if (key !== "CLEANING_THRESHOLD_DAYS") {
      return res.status(400).json({ success: false, message: "Invalid config key" });
    }
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 3 || numValue > 5) {
      return res.status(400).json({ success: false, message: "Value must be between 3 and 5" });
    }
    const config = await Config.findOneAndUpdate(
      { key: "CLEANING_THRESHOLD_DAYS" },
      { key: "CLEANING_THRESHOLD_DAYS", value: numValue },
      { upsert: true, new: true }
    );
    res.status(200).json({ success: true, data: { key: config.key, value: parseInt(config.value) } });
  } catch (error) {
    console.error("Error updating config:", error);
    res.status(500).json({ success: false, message: `Failed to update config: ${error.message}` });
  }
};