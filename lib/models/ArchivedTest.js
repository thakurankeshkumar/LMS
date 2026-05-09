import mongoose from 'mongoose';

const archivedTestSchema = new mongoose.Schema(
  {
    originalTestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    questionCount: {
      type: Number,
      required: true,
    },
    passingMarks: {
      type: Number,
      required: true,
    },
    // Per-question aggregated stats
    questionStats: [
      {
        questionIndex: Number,
        totalAttempts: { type: Number, default: 0 },
        correctCount: { type: Number, default: 0 },
      },
    ],
    // Per-student results snapshot
    studentResults: [
      {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: String,
        email: String,
        score: Number,
        totalMarks: Number,
        percentage: Number,
        passed: Boolean,
        submittedAt: Date,
        timeTaken: Number,
      },
    ],
    deletedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.models.ArchivedTest || mongoose.model('ArchivedTest', archivedTestSchema);
