import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Course from '../models/Course.js';

let ioInstance = null;

export const initSocket = (httpServer) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: '*', // Allow frontend dev server and clients
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  });

  ioInstance.on('connection', (socket) => {
    console.log(`[Socket.IO] New client connected: ${socket.id}`);

    // Allow client to register with their role and user ID
    socket.on('join', (data) => {
      const { role, userId, department } = data || {};
      if (role) {
        socket.join(`role:${role}`);
        console.log(`[Socket.IO] Socket ${socket.id} joined role room: role:${role}`);
      }
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`[Socket.IO] Socket ${socket.id} joined user room: user:${userId}`);
      }
      if (department) {
        const normDept = department.trim().toLowerCase();
        socket.join(`dept:${normDept}`);
        console.log(`[Socket.IO] Socket ${socket.id} joined department room: dept:${normDept}`);
      }
    });

    // Optional: Authenticated handshake with JWT
    socket.on('authenticate', (token) => {
      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || 'university_super_secret_jwt_key_2026'
        );
        socket.join(`user:${decoded.id}`);
        socket.join(`role:${decoded.role}`);
        if (decoded.department) {
          const normDept = decoded.department.trim().toLowerCase();
          socket.join(`dept:${normDept}`);
        }
        socket.emit('authenticated', { success: true, user: decoded });
      } catch (err) {
        socket.emit('auth_error', { message: 'Invalid token' });
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
