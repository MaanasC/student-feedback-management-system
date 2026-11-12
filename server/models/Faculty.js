import mongoose from 'mongoose';

const facultySchema = new mongoose.Schema(
  {
    facultyId: {
      type: String,
      unique: true,
      trim: true,
      default: () => 'FAC-' + Math.floor(100000 + Math.random() * 900000),
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID reference is required'],
      unique: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    designation: {
      type: String,
      required: [true, 'Faculty designation is required'],
      trim: true,
      default: 'Assistant Professor',
    },
    specialization: {
      type: String,
      default: 'Computer Science & Engineering',
    },
  },
  {
    timestamps: true,
  }
);

export const Faculty = mongoose.model('Faculty', facultySchema);
export default Faculty;
