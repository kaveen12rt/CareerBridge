const mongoose = require('mongoose');

const matchSettingsSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    preferredLocations: [
      {
        type: String,
        trim: true
      }
    ],
    preferredJobTypes: [
      {
        type: String,
        trim: true
      }
    ],
    preferredSkills: [
      {
        type: String,
        trim: true
      }
    ],
    minimumMatchScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100
    },
    preferredSalaryMin: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

matchSettingsSchema.index({ studentId: 1 }, { unique: true });

module.exports = mongoose.model('MatchSettings', matchSettingsSchema);
