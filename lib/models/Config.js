import mongoose from 'mongoose';

const configSchema = new mongoose.Schema(
  {
    publicSignup: {
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
