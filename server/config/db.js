import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Ensure environment variables are loaded immediately upon module resolution
dotenv.config();

export const connectDB = async () => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    let mongoUri = process.env.MONGODB_URI;

    if (!mongoUri || !mongoUri.trim()) {
      if (isProduction) {
        console.error('[FATAL CONFIG ERROR] MONGODB_URI environment variable is required in production. Server startup aborted.');
        process.exit(1);
      }
      mongoUri = 'mongodb://127.0.0.1:27017/StudentFeedbackDB';
    }

    const allowLocalInvalidCerts = !isProduction && (process.env.ALLOW_INVALID_CERTS === 'true' || process.platform === 'win32');

    const conn = await mongoose.connect(mongoUri, {
      autoIndex: true, // Build unique indexes like { formId: 1, studentId: 1 }
      ...(allowLocalInvalidCerts ? { tlsAllowInvalidCertificates: true } : {}),
    });

    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
