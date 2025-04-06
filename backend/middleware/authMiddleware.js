// middleware/authMiddleware.js
export const ensureAuth = (req, res, next) => {
  console.log("Session:", req.session);
  console.log("User authenticated:", req.isAuthenticated());
  
  if (req.isAuthenticated()) {
    return next();
  }
  
  console.log("Not authenticated, redirecting");
  return res.status(401).json({ 
    message: 'Not authenticated',
    redirectUrl: `${process.env.FRONTEND_URL}/login` 
  });
};