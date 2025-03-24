// middleware/authMiddleware.js
export const ensureAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    console.error('Unauthorized access attempt:', req.ip, req.originalUrl); // Log the attempt
    return res.status(401).json({ message: 'Unauthorized access. Please log in.' });
  }
};