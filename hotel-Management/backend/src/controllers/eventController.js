import Event from "../models/eventModel.js";

export const getEventTypes = async (req, res) => {
  try {
    const events = await Event.find({}, "eventType");

    if (events.length === 0) {
      return res.status(404).send("No events found");
    }

    const eventTypes = events.map((event) => event.eventType);

    res.status(200).json({ success: true, eventTypes });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).send("Failed to fetch event types");
  }
};
