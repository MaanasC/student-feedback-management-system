import mongoose from 'mongoose';

const ratingItemSchema = new mongoose.Schema(
  {
    questionId: {
      type: String,
      required: true,
    },
    ratingValue: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  { _id: false }
);

const feedbackResponseSchema = new mongoose.Schema(
  {
    responseId: {
      type: String,
      unique: true,
      trim: true,
      default: () => 'RESP-' + Math.floor(100000 + Math.random() * 900000),
    },
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeedbackForm',
      required: [true, 'Feedback Form reference is required'],
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
    },
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
      required: [true, 'Faculty reference is required'],
    },
    ratings: [ratingItemSchema],
    comments: {
      type: String,
      trim: true,
      default: '',
    },
    suggestions: {
      type: String,
      trim: true,
      default: '',
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// CRITICAL SPEC REQUIREMENT (Section 9.2 #7 & Section 9.3):
// Compound Unique Index: { formId: 1, studentId: 1 }
// Prevents duplicate submissions for the same feedback form by the same student.
feedbackResponseSchema.index({ formId: 1, studentId: 1 }, { unique: true });

export const FeedbackResponse = mongoose.model('FeedbackResponse', feedbackResponseSchema);
export default FeedbackResponse;
