import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      unique: true,
      trim: true,
      default: () => 'STU-' + Math.floor(100000 + Math.random() * 900000),
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID reference is required'],
      unique: true,
    },
    rollNo: {
      type: String,
      required: [true, 'Student roll number is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 10,
      default: 5,
    },
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Student = mongoose.model('Student', studentSchema);
export default Student;
