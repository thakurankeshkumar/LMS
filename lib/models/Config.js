import mongoose from 'mongoose';

const configSchema = new mongoose.Schema(
  {
    publicSignup: {
      type: Boolean,
      default: true,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    signupNotice: {
      type: String,
      default: '',
      maxlength: 240,
    },
    supportEmail: {
      type: String,
      default: '',
      trim: true,
    },
    defaultTestDuration: {
      type: Number,
      default: 30,
      min: 1,
      max: 480,
    },
    defaultPassingPercentage: {
      type: Number,
      default: 40,
      min: 0,
      max: 100,
    },
    defaultNegativeMarking: {
      type: Boolean,    studentAnswerReviewEnabled: {
      type: Boolean,
      default: true,
    },
      default: false,
    },
    studentAnswerReviewEnabled: {
      type: Boolean,
      default: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Config || mongoose.model('Config', configSchema);
