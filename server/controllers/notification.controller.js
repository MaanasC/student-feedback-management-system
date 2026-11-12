import Notification from '../models/Notification.js';
import Student from '../models/Student.js';

/**
 * Safe case-insensitive trimmed department equality helper
 */
export const isSameDepartment = (deptA, deptB) => {
  if (!deptA || !deptB) return false;
  return deptA.trim().toLowerCase() === deptB.trim().toLowerCase();
};

/**
 * @desc    Get notifications for the logged-in user and their role
 * @route   GET /api/notifications
 * @access  Private (All authenticated roles)
 */
export const getMyNotifications = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const userId = req.user._id;

    // Administrators continue receiving all administrative alerts without department filtering
    if (userRole === 'Administrator') {
      const filter = {
        $or: [
          { recipientRole: 'All' },
          { recipientRole: 'Administrator' },
          { recipientUser: userId },
        ],
      };

      const notifications = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .limit(50);

      const unreadCount = await Notification.countDocuments({
        ...filter,
        read: false,
      });

      return res.status(200).json({
        success: true,
        count: notifications.length,
        unreadCount,
        notifications,
      });
    }

    // Faculty members receive their course-specific feedback and direct notifications
    if (userRole === 'Faculty') {
      const filter = {
        $or: [
          { recipientRole: 'All' },
          { recipientRole: 'Faculty', recipientUser: userId },
          { recipientUser: userId },
        ],
      };

      const notifications = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .limit(50);

      const unreadCount = await Notification.countDocuments({
        ...filter,
        read: false,
      });

      return res.status(200).json({
        success: true,
        count: notifications.length,
        unreadCount,
        notifications,
      });
    }

    // Role: Student — Enforce department-targeted notification filtering
    let studentDept = req.studentProfile?.department;
    if (!studentDept) {
      const studentDoc = await Student.findOne({ userId });
      studentDept = studentDoc?.department || req.user.department;
    }
    studentDept = (studentDept || '').trim();

    // Query candidate notifications that could target this student
    const candidateFilter = {
      $or: [
        { recipientUser: userId },
        { recipientRole: 'Student', recipientUser: null },
        { recipientRole: 'All', recipientUser: null },
      ],
    };

    const candidateNotifications = await Notification.find(candidateFilter)
      .populate({
        path: 'relatedFormId',
        populate: { path: 'courseId', select: 'courseCode courseName department' },
      })
      .populate('courseId', 'courseCode courseName department')
      .sort({ createdAt: -1 });

    // Filter candidate notifications to ensure department compliance
    const validNotifications = candidateNotifications.filter((n) => {
      // 1. If notification is addressed to a different user, deny
      if (n.recipientUser && n.recipientUser.toString() !== userId.toString()) {
        return false;
      }

      // 2. Identify the course department associated with this notification
      const notifDept =
        n.department ||
        n.courseId?.department ||
        n.relatedFormId?.courseId?.department;

      // 3. If notification is associated with a course, form, or department:
      if (notifDept) {
        if (!studentDept) return false; // Student with missing department cannot view department-specific alerts
        return isSameDepartment(notifDept, studentDept);
      }

      // 4. If notification is linked to a form, but form/course has no department, exclude it
      if (n.relatedFormId) {
        return false;
      }

      // 5. General broadcast announcement (no form, no course, no department)
      if (n.recipientRole === 'All' || (n.recipientRole === 'Student' && !n.relatedFormId)) {
        return true;
      }

      return false;
    });

    const unreadCount = validNotifications.filter((n) => !n.read).length;
    const notifications = validNotifications.slice(0, 50);

    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single notification by ID with authorization & department checks
 * @route   GET /api/notifications/:id
 * @access  Private
 */
export const getNotificationById = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id)
      .populate({
        path: 'relatedFormId',
        populate: { path: 'courseId', select: 'courseCode courseName department' },
      })
      .populate('courseId', 'courseCode courseName department');

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (req.user.role === 'Student') {
      // Authorization check: Cannot access another student's private notification
      if (notification.recipientUser && notification.recipientUser.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You cannot access notifications belonging to another student.',
        });
      }

      // Department check: Cannot access notifications for another department
      let studentDept = req.studentProfile?.department;
      if (!studentDept) {
        const studentDoc = await Student.findOne({ userId: req.user._id });
        studentDept = studentDoc?.department || req.user.department;
      }
      studentDept = (studentDept || '').trim();

      const notifDept =
        notification.department ||
        notification.courseId?.department ||
        notification.relatedFormId?.courseId?.department;

      if (notifDept && !isSameDepartment(notifDept, studentDept)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You cannot access notifications outside your registered department.',
        });
      }

      if (notification.relatedFormId && !notifDept) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Feedback form has no valid course department.',
        });
      }
    }

    res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark single notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
export const markNotificationAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id)
      .populate({
        path: 'relatedFormId',
        populate: { path: 'courseId', select: 'courseCode courseName department' },
      })
      .populate('courseId', 'courseCode courseName department');

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (req.user.role === 'Student') {
      // Authorization check: Cannot modify another student's notification
      if (notification.recipientUser && notification.recipientUser.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You cannot modify notifications belonging to another student.',
        });
      }

      // Department check
      let studentDept = req.studentProfile?.department;
      if (!studentDept) {
        const studentDoc = await Student.findOne({ userId: req.user._id });
        studentDept = studentDoc?.department || req.user.department;
      }
      studentDept = (studentDept || '').trim();

      const notifDept =
        notification.department ||
        notification.courseId?.department ||
        notification.relatedFormId?.courseId?.department;

      if (notifDept && !isSameDepartment(notifDept, studentDept)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You cannot modify notifications outside your registered department.',
        });
      }
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      notification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark all notifications for this role/user as read
 * @route   PATCH /api/notifications/read-all
 * @access  Private
 */
export const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const userId = req.user._id;

    if (userRole === 'Student') {
      // Only mark notifications specifically belonging to this student
      await Notification.updateMany(
        {
          recipientUser: userId,
          read: false,
        },
        { $set: { read: true } }
      );
    } else {
      await Notification.updateMany(
        {
          $or: [
            { recipientRole: 'All' },
            { recipientRole: userRole },
            { recipientUser: userId },
          ],
          read: false,
        },
        { $set: { read: true } }
      );
    }

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id)
      .populate({
        path: 'relatedFormId',
        populate: { path: 'courseId', select: 'courseCode courseName department' },
      })
      .populate('courseId', 'courseCode courseName department');

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (req.user.role === 'Student') {
      if (notification.recipientUser && notification.recipientUser.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You cannot delete notifications belonging to another student.',
        });
      }

      let studentDept = req.studentProfile?.department;
      if (!studentDept) {
        const studentDoc = await Student.findOne({ userId: req.user._id });
        studentDept = studentDoc?.department || req.user.department;
      }
      studentDept = (studentDept || '').trim();

      const notifDept =
        notification.department ||
        notification.courseId?.department ||
        notification.relatedFormId?.courseId?.department;

      if (notifDept && !isSameDepartment(notifDept, studentDept)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You cannot delete notifications outside your registered department.',
        });
      }
    }

    await Notification.deleteOne({ _id: notification._id });

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getMyNotifications,
  getNotificationById,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  isSameDepartment,
};