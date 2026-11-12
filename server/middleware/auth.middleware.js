import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';
import { verifyJWT } from '../utils/jwt.js';

export const authenticateToken = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided in Authorization header.',
      });
    }

    // Verify token using unified jwt utility
    const decoded = verifyJWT(token);

    // Fetch user from DB
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. User no longer exists.',
      });
    }

    if (user.status === 'Inactive') {
      return res.status(403).json({
        success: false,
        message: 'Account deactivated. Please contact the administrator.',
      });
    }

    // Attach user and specific role profile to request object
    req.user = user;

    if (user.role === 'Student') {
      req.studentProfile = await Student.findOne({ userId: user._id });
    } else if (user.role === 'Faculty') {
      req.facultyProfile = await Faculty.findOne({ userId: user._id });
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication token has expired. Please log in again.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token.',
      error: error.message,
    });
  }
};

export default authenticateToken;
