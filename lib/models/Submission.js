import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    answers: [
      {
        questionId: {
          type: String,
          required: true,
        },
        selectedOption: {
          type: Number,
          default: null,
        },
        isCorrect: {
          type: Boolean,
          default: false,
        },
      },
    ],
    score: {
      type: Number,
      default: 0,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    startedAt: {
      type: Date,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    timeTaken: {
      type: Number, // in seconds
      default: 0,
    },
    status: {
      type: String,
      enum: ['submitted', 'approved', 'rejected'],
      default: 'submitted',
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvalDate: {
      type: Date,
      default: null,
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Index for fast queries
submissionSchema.index({ testId: 1, studentId: 1 }, { unique: true });
submissionSchema.index({ studentId: 1 });
submissionSchema.index({ testId: 1 });

export default mongoose.models.Submission || mongoose.model('Submission', submissionSchema);
