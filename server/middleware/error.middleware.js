/**
 * Global Error Handler Middleware
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose duplicate key errors (code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const keys = Object.keys(err.keyPattern || err.keyValue || {});
    if (keys.includes('formId') && keys.includes('studentId')) {
      message = 'Duplicate Submission Prevented: You have already submitted feedback for this course form.';
    } else if (keys.includes('email')) {
      message = 'An account with this email address already exists.';
    } else if (keys.includes('courseCode')) {
      message = 'A course with this course code already exists.';
    } else {
      message = `Duplicate field value entered for [${keys.join(', ')}].`;
    }
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((el) => el.message);
    message = `Validation Failed: ${errors.join(', ')}`;
  }

  // Handle Invalid ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = `Resource not found with invalid identifier: ${err.value}`;
  }

  console.error(`[API Error] ${req.method} ${req.originalUrl}:`, err);

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

export default errorHandler;
