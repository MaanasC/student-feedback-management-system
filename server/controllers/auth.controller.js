import User from '../models/User.js';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';
import { generateToken } from '../utils/jwt.js';

/**
 * @desc    Register a new user (Student, Faculty, or Administrator)
 * @route   POST /api/auth/register
 * @access  Public / Admin
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, department, rollNo, semester, designation } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid institutional email address.',
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // 1. Create base User document
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: role || 'Student',
      department: department || 'Computer Science',
      status: 'Active',
    });

    let profile = null;

    // 2. Create specific role profile according to Section 9.1 Data Entities
    try {
      if (user.role === 'Student') {
        profile = await Student.create({
          userId: user._id,
          rollNo: (rollNo && rollNo.trim()) || 'CS-' + Math.floor(1000 + Math.random() * 9000),
          department: department || 'Computer Science',
          semester: Number(semester) || 5,
        });
      } else if (user.role === 'Faculty') {
        profile = await Faculty.create({
          userId: user._id,
          department: department || 'Computer Science',
          designation: designation || 'Assistant Professor',
        });
      }
    } catch (profileErr) {
      // Rollback user creation if profile creation fails
      await User.findByIdAndDelete(user._id);
      throw profileErr;
    }

    const token = generateToken({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileId: profile?._id || null,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      isNewRegistration: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        status: user.status,
      },
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & return JWT token (Experiment 6 requirement)
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const loginIdentifier = email || username;

    if (!loginIdentifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email/username and password.',
      });
    }

    // Explicitly select password field as it is excluded by default
    const user = await User.findOne({
      $or: [{ email: loginIdentifier.toLowerCase() }, { name: loginIdentifier }],
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (user.status === 'Inactive') {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Please contact the administrator.',
      });
    }

    // Verify password with bcrypt
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    let profile = null;
    if (user.role === 'Student') {
      profile = await Student.findOne({ userId: user._id });
    } else if (user.role === 'Faculty') {
      profile = await Faculty.findOne({ userId: user._id });
    }

    const token = generateToken({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileId: profile?._id || null,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      isNewRegistration: false,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        status: user.status,
      },
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user profile (View 12)
 * @route   GET /api/auth/profile
 * @access  Private
 */
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let profile = null;

    if (user.role === 'Student') {
      profile = await Student.findOne({ userId: user._id }).populate('enrolledCourses');
    } else if (user.role === 'Faculty') {
      profile = await Faculty.findOne({ userId: user._id });
    }

    res.status(200).json({
      success: true,
      user,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update current user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, department, designation, rollNo } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (department) user.department = department;
    await user.save();

    let profile = null;
    if (user.role === 'Student' && (rollNo || department)) {
      profile = await Student.findOneAndUpdate(
        { userId: user._id },
        { ...(rollNo && { rollNo }), ...(department && { department }) },
        { new: true }
      );
    } else if (user.role === 'Faculty' && (designation || department)) {
      profile = await Faculty.findOneAndUpdate(
        { userId: user._id },
        { ...(designation && { designation }), ...(department && { department }) },
        { new: true }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Both current password and new password are required.',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match.',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export default {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
};
