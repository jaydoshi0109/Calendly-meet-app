import express from 'express';
import { google } from 'googleapis';
import { getEnvVariable } from '../utils/env.js';
import passport from 'passport';
import { ensureAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

const oauth2Client = new google.auth.OAuth2(
  getEnvVariable('GOOGLE_CLIENT_ID'),
  getEnvVariable('GOOGLE_CLIENT_SECRET'),
  `${getEnvVariable('BACKEND_URL')}/api/auth/google/callback`
);

// Step 1: Redirect to Google OAuth for Calendar Scope
router.get('/auth', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar'],
    prompt: 'consent',
  });
  res.json({ url });
});

// Step 2: Callback to Update Tokens
router.get('/callback', passport.authenticate('google', { failureRedirect: '/' }), async (req, res) => {
  try {
    // Update tokens with the correct field names stored in your User model
    req.user.googleAccessToken = req.authInfo && req.authInfo.accessToken ? req.authInfo.accessToken : req.user.googleAccessToken;
    req.user.googleRefreshToken = req.authInfo && req.authInfo.refreshToken ? req.authInfo.refreshToken : req.user.googleRefreshToken;
    await req.user.save();
    console.log("Auth successful, redirecting to dashboard");
    res.redirect(`${getEnvVariable('FRONTEND_URL')}/dashboard`);
  } catch (error) {
    console.error('Error saving tokens:', error);
    res.redirect(`${getEnvVariable('FRONTEND_URL')}/error`);
  }
});

// Protected: Check Connection Status
router.get('/status', ensureAuth, (req, res) => {
  res.json({ connected: !!req.user.googleAccessToken });
});

// Protected: List Google Calendar Events
router.get('/events', ensureAuth, async (req, res, next) => {
  try {
    if (!req.user.googleAccessToken) {
      return res.status(401).json({ message: 'User not connected to Google' });
    }
    oauth2Client.setCredentials({
      access_token: req.user.googleAccessToken,
      refresh_token: req.user.googleRefreshToken,
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

export default router;
