// routes/auth.js
import express from 'express';
import passport from 'passport';
import { getEnvVariable } from '../utils/env.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar'],
  accessType: 'offline',
  prompt: 'consent',
}));


router.get('/google/callback', passport.authenticate('google', { 
  failureRedirect: `${getEnvVariable('FRONTEND_URL')}/login?error=auth_failed` 
}), async (req, res) => {
  console.log("User after auth:", req.user);
  console.log("Session ID after auth:", req.sessionID);
  
  // Save tokens to user model if necessary
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

  // Generate a JWT token
  const token = jwt.sign(
    { id: req.user._id, email: req.user.email, name: req.user.name },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
  
  // Redirect to frontend with the token as a query parameter
  res.redirect(`${getEnvVariable('FRONTEND_URL')}/dashboard?token=${token}`);
});

// // In auth.js
// router.get('/google/callback', passport.authenticate('google', { 
//   failureRedirect: `${getEnvVariable('FRONTEND_URL')}/login?error=auth_failed` 
// }), async (req, res) => {
//   try {
//     console.log("Google auth successful, user:", req.user._id);
    
//     // Force session save to ensure persistence
//     req.session.save(err => {
//       if (err) {
//         console.error("Session save error:", err);
//       }
//       console.log("Session saved with ID:", req.sessionID);
//       res.redirect(`${getEnvVariable('FRONTEND_URL')}/dashboard`);
//     });
//   } catch (error) {
//     console.error("Callback error:", error);
//     res.redirect(`${getEnvVariable('FRONTEND_URL')}/login?error=server_error`);
//   }
// });

// In auth.js
router.get('/debug', (req, res) => {
  res.json({
    sessionID: req.sessionID,
    isAuthenticated: req.isAuthenticated(),
    hasUser: !!req.user,
    user: req.user ? {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email
    } : null,
    cookies: req.headers.cookie
  });
});


// router.get('/logout', (req, res) => {
//   req.logout(() => res.redirect('/'));
// });

// router.get('/me', (req, res) => {
//   if (req.isAuthenticated() && req.user) {
//     res.json({ user: req.user });
//   } else {
//     res.status(401).json({ message: 'Not authenticated' });
//   }
// });

export default router;