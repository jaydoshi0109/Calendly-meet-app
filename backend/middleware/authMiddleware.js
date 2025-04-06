// middleware/authMiddleware.js
// export const ensureAuth = (req, res, next) => {
//   console.log("Session:", req.session);
//   console.log("User authenticated:", req.isAuthenticated());
  
//   if (req.isAuthenticated()) {
//     return next();
//   }
  
//   console.log("Not authenticated, redirecting");
//   return res.status(401).json({ 
//     message: 'Not authenticated',
//     redirectUrl: `${process.env.FRONTEND_URL}/login` 
//   });
// };
// export const ensureAuth = (req, res, next) => {
//   console.log("Session ID in middleware:", req.sessionID);
//   console.log("User in middleware:", req.user);
//   console.log("Is authenticated in middleware:", req.isAuthenticated());
  
//   if (req.isAuthenticated()) {
//     return next();
//   }
  
//   return res.status(401).json({ 
//     message: 'Not authenticated',
//     redirectUrl: `${process.env.FRONTEND_URL}/login` 
//   });
// };

import jwt from 'jsonwebtoken';

export const ensureAuth = (req, res, next) => {
  console.log("Session ID in middleware:", req.sessionID);
  console.log("User in middleware:", req.user);
  console.log("Is authenticated in middleware:", req.isAuthenticated());
  
  if (req.isAuthenticated()) {
    return next();
  }
  
  // Check for a JWT token in the Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Optionally, attach full user info by fetching from DB if needed
      req.user = decoded;
      return next();
    } catch (err) {
      console.error('JWT verification failed:', err);
    }
  }
  
  return res.status(401).json({ 
    message: 'Not authenticated',
    redirectUrl: `${process.env.FRONTEND_URL}/login` 
  });
};
