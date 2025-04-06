// routes/auth.js
import express from 'express';
import passport from 'passport';
import { getEnvVariable } from '../utils/env.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar'],
  accessType: 'offline',
  prompt: 'consent',
}));

// router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), async (req, res) => {
//   if (req.user) {
//     const { accessToken, refreshToken } = req.user; // Make sure passport strategy attaches them
//     await User.findByIdAndUpdate(req.user._id, { accessToken, refreshToken });
//   }
//   console.log("Auth successful, redirecting to dashboard");
//   res.redirect(`${getEnvVariable('FRONTEND_URL')}/dashboard`);
// });


router.get('/google/callback', passport.authenticate('google', { 
  failureRedirect: `${getEnvVariable('FRONTEND_URL')}/login?error=auth_failed` 
}), async (req, res) => {
  console.log("User after auth:", req.user);
  console.log("Session ID after auth:", req.sessionID);
  
  // Add this to ensure tokens are saved correctly
  if (req.user) {
    try {
      await User.findByIdAndUpdate(req.user._id, { 
        accessToken: req.user.accessToken, 
        refreshToken: req.user.refreshToken 
      });
      console.log("Tokens saved successfully");
    } catch (err) {
      console.error("Error saving tokens:", err);
    }
  }
  
  res.redirect(`${getEnvVariable('FRONTEND_URL')}/dashboard`);
});


router.get('/logout', (req, res) => {
  req.logout(() => res.redirect('/'));
});

router.get('/me', (req, res) => {
  if (req.isAuthenticated() && req.user) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

export default router;