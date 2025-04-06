import { google } from 'googleapis';
import dayjs from 'dayjs';
import User from '../models/User.js';

export const createGoogleCalendarEvent = async ({ user, meeting }) => {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    // Set stored tokens
    oauth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken,
    });

    // Auto-update tokens if refreshed
    oauth2Client.on('tokens', async (tokens) => {
      const update = {};
      if (tokens.access_token) update.googleAccessToken = tokens.access_token;
      if (tokens.refresh_token) update.googleRefreshToken = tokens.refresh_token;

      if (Object.keys(update).length > 0) {
        await User.findByIdAndUpdate(user._id, update);
      }
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Format date and time
    const normalizedDate = dayjs(meeting.date).format('YYYY-MM-DD');
    const startInput = `${normalizedDate} ${meeting.startTime}`;
    const endInput = `${normalizedDate} ${meeting.endTime}`;

    const startDateTime = dayjs(startInput);
    const endDateTime = dayjs(endInput);

    if (!startDateTime.isValid() || !endDateTime.isValid()) {
      console.error("❌ Invalid date/time values:", { startInput, endInput });
      throw new Error("Invalid meeting date or time");
    }

    const event = {
      summary: `Meeting with ${meeting.guestEmail}`,
      description: meeting.description || '',
      start: {
        dateTime: startDateTime.format(), // ISO string
        timeZone: 'Asia/Kolkata',
      },
      end: {
        dateTime: endDateTime.format(),
        timeZone: 'Asia/Kolkata',
      },
      attendees: [{ email: meeting.guestEmail }],
      conferenceData: {
        createRequest: {
          requestId: `meet-${meeting._id}`,
        },
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      conferenceDataVersion: 1,
    });

    return response.data;
  } catch (error) {
    console.error('❌ Failed to create calendar event:', error.response?.data || error.message);
    throw new Error('Google Calendar API error');
  }
};
