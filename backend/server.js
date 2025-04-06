// server.js
import express from 'express';
import mongoose from 'mongoose';
import passport from 'passport';
import session from 'express-session';
import cors from 'cors';
import { getEnvVariable } from './utils/env.js'; // Import utility
import './passport-config.js';
import errorHandler from './middleware/errorHandler.js'; // Import error handler
import googleRoutes from './routes/google.js';
import authRoutes from './routes/auth.js';
import availabilityRoutes from './routes/availability.js';
import meetingsRoutes from './routes/meetings.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.use(cors({ origin: getEnvVariable('FRONTEND_URL', false) || 'http://localhost:5173', credentials: true })); // Use frontend url from env.
app.use(express.json());
app.use(
  session({
    secret: getEnvVariable('SESSION_SECRET'),
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Set secure in production
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      sameSite: 'none'
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/google', googleRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/meetings', meetingsRoutes);

app.get('/api/google/status', (req, res) => {
  res.json({ connected: !!req.session.tokens });
});

app.use(errorHandler); // Use error handler middleware

mongoose
  .connect(getEnvVariable('MONGO_URI'))
  .then(() => app.listen(getEnvVariable('PORT', false) || 5000, () => console.log(`Backend running on http://localhost:${getEnvVariable('PORT', false) || 5000}`)))
  .catch((err) => console.error('MongoDB connection error:', err));