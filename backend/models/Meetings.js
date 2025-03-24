// import mongoose from 'mongoose';

// const MeetingSchema = new mongoose.Schema({
//   organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   title: { type: String, required: true }, // New field for meeting title from Dashboard
//   guestEmail: { type: String, required: false },
//   date: { type: Date, required: false },
//   startTime: String,
//   endTime: String,
//   status: { type: String, enum: ['pending', 'confirmed'], default: 'pending' },
//   calendarEventId: String,
//   meetLink: String,
//   description: String, // This will hold the meeting description from Dashboard
// }, { timestamps: true });

// export default mongoose.model('Meeting', MeetingSchema);


import mongoose from 'mongoose';

// const MeetingSchema = new mongoose.Schema({
//   organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   title: { type: String, required: true },
//   guestEmail: { type: String },
//   date: { type: Date },
//   startTime: { type: String },
//   endTime: { type: String },
//   status: { type: String, enum: ['pending', 'confirmed', 'declined'], default: 'pending' },
//   calendarEventId: { type: String },
//   meetLink: { type: String },
//   description: { type: String },
// }, { timestamps: true });

// export default mongoose.model('Meeting', MeetingSchema);\


const MeetingSchema = new mongoose.Schema({
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  guestEmail: { type: String },
  date: { type: Date },
  startTime: { type: String },
  endTime: { type: String },
  status: { type: String, enum: ['pending', 'confirmed', 'declined', 'expired'], default: 'pending' },
  calendarEventId: { type: String },
  meetLink: { type: String },
  description: { type: String },
  expiresAt: { type: Date, required: true }, // <-- Add this line
}, { timestamps: true });

export default mongoose.model('Meeting', MeetingSchema);
