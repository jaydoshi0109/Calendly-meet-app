import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  name: String,
  email: { type: String, required: true, unique: true },
  googleAccessToken: String, // renamed for clarity
  googleRefreshToken: String, // renamed for clarity
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
