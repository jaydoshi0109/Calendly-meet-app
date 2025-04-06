import Meeting from '../models/Meetings.js';
import { createGoogleCalendarEvent } from '../utils/googleCalendar.js';
import { google } from "googleapis";

// Create Meeting Link (from Dashboard)
// Expects payload: { title, description, duration } (duration optional)
export const createMeeting = async (req, res) => {
  try {
    const { title, description, guestEmail, date, startTime, endTime } = req.body;

    const expiresAt = new Date(date);
    expiresAt.setHours(23, 59, 59, 999); // Invitation expires at end of the date.

    const meeting = await Meeting.create({
      organizer: req.user.id,
      title,
      description,
      guestEmail,
      date,
      startTime,
      endTime,
      expiresAt,
      status: 'pending'
    });

    res.json({ link: `https://calendly-meet-app-fe.onrender.com/confirm/${meeting._id}`, id: meeting._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// Confirm Meeting + Calendar Integration
// Expects payload: { guestEmail, date, startTime, endTime, description }
// Note: The Dashboard-created meeting already has title & description.
// Here, we update scheduling details and create the Google Calendar event.
export const confirmMeeting = async (req, res) => {
  try {
    console.log("Confirming meeting:", req.params.id);
    console.log("Payload:", req.body);

    const meeting = await Meeting.findById(req.params.id).populate(
      'organizer',
      'name email googleAccessToken googleRefreshToken'
    );
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

    // Update scheduling details without overriding the title.
    const { guestEmail, date, startTime, endTime, description } = req.body;
    if (guestEmail) meeting.guestEmail = guestEmail;
    if (date) meeting.date = date;
    if (startTime) meeting.startTime = startTime;
    if (endTime) meeting.endTime = endTime;
    // Optionally update description if provided (or leave Dashboard description intact)
    if (description) meeting.description = description;

    const calendarEvent = await createGoogleCalendarEvent({ user: meeting.organizer, meeting });

    meeting.status = 'confirmed';
    meeting.calendarEventId = calendarEvent.id;
    meeting.meetLink = calendarEvent.hangoutLink;
    await meeting.save();

    console.log("Meeting confirmed:", meeting);
    res.json({ meetLink: meeting.meetLink, calendarEventId: meeting.calendarEventId });
  } catch (err) {
    console.error("Error in confirmMeeting:", err);
    res.status(500).json({ message: err.message });
  }
};

// Cancel Meeting (Google Calendar + DB)
// This version finds the meeting using calendarEventId
export const cancelMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id).populate('organizer');
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

    // Delete from Google Calendar if it was confirmed
    if (meeting.calendarEventId) {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );

      oauth2Client.setCredentials({
        access_token: meeting.organizer.googleAccessToken,
        refresh_token: meeting.organizer.googleRefreshToken,
      });

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      await calendar.events.delete({
        calendarId: 'primary',
        eventId: meeting.calendarEventId,
      });
    }

    await meeting.deleteOne();
    res.json({ message: 'Meeting cancelled successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to cancel meeting', error: err.message });
  }
};



export const getMeetingLogs = async (req, res) => {
  try {
    // Fetch meetings for the authenticated user, sorted by most recent
    const logs = await Meeting.find({ organizer: req.user.id }).sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Endpoint: Invitee accepting the invitation
export const acceptMeeting = async (req, res) => {
  try {
    const { id } = req.params;

    const meeting = await Meeting.findById(id).populate(
      'organizer',
      'name email googleAccessToken googleRefreshToken'
    );
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

    // Clearly prevent duplicate accept
    if (meeting.status !== 'pending') {
      return res.status(400).json({ message: `Meeting already ${meeting.status}` });
    }

    const calendarEvent = await createGoogleCalendarEvent({ user: meeting.organizer, meeting });

    meeting.status = 'confirmed';
    meeting.calendarEventId = calendarEvent.id;
    meeting.meetLink = calendarEvent.hangoutLink;
    await meeting.save();

    res.json({ message: 'Meeting confirmed successfully', meetLink: meeting.meetLink });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// Endpoint: Invitee declining the invitation
export const declineMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const meeting = await Meeting.findById(id);
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

    // Clearly prevent duplicate decline
    if (meeting.status !== 'pending') {
      return res.status(400).json({ message: `Meeting already ${meeting.status}` });
    }

    meeting.status = 'declined';
    await meeting.save();

    res.json({ message: 'Meeting declined successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getUserMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({
      organizer: req.user.id,
      status: { $in: ["pending", "confirmed"] }, // Fetch only valid meetings clearly
      date: { $gte: new Date() }, // Optional: fetch only future meetings
    }).sort({ date: -1 });

    res.json(meetings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMeetingById = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

    res.json(meeting);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

