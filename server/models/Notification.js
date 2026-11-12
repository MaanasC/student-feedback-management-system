import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipientRole: {
      type: String,
      enum: ['All', 'Student', 'Faculty', 'Administrator'],
      default: 'All',
    },
    recipientUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    department: {
      type: String,
      trim: true,
      default: null,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['info', 'success', 'warning', 'urgent'],
      default: 'info',
    },
    relatedFormId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeedbackForm',
      default: null,
    },
    relatedResponseId: {
      type: String,
      default: null,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipientUser: 1, read: 1 });
notificationSchema.index({ relatedFormId: 1, recipientUser: 1 });
notificationSchema.index({ department: 1, recipientRole: 1 });

export const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
