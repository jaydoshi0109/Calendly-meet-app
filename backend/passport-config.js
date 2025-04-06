import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "./models/User.js";
import { getEnvVariable } from "./utils/env.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: getEnvVariable("GOOGLE_CLIENT_ID"),
      clientSecret: getEnvVariable("GOOGLE_CLIENT_SECRET"),
      callbackURL: `${getEnvVariable("BACKEND_URL")}/api/auth/google/callback`,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            accessToken,
            refreshToken,
          });
        } else {
          // Update tokens every login
          user.googleAccessToken = accessToken;
          user.googleRefreshToken = refreshToken;
          await user.save();
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);
// In passport-config.js
passport.serializeUser((user, done) => {
  console.log("Serializing user:", user._id);
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    console.log("Attempting to deserialize user:", id);
    const user = await User.findById(id).exec();
    console.log("Deserializing user result:", !!user);
    done(null, user);
  } catch (err) {
    console.error("Deserialize error:", err);
    done(err, null);
  }
});

export { passport };
