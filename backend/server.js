// server.js
import express from "express";
import mongoose from "mongoose";
import passport from "passport";
import session from "express-session";
import cors from "cors";
import { getEnvVariable } from "./utils/env.js"; // Import utility
import "./passport-config.js";
import errorHandler from "./middleware/errorHandler.js"; // Import error handler
import googleRoutes from "./routes/google.js";
import authRoutesPublic from "./routes/auth.js";
import availabilityRoutes from "./routes/availability.js";
import meetingsRoutes from "./routes/meetings.js";
import dotenv from "dotenv";
import MongoStore from "connect-mongo";
import { ensureAuth } from "./middleware/authMiddleware.js";
import { auth } from "googleapis/build/src/apis/abusiveexperiencereport/index.js";
import authRoutesProtected from "./routes/auth2.js";

dotenv.config();

const app = express();

// In server.js
app.use(
  cors({
    origin: getEnvVariable("FRONTEND_URL", false) || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Set-Cookie"],
  })
);

app.use(express.json());

const sessionOptions = {
  secret: getEnvVariable("SESSION_SECRET"),
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: getEnvVariable("MONGO_URI"),
    collectionName: "sessions",
  }),
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    // domain: process.env.NODE_ENV === 'production' ? 'onrender.com' : undefined,
  },
  proxy: true,
};

// Set trust proxy first
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(session(sessionOptions));

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  console.log("Session ID:", req.sessionID);
  console.log("Is Authenticated:", req.isAuthenticated());
  next();
});

app.use("/api/google", googleRoutes);
app.use("/api/auth", authRoutesPublic);
app.use("/api/protected", ensureAuth, authRoutesProtected);
app.use("/api/availability", availabilityRoutes);
app.use("/api/meetings", meetingsRoutes);

app.get("/api/google/status", (req, res) => {
  res.json({ connected: !!req.session.tokens });
});

app.use(errorHandler); // Use error handler middleware

mongoose
  .connect(getEnvVariable("MONGO_URI"))
  .then(() =>
    app.listen(getEnvVariable("PORT", false) || 5000, () =>
      console.log(
        `Backend running on http://localhost:${
          getEnvVariable("PORT", false) || 5000
        }`
      )
    )
  )
  .catch((err) => console.error("MongoDB connection error:", err));
