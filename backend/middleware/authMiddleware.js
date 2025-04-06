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
export const ensureAuth = (req, res, next) => {
  console.log("Session ID in middleware:", req.sessionID);
  console.log("User in middleware:", req.user);
  console.log("Is authenticated in middleware:", req.isAuthenticated());
  
  if (req.isAuthenticated()) {
    return next();
  }
  
  return res.status(401).json({ 
    message: 'Not authenticated',
    redirectUrl: `${process.env.FRONTEND_URL}/login` 
  });
};