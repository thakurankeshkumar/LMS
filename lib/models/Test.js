import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: function (v) {
        return v.length === 4;
      },
      message: 'Must have exactly 4 options',
    },
  },
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3,
  },
  explanation: {
    type: String,
    default: '',
  },
});

const testSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a test title'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    questions: [questionSchema],
    duration: {
      type: Number,
      required: [true, 'Please provide test duration in minutes'],
      min: 1,
    },
    totalMarks: {
      type: Number,
      required: true,
      default: function () {
        return this.questions.length * 10;
      },
    },
    passingMarks: {
      type: Number,
      default: function () {
        return (this.totalMarks * 40) / 100;
      },
    },
    // Negative marking percentage to apply per wrong answer (e.g. 0.25 for 0.25%)
    negativeMarkingPercent: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    assignedStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Test || mongoose.model('Test', testSchema);
