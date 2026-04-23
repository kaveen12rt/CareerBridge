import mongoose from "mongoose";

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
    templateId: {
      type: String,
      default: ''
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
    },
    profileImage: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

cvTemplateSchema.index({ studentId: 1, createdAt: -1 });

const CVTemplate = mongoose.model("CVTemplate", cvTemplateSchema);

export default CVTemplate;
