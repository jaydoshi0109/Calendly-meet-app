// models/Availability.js
import mongoose from 'mongoose';

const SlotSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  slots: [{ 
    startTime: String, 
    endTime: String 
  }]
});

const AvailabilitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  slots: [SlotSchema],
}, { timestamps: true });

export default mongoose.model('Availability', AvailabilitySchema);
