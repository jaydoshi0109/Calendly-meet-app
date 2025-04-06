import express from 'express';
import { google } from 'googleapis';
import { getEnvVariable } from '../utils/env.js';
import User from '../models/User.js'; // assuming User model exists
// import passport from 'passport';
import { ensureAuth } from '../middleware/authMiddleware.js';
const router = express.Router();

const oauth2Client = new google.auth.OAuth2(
  getEnvVariable('GOOGLE_CLIENT_ID'),
  getEnvVariable('GOOGLE_CLIENT_SECRET'),
  `${getEnvVariable('BACKEND_URL')}/api/auth/google/callback`
);

// Step 1: Redirect to Google OAuth
router.get('/auth', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar'],
    prompt: 'consent',
  });
  res.json({ url });
});

// Step 2: Callback to save tokens
// router.get('/callback', passport.authenticate('google', { failureRedirect: '/' }), async (req, res) => {
//   try {
//     // Save tokens to user model
//     req.user.accessToken = req.authInfo.accessToken;
//     req.user.refreshToken = req.authInfo.refreshToken;
//     await req.user.save();
//     console.log("Auth successful, redirecting to dashboard");
//     res.redirect(`${getEnvVariable('FRONTEND_URL')}/dashboard`);
//   } catch (error) {
//     console.error('Error saving tokens:', error);
//     res.redirect(`${getEnvVariable('FRONTEND_URL')}/error`);
//   }
// });


// Check connection status
router.get('/status', ensureAuth, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ connected: !!user.googleAccessToken });
});


// List Google Calendar Events
router.get('/events', ensureAuth,async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.googleAccessToken) {
      return res.status(401).json({ message: 'User not connected to Google' });
    }
    oauth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const events = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });

    res.json(events.data.items);
  } catch (error) {
    next(error);
  }
});

router.get('/status', ensureAuth, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ connected: !!user.googleAccessToken });
});

export default router;
