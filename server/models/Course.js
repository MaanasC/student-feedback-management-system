import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: [true, 'Course code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    courseName: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    semester: {
      type: String,
      required: [true, 'Semester is required'],
      trim: true,
      default: 'Fall 2024',
    },
    // Array of references to faculty members to support co-taught courses (Section 9.2 #4)
    facultyIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
      },
    ],
    credits: {
      type: Number,
      default: 4,
      min: 1,
      max: 10,
    },
    enrolledCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Archived'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

export const Course = mongoose.model('Course', courseSchema);
export default Course;
