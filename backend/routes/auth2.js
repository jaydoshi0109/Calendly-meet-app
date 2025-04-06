// authRoutesProtected.js
import express from 'express';
const router = express.Router();

// For example, an endpoint to get the current user
router.get('/me', (req, res) => {
  if (req.isAuthenticated() && req.user) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

// Logout route, etc.
router.get('/logout', (req, res) => {
  req.logout(() => res.redirect('/'));
});

export default router;
