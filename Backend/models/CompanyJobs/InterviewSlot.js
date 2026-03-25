const mongoose = require('mongoose');

const interviewSlotSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
  },
  duration: {
    type: Number,
    required: true,
    min: 15,
    max: 480, // Max 8 hours
    default: 30
  },
  type: {
    type: String,
    enum: ['in-person', 'video', 'phone'],
    default: 'in-person'
  },
  location: {
    type: String,
    trim: true
  },
  meetingLink: {
    type: String,
    trim: true
  },
  isBooked: {
    type: Boolean,
    default: false
  },
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    default: null
  },
  bookedAt: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['available', 'booked', 'completed', 'cancelled'],
    default: 'available'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to prevent double booking
interviewSlotSchema.index({ jobId: 1, date: 1, time: 1 }, { unique: true });

// Index for better query performance
interviewSlotSchema.index({ jobId: 1, isBooked: 1 });
interviewSlotSchema.index({ date: 1, time: 1 });

// Virtual to get full datetime
interviewSlotSchema.virtual('dateTime').get(function() {
  try {
    if (!this.date || !this.time) return null;
    const dateTime = new Date(this.date);
    const [hours, minutes] = this.time.split(':').map(Number);
    dateTime.setHours(hours, minutes, 0, 0);
    return dateTime;
  } catch (error) {
    return null;
  }
});

// Virtual to check if slot is expired
interviewSlotSchema.virtual('isExpired').get(function() {
  try {
    const dt = this.dateTime;
    if (!dt) return false;
    return dt < new Date() && !this.isBooked;
  } catch (error) {
    return false;
  }
});

module.exports = mongoose.model('InterviewSlot', interviewSlotSchema);