import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Ensure environment variables are loaded immediately upon module resolution
dotenv.config();

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/StudentFeedbackDB';
    const conn = await mongoose.connect(mongoUri, {
      autoIndex: true, // Build unique indexes like { formId: 1, studentId: 1 }
      tlsAllowInvalidCertificates: true, // Resolves Windows TLS LEAF_SIGNATURE validation with Atlas clusters
    });

    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
