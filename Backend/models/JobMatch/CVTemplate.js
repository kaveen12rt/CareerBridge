const mongoose = require('mongoose');

const cvSectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      default: ''
    }
  },
  { _id: false }
);

const cvTemplateSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    summary: {
      type: String,
      default: ''
    },
    sections: {
      type: [cvSectionSchema],
      default: []
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

cvTemplateSchema.index({ studentId: 1, createdAt: -1 });

module.exports = mongoose.model('CVTemplate', cvTemplateSchema);
