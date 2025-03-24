import Availability from '../models/Availability.js';
import Meeting from '../models/Meetings.js';

// Logged-in user's availability
export const getAvailability = async (req, res, next) => {
  try {
    const availability = await Availability.findOne({ user: req.user.id });
    res.json(availability || { slots: [] });
  } catch (err) {
    next(err);
  }
};

export const setAvailability = async (req, res, next) => {
  try {
    const updated = await Availability.findOneAndUpdate(
      { user: req.user.id },
      { slots: req.body.slots },
      { new: true, upsert: true }
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// Guest use – Get available time range for a given meeting
export const getMeetingAvailability = async (req, res, next) => {
  try {
    const meeting = await Meeting.findById(req.params.meetingId);
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    const availability = await Availability.findOne({ user: meeting.organizer });
    if (!availability) return res.status(404).json({ message: "Availability not set" });

    const dateEntry = availability.slots.find((slot) =>
      new Date(slot.date).toDateString() === new Date(meeting.date).toDateString()
    );

    if (!dateEntry || dateEntry.slots.length === 0) {
      return res.status(404).json({ message: "No available slots on that day" });
    }

    const first = dateEntry.slots[0];
    const last = dateEntry.slots[dateEntry.slots.length - 1];

    res.json({ startTime: first.startTime, endTime: last.endTime });
  } catch (err) {
    next(err);
  }
};
