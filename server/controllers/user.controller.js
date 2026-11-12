import User from '../models/User.js';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';

/**
 * @desc    Get all users with filtering, search, and pagination (View 8)
 * @route   GET /api/users
 * @access  Private (Admin only)
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, status, department, search, page = 1, limit = 50 } = req.query;

    const query = {};
    if (role && role !== 'All Roles') query.role = role;
    if (status && status !== 'All Statuses') query.status = status;
    if (department && department !== 'All Departments') query.department = department;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Populate role sub-profiles
    const enrichedUsers = await Promise.all(
      users.map(async (u) => {
        let details = null;
        if (u.role === 'Student') {
          details = await Student.findOne({ userId: u._id });
        } else if (u.role === 'Faculty') {
          details = await Faculty.findOne({ userId: u._id });
        }
        return {
          ...u.toObject(),
          profileDetails: details,
        };
      })
    );

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      users: enrichedUsers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private (Admin only)
 */
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let profile = null;
    if (user.role === 'Student') {
      profile = await Student.findOne({ userId: user._id });
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
 * @desc    Create new user by administrator
 * @route   POST /api/users
 * @access  Private (Admin only)
 */
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department, designation, rollNo, semester } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const user = await User.create({
      name,
      email,
      password: password || 'Welcome@123',
      role: role || 'Student',
      department: department || 'Computer Science',
      status: 'Active',
    });

    let profile = null;
    if (user.role === 'Student') {
      profile = await Student.create({
        userId: user._id,
        rollNo: rollNo || 'STU-' + Math.floor(1000 + Math.random() * 9000),
        department: department || 'Computer Science',
        semester: semester || 5,
      });
    } else if (user.role === 'Faculty') {
      profile = await Faculty.create({
        userId: user._id,
        department: department || 'Computer Science',
        designation: designation || 'Assistant Professor',
      });
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully.',
      user,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private (Admin only)
 */
export const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, department, status, designation, rollNo, semester } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (department) user.department = department;
    if (status) user.status = status;
    await user.save();

    let profile = null;
    if (user.role === 'Student') {
      profile = await Student.findOneAndUpdate(
        { userId: user._id },
        { ...(department && { department }), ...(rollNo && { rollNo }), ...(semester && { semester }) },
        { new: true, upsert: true }
      );
    } else if (user.role === 'Faculty') {
      profile = await Faculty.findOneAndUpdate(
        { userId: user._id },
        { ...(department && { department }), ...(designation && { designation }) },
        { new: true, upsert: true }
      );
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      user,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle user status (Active / Inactive)
 * @route   PATCH /api/users/:id/toggle-status
 * @access  Private (Admin only)
 */
export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.status = user.status === 'Active' ? 'Inactive' : 'Active';
    await user.save();

    res.status(200).json({
      success: true,
      message: `User status changed to ${user.status}.`,
      status: user.status,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private (Admin only)
 */
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await Student.deleteOne({ userId: user._id });
    await Faculty.deleteOne({ userId: user._id });
    await User.deleteOne({ _id: user._id });

    res.status(200).json({
      success: true,
      message: 'User and associated profile deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
};
