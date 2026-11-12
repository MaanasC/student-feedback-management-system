import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionId: {
    type: String,
    default: () => 'Q-' + Math.floor(1000 + Math.random() * 9000),
  },
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
  },
  questionType: {
    type: String,
    enum: ['Rating', 'Text'],
    default: 'Rating',
  },
  required: {
    type: Boolean,
    default: true,
  },
});

const feedbackFormSchema = new mongoose.Schema(
  {
    formId: {
      type: String,
      unique: true,
      trim: true,
      default: () => 'FORM-' + Math.floor(10000 + Math.random() * 90000),
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
    title: {
      type: String,
      required: [true, 'Feedback form title is required'],
      trim: true,
    },
    semester: {
      type: String,
      required: [true, 'Academic semester is required'],
      default: 'Fall 2024',
    },
    status: {
      type: String,
      enum: ['Active', 'Draft', 'Completed'],
      default: 'Active',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: [true, 'Feedback submission end date is required'],
    },
    deadlineNote: {
      type: String,
      default: 'Active Evaluation Cycle',
    },
    questions: [questionSchema],
  },
  {
    timestamps: true,
  }
);

export const FeedbackForm = mongoose.model('FeedbackForm', feedbackFormSchema);
export default FeedbackForm;
