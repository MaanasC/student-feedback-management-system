import { Server } from 'socket.io';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Course from '../models/Course.js';
import { isOriginAllowed } from '../config/cors.js';
import { verifyJWT } from '../utils/jwt.js';

let ioInstance = null;

export const initSocket = (httpServer) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (isOriginAllowed(origin)) {
          callback(null, true);
        } else {
          console.warn(`[Socket.IO CORS Blocked] Origin '${origin}' rejected.`);
          callback(new Error(`CORS error: Origin '${origin}' is not authorized for WebSocket connection.`));
        }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
  });

  // Enforce mandatory JWT authentication on WebSocket handshake
  ioInstance.use(async (socket, next) => {
    try {
      // Prefer handshake.auth.token, followed by Authorization header.
      // Query string token authentication is intentionally excluded to prevent token leakage in server logs.
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, '');

      if (!token) {
        return next(new Error('Authentication required: No token provided for WebSocket connection'));
      }

      let decoded;
      try {
        decoded = verifyJWT(token);
      } catch (jwtErr) {
        if (jwtErr.name === 'TokenExpiredError') {
          return next(new Error('Authentication failed: Token has expired'));
        }
        return next(new Error('Authentication failed: Invalid token'));
      }

      // Query authoritative user record from database (never rely on client claims)
      const user = await User.findById(decoded.id).select('_id name email role department');
      if (!user) {
        return next(new Error('Authentication failed: User does not exist in database'));
      }

      // Authoritative department lookup from database
      let authoritativeDepartment = user.department || null;
      if (user.role === 'Student') {
        const studentDoc = await Student.findOne({ userId: user._id }).select('department');
        if (studentDoc?.department) {
          authoritativeDepartment = studentDoc.department;
        }
      }

      // Attach authoritative identity to socket
      socket.data.user = {
        id: user._id.toString(),
        name: user.name,
        role: user.role,
        department: authoritativeDepartment ? authoritativeDepartment.trim().toLowerCase() : null,
      };

      next();
    } catch (err) {
      console.error('[Socket.IO Auth Middleware Error]:', err.message);
      next(new Error('Internal server error during socket authentication'));
    }
  });

  ioInstance.on('connection', (socket) => {
    const authUser = socket.data.user;
    if (!authUser) {
      socket.disconnect(true);
      return;
    }

    // Automatically join trusted rooms derived from verified database information
    socket.join(`user:${authUser.id}`);
    socket.join(`role:${authUser.role}`);
    if (authUser.department) {
      socket.join(`dept:${authUser.department}`);
    }

    console.log(`[Socket.IO] Authenticated socket connected: ${socket.id} (User: ${authUser.id}, Role: ${authUser.role}, Dept: ${authUser.department || 'N/A'})`);

    // Strictly validate any client-requested room confirmations (prevent cross-user / cross-dept spoofing)
    socket.on('join', (data) => {
      const { role, userId, department } = data || {};

      // Security check: Reject attempt to join another user's room
      if (userId && userId !== authUser.id) {
        console.warn(`[Socket.IO Security Alert] Socket ${socket.id} attempted unauthorized user room join: user:${userId}`);
        socket.emit('security_error', { message: 'Unauthorized user room join rejected' });
        socket.emit('error', { message: 'Unauthorized room join attempt rejected' });
        return;
      }

      // Security check: Reject attempt to join unauthorized role room
      if (role && role !== authUser.role) {
        console.warn(`[Socket.IO Security Alert] Socket ${socket.id} attempted unauthorized role room join: role:${role}`);
        socket.emit('security_error', { message: 'Unauthorized role room join rejected' });
        socket.emit('error', { message: 'Unauthorized role room join attempt rejected' });
        return;
      }

      // Security check: Reject attempt to join unauthorized department room
      if (department && department.trim().toLowerCase() !== authUser.department) {
        console.warn(`[Socket.IO Security Alert] Socket ${socket.id} attempted unauthorized department room join: dept:${department}`);
        socket.emit('security_error', { message: 'Unauthorized department room join rejected' });
        socket.emit('error', { message: 'Unauthorized department room join attempt rejected' });
        return;
      }

      // Re-confirm authenticated rooms only
      socket.join(`user:${authUser.id}`);
      socket.join(`role:${authUser.role}`);
      if (authUser.department) {
        socket.join(`dept:${authUser.department}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
};

export const getIO = () => {
  return ioInstance;
};

/**
 * Real-time notification helpers
 */

// 1. Notify students when Admin creates a new feedback form (targeted strictly by Course Department)
export const emitFormCreated = async (form, course, facultyName) => {
  if (!form) return;

  // Identify course and ensure course details are available
  let targetCourse = course;
  if (!targetCourse && form.courseId) {
    targetCourse = typeof form.courseId === 'object' && form.courseId.department
      ? form.courseId
      : await Course.findById(form.courseId);
  }

  // Section 4 requirement:
  // - If a feedback form has no valid associated course, do not broadcast its notification to all students.
  // - If a course has no department, do not broadcast its notification to all students.
  if (!targetCourse || !targetCourse.department || !targetCourse.department.trim()) {
    console.warn(`[Socket.IO] Form ${form._id} has no valid associated course or department. Notification dispatch aborted.`);
    return;
  }

  const courseDepartment = targetCourse.department.trim();

  // Safe case-insensitive matching helper
  const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const deptRegex = new RegExp(`^\\s*${escapeRegex(courseDepartment)}\\s*$`, 'i');

  // Identify students whose registered department matches the course department
  const matchingStudents = await Student.find({ department: deptRegex }).select('userId department');
  const studentUserIdsFromProfile = matchingStudents.map((s) => s.userId).filter(Boolean);

  const matchingUsers = await User.find({
    role: 'Student',
    status: 'Active',
    $or: [
      { _id: { $in: studentUserIdsFromProfile } },
      { department: deptRegex },
    ],
  }).select('_id name email department');

  if (!matchingUsers || matchingUsers.length === 0) {
    console.log(`[Socket.IO] No active students found for department: "${courseDepartment}". No notifications sent.`);
    return;
  }

  const notificationPayload = {
    title: 'New Feedback Form Available',
    message: `Feedback is now open for ${targetCourse.courseCode || 'your course'}: ${targetCourse.courseName || ''} (${facultyName || 'Faculty'})`,
    formId: form._id,
    courseId: targetCourse._id,
    courseCode: targetCourse.courseCode,
    department: courseDepartment,
    type: 'info',
    timestamp: new Date(),
  };

  // Section 4 requirement: Prevent duplicate notifications when the same form is published more than once or retried
  const userIds = matchingUsers.map((u) => u._id);
  const existingNotifications = await Notification.find({
    relatedFormId: form._id,
    recipientUser: { $in: userIds },
  }).select('recipientUser');

  const alreadyNotifiedUserIds = new Set(
    existingNotifications.map((n) => n.recipientUser.toString())
  );

  const usersToNotify = matchingUsers.filter(
    (u) => !alreadyNotifiedUserIds.has(u._id.toString())
  );

  if (usersToNotify.length === 0) {
    console.log(`[Socket.IO] All eligible students in department "${courseDepartment}" already received notifications for form ${form._id}.`);
    return;
  }

  // Create notifications exclusively for eligible students
  try {
    const docs = usersToNotify.map((u) => ({
      recipientRole: 'Student',
      recipientUser: u._id,
      department: courseDepartment,
      courseId: targetCourse._id,
      title: notificationPayload.title,
      message: notificationPayload.message,
      type: 'info',
      relatedFormId: form._id,
      read: false,
    }));

    await Notification.insertMany(docs);
    console.log(`[Socket.IO] Created ${docs.length} department-targeted notifications for department "${courseDepartment}".`);
  } catch (e) {
    console.error('[Socket.IO] Error saving department-targeted notifications:', e);
  }

  // Deliver real-time Socket.IO events EXCLUSIVELY to eligible students (never broadcast to all students)
  if (ioInstance) {
    for (const u of usersToNotify) {
      ioInstance.to(`user:${u._id}`).emit('notification:form_created', notificationPayload);
    }
    // Also emit to the department room for clients joined by department
    ioInstance.to(`dept:${courseDepartment.toLowerCase()}`).emit('notification:form_created', notificationPayload);
  }
};

// 2. Notify students when Admin updates or activates/deactivates a form
export const emitFormUpdated = async (form, actionType) => {
  if (!ioInstance) return;

  const payload = {
    formId: form._id,
    status: form.status,
    title: form.title,
    actionType: actionType || 'updated',
    timestamp: new Date(),
  };

  ioInstance.to('role:Student').emit('notification:form_updated', payload);
  ioInstance.to('role:Administrator').emit('notification:form_updated', payload);
};

// 3. Notify faculty & administrators when a student submits feedback
export const emitFeedbackSubmitted = async ({ facultyUserId, courseCode, courseName, responseId, formId }) => {
  if (!ioInstance) return;

  const payload = {
    title: 'New Student Feedback Submitted',
    message: `A new feedback response was submitted for ${courseCode}: ${courseName}.`,
    type: 'success',
    timestamp: new Date(),
    courseCode,
    responseId,
    formId,
  };

  // Real-time notification to administrators (Admin Dashboard Demonstration Scenario)
  ioInstance.to('role:Administrator').emit('notification:feedback_received', payload);
  ioInstance.to('role:Administrator').emit('notification:feedback_stat_updated', {
    courseCode,
    responseId,
    formId,
    timestamp: new Date(),
  });

  // Real-time notification to the specific faculty member's room
  if (facultyUserId) {
    ioInstance.to(`user:${facultyUserId}`).emit('notification:feedback_received', payload);
  }

  // Persist notification in MongoDB Atlas for Administrator role
  try {
    await Notification.create({
      recipientRole: 'Administrator',
      title: payload.title,
      message: payload.message,
      type: 'success',
      relatedFormId: formId || null,
      relatedResponseId: responseId || null,
    });
  } catch (e) {
    console.error('Error saving admin feedback notification:', e);
  }

  // Persist notification in MongoDB Atlas for specific Faculty
  if (facultyUserId) {
    try {
      await Notification.create({
        recipientRole: 'Faculty',
        recipientUser: facultyUserId,
        title: payload.title,
        message: payload.message,
        type: 'success',
        relatedFormId: formId || null,
        relatedResponseId: responseId || null,
      });
    } catch (e) {
      console.error('Error saving faculty feedback notification:', e);
    }
  }
};

export default {
  initSocket,
  getIO,
  emitFormCreated,
  emitFormUpdated,
  emitFeedbackSubmitted,
};
