/**
 * Automated Verification Suite for Student Feedback Management System Backend
 * Validates Experiment 5 (MongoDB CRUD), Experiment 6 (JWT & RBAC), and Experiment 7 (Socket.IO)
 */

import http from 'http';
import { spawnSync } from 'child_process';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { io as ClientIO } from 'socket.io-client';
import { app, server } from './index.js';
import { getJwtSecret } from './utils/jwt.js';
import { getIO } from './sockets/socketHandler.js';

const TEST_PORT = process.env.PORT || 5000;

// Helper: Make HTTP request to test server
const request = ({ method, path, headers = {}, body = null }) => {
  return new Promise((resolve, reject) => {
    const jsonBody = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: 'localhost',
        port: TEST_PORT,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(jsonBody && { 'Content-Length': Buffer.byteLength(jsonBody) }),
          ...headers,
        },
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => (rawData += chunk));
        res.on('end', () => {
          try {
            const parsed = rawData ? JSON.parse(rawData) : null;
            resolve({ status: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, raw: rawData });
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (jsonBody) req.write(jsonBody);
    req.end();
  });
};

const runBackendTests = async () => {
  console.log('\n===============================================================');
  console.log('🧪 Starting Backend Verification Suite (Exp 5, 6, & 7)');
  console.log('===============================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  const assert = (condition, title) => {
    totalTests++;
    if (condition) {
      console.log(`  ✅ [PASS] ${title}`);
      passedTests++;
    } else {
      console.error(`  ❌ [FAIL] ${title}`);
    }
  };

  // Connect to existing server or start listening
  if (!server.listening) {
    try {
      await new Promise((resolve, reject) => {
        server.once('error', (err) => {
          if (err.code === 'EADDRINUSE') {
            console.log(`[Test Runner] Detected existing server active on port ${TEST_PORT}. Testing against live instance...`);
            resolve();
          } else {
            reject(err);
          }
        });
        server.listen(TEST_PORT, resolve);
      });
    } catch (e) {
      console.log(`[Test Runner] Using existing server on port ${TEST_PORT}`);
    }
  }
  console.log(`[Test Runner] Connected to server on http://localhost:${TEST_PORT}\n`);

  try {
    // -------------------------------------------------------------------------
    // TEST SECTION 1: Health & API Foundation
    // -------------------------------------------------------------------------
    console.log('🔹 Testing Health Check Endpoint:');
    const healthRes = await request({ method: 'GET', path: '/api/health' });
    assert(healthRes.status === 200, 'GET /api/health returns 200 OK');
    assert(healthRes.data?.status === 'online', 'Server reports online status');

    // -------------------------------------------------------------------------
    // TEST SECTION 2: Experiment 6 (Authentication & Role-Based Access Control)
    // -------------------------------------------------------------------------
    console.log('\n🔹 Testing Experiment 6: JWT Authentication & Password Hashing:');

    // 2.1 Admin Login
    const adminLoginRes = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: { email: 'eleanor.vance@university.edu', password: 'password123' },
    });
    assert(adminLoginRes.status === 200, 'Admin login succeeds with 200 OK');
    assert(!!adminLoginRes.data?.token, 'JWT Token generated and returned for Admin');
    assert(adminLoginRes.data?.user?.role === 'Administrator', 'Role correctly decoded as Administrator');
    const adminToken = adminLoginRes.data?.token;

    // 2.2 Student Login
    const studentLoginRes = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: { email: 'maanas.chawan@university.edu', password: 'password123' },
    });
    assert(studentLoginRes.status === 200, 'Student login succeeds with 200 OK');
    assert(studentLoginRes.data?.user?.role === 'Student', 'Role correctly decoded as Student');
    const studentToken = studentLoginRes.data?.token;
    const studentUser = studentLoginRes.data?.user;

    // 2.3 Invalid Password Check
    const badLoginRes = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: { email: 'maanas.chawan@university.edu', password: 'wrongPassword' },
    });
    assert(badLoginRes.status === 401, 'Invalid password rejected with 401 Unauthorized');

    // 2.3b Data Validation Check (Mini Project Compulsory Requirement: Data Validation)
    const badEmailRegister = await request({
      method: 'POST',
      path: '/api/auth/register',
      body: { name: 'J', email: 'not-an-email', password: '123' },
    });
    assert(
      badEmailRegister.status === 400,
      'Data Validation: Malformed registration rejected with 400 Bad Request'
    );

    // 2.4 Role-Based Authorization Enforcement
    console.log('\n🔹 Testing Experiment 6: Role-Based Authorization (RBAC):');
    const studentAccessAdminRoute = await request({
      method: 'GET',
      path: '/api/users',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(
      studentAccessAdminRoute.status === 403,
      'Student accessing Admin-only route (/api/users) is blocked with 403 Forbidden'
    );

    const adminAccessAdminRoute = await request({
      method: 'GET',
      path: '/api/users',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      adminAccessAdminRoute.status === 200,
      'Administrator accessing /api/users succeeds with 200 OK'
    );

    // -------------------------------------------------------------------------
    // TEST SECTION 3: Experiment 5 (Mongoose & Persistent REST API CRUD)
    // -------------------------------------------------------------------------
    console.log('\n🔹 Testing Experiment 5: Persistent Database CRUD Operations:');

    // 3.1 Course CRUD
    const badCourseRes = await request({
      method: 'POST',
      path: '/api/courses',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { courseCode: 'invalid_code', courseName: 'Bad Course' },
    });
    assert(
      badCourseRes.status === 400,
      'Data Validation: Invalid courseCode format rejected with 400 Bad Request'
    );

    const createCourseRes = await request({
      method: 'POST',
      path: '/api/courses',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        courseCode: 'TEST999',
        courseName: 'Advanced Full Stack Engineering',
        department: 'Computer Science',
        semester: 'Fall 2024',
        credits: 4,
      },
    });
    assert(createCourseRes.status === 201, 'POST /api/courses creates new course (201 Created)');
    const createdCourseId = createCourseRes.data?.course?._id;

    const getCoursesRes = await request({
      method: 'GET',
      path: '/api/courses',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      getCoursesRes.data?.courses?.some((c) => c.courseCode === 'TEST999'),
      'GET /api/courses retrieves newly created course'
    );

    // 3.2 Clean up test course
    const deleteCourseRes = await request({
      method: 'DELETE',
      path: `/api/courses/${createdCourseId}`,
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(deleteCourseRes.status === 200, 'DELETE /api/courses/:id deletes course (200 OK)');

    // -------------------------------------------------------------------------
    // TEST SECTION 4: Feedback Form & Unique Submission Constraint (Section 9.2 #7)
    // -------------------------------------------------------------------------
    console.log('\n🔹 Testing Feedback Form & Duplicate Submission Prevention:');

    // Get active forms
    const formsRes = await request({
      method: 'GET',
      path: '/api/feedback-forms',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(formsRes.status === 200, 'GET /api/feedback-forms returns active evaluation forms');
    const targetForm = formsRes.data?.forms?.find((f) => f.courseId?.courseCode === 'CS201');
    assert(!!targetForm, 'Found active feedback form for CS201');

    if (targetForm) {
      // Ensure test idempotency: clear any prior test submission for this student and form
      const studentProfile = await mongoose.model('Student').findOne({ rollNo: 'D15A-08' });
      if (studentProfile) {
        await mongoose.model('FeedbackResponse').deleteMany({
          formId: targetForm._id,
          studentId: studentProfile._id,
        });
      }

      // First submission by Maanas Chawan
      const firstSubmitRes = await request({
        method: 'POST',
        path: '/api/feedback-responses',
        headers: { Authorization: `Bearer ${studentToken}` },
        body: {
          formId: targetForm._id,
          ratings: [
            { questionId: 'Q1', ratingValue: 5 },
            { questionId: 'Q2', ratingValue: 5 },
            { questionId: 'Q3', ratingValue: 5 },
            { questionId: 'Q4', ratingValue: 4 },
          ],
          comments: 'Exceptional teaching and well-structured materials.',
          suggestions: 'None, everything was great.',
        },
      });
      assert(firstSubmitRes.status === 201, 'Student submits feedback response (201 Created)');
      assert(!!firstSubmitRes.data?.confirmation?.responseId, 'Confirmation responseId received');

      // Duplicate submission attempt (MUST BE BLOCKED)
      const duplicateSubmitRes = await request({
        method: 'POST',
        path: '/api/feedback-responses',
        headers: { Authorization: `Bearer ${studentToken}` },
        body: {
          formId: targetForm._id,
          ratings: [{ questionId: 'Q1', ratingValue: 1 }],
          comments: 'Spam submission attempt',
        },
      });
      assert(
        duplicateSubmitRes.status === 409,
        'Duplicate submission blocked with 409 Conflict (Section 9.2 #7 Compound Unique Index)'
      );
    }

    // -------------------------------------------------------------------------
    // TEST SECTION 5: Analytics & Reporting Aggregation
    // -------------------------------------------------------------------------
    console.log('\n🔹 Testing Analytics & Feedback Summary:');
    const adminSummaryRes = await request({
      method: 'GET',
      path: '/api/analytics/admin-summary',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminSummaryRes.status === 200, 'GET /api/analytics/admin-summary returns 200 OK');
    assert(
      adminSummaryRes.data?.stats?.totalStudents > 0,
      'Institutional metrics calculate active student population'
    );
    assert(
      adminSummaryRes.data?.departmentPerformance?.length > 0,
      'Department performance aggregations calculated'
    );

    // -------------------------------------------------------------------------
    // TEST SECTION 6: Experiment 7 (Socket.IO WebSockets Security & Real-Time Delivery)
    // -------------------------------------------------------------------------
    console.log('\n🔹 Testing Experiment 7: Socket.IO Security & Real-Time Delivery:');

    // 6.1 Missing JWT_SECRET in production causes a safe startup failure
    const startupFailureCheck = spawnSync(
      process.execPath,
      ['-e', 'process.env.JWT_SECRET = ""; process.env.NODE_ENV = "production"; import("./server/index.js")'],
      { encoding: 'utf-8', timeout: 5000 }
    );
    assert(
      startupFailureCheck.status !== 0 && startupFailureCheck.stderr.includes('JWT_SECRET'),
      'Missing JWT_SECRET in production causes a safe startup failure'
    );

    // 6.1b Missing MONGODB_URI in production causes a safe startup failure
    const mongoUriFailureCheck = spawnSync(
      process.execPath,
      ['-e', 'process.env.MONGODB_URI = ""; process.env.NODE_ENV = "production"; import("./server/config/db.js").then(m => m.connectDB())'],
      { encoding: 'utf-8', timeout: 5000 }
    );
    assert(
      mongoUriFailureCheck.status !== 0 && mongoUriFailureCheck.stderr.includes('MONGODB_URI'),
      'Missing MONGODB_URI in production causes a safe startup failure'
    );

    // 6.2 Missing socket token is rejected
    const unauthClient = ClientIO(`http://localhost:${TEST_PORT}`, {
      transports: ['websocket'],
      reconnection: false,
    });
    const unauthRejected = await new Promise((resolve) => {
      unauthClient.on('connect_error', (err) => {
        resolve(err.message.includes('Authentication required'));
      });
      unauthClient.on('connect', () => resolve(false));
      setTimeout(() => resolve(false), 2000);
    });
    unauthClient.disconnect();
    assert(unauthRejected, 'Missing socket token is rejected');

    // 6.3 Invalid JWT is rejected
    const invalidClient = ClientIO(`http://localhost:${TEST_PORT}`, {
      auth: { token: 'invalid.forged.signature' },
      transports: ['websocket'],
      reconnection: false,
    });
    const invalidRejected = await new Promise((resolve) => {
      invalidClient.on('connect_error', (err) => {
        resolve(err.message.includes('Authentication failed') && err.message.includes('Invalid token'));
      });
      invalidClient.on('connect', () => resolve(false));
      setTimeout(() => resolve(false), 2000);
    });
    invalidClient.disconnect();
    assert(invalidRejected, 'Invalid JWT is rejected');

    // 6.4 Expired JWT is rejected
    const expiredToken = jwt.sign(
      { id: studentUser?.id || '6af490da9ee1cc62c34ac8d9', role: 'Student' },
      getJwtSecret(),
      { expiresIn: '1ms' }
    );
    await new Promise((r) => setTimeout(r, 20));

    const expiredClient = ClientIO(`http://localhost:${TEST_PORT}`, {
      auth: { token: expiredToken },
      transports: ['websocket'],
      reconnection: false,
    });
    const expiredRejected = await new Promise((resolve) => {
      expiredClient.on('connect_error', (err) => {
        resolve(err.message.includes('Token has expired'));
      });
      expiredClient.on('connect', () => resolve(false));
      setTimeout(() => resolve(false), 2000);
    });
    expiredClient.disconnect();
    assert(expiredRejected, 'Expired JWT is rejected');

    // Connect authenticated Student A client
    const studentA_Client = ClientIO(`http://localhost:${TEST_PORT}`, {
      auth: { token: studentToken },
      transports: ['websocket'],
    });

    const studentA_Connected = await new Promise((resolve) => {
      studentA_Client.on('connect', () => resolve(true));
      studentA_Client.on('connect_error', () => resolve(false));
      setTimeout(() => resolve(false), 3000);
    });
    assert(studentA_Connected, 'Authenticated Student A Socket.IO client connects successfully');

    // Retrieve server-side socket instance to verify real room membership (not just error events)
    const serverSocketA = getIO()?.sockets?.sockets?.get(studentA_Client.id);
    assert(!!serverSocketA, 'Student A server-side socket instance is accessible for room verification');

    // 6.5 Student A cannot join Student B's private room (verify room membership)
    const studentB_Id = '6af490da9ee1cc62c34ac999';
    studentA_Client.emit('join', { userId: studentB_Id });
    await new Promise((r) => setTimeout(r, 150));
    assert(
      !serverSocketA.rooms.has(`user:${studentB_Id}`),
      'Student A cannot join Student B\'s private room (verified room membership: false)'
    );

    // 6.6 Student A cannot join another department's room (verify room membership)
    studentA_Client.emit('join', { department: 'Mechanical Engineering' });
    await new Promise((r) => setTimeout(r, 150));
    assert(
      !serverSocketA.rooms.has('dept:mechanical engineering'),
      'Student A cannot join another department\'s room (verified room membership: false)'
    );

    // 6.7 Student cannot join Administrator's role room (verify room membership)
    studentA_Client.emit('join', { role: 'Administrator' });
    await new Promise((r) => setTimeout(r, 150));
    assert(
      !serverSocketA.rooms.has('role:Administrator'),
      'Student cannot join Administrator\'s role room (verified room membership: false)'
    );

    // 6.8 Valid student receives their department's notification
    const studentNotificationPromise = new Promise((resolve) => {
      studentA_Client.on('notification:form_created', (data) => {
        resolve(data);
      });
      setTimeout(() => resolve(null), 4000);
    });

    // Trigger form creation via Admin API for Computer Science course
    const sampleCourse = (await request({ method: 'GET', path: '/api/courses', headers: { Authorization: `Bearer ${adminToken}` } })).data?.courses[0];
    const sampleFaculty = sampleCourse?.facultyIds[0]?._id;

    if (sampleCourse && sampleFaculty) {
      await request({
        method: 'POST',
        path: '/api/feedback-forms',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: {
          courseId: sampleCourse._id,
          facultyId: sampleFaculty,
          title: 'Department-Targeted Verification Form',
          semester: 'Fall 2024',
          endDate: new Date('2024-12-31'),
          status: 'Active',
        },
      });
    }

    const receivedStudentNotification = await studentNotificationPromise;
    assert(
      !!receivedStudentNotification && receivedStudentNotification.department?.toLowerCase() === 'computer science',
      'Valid student receives their department\'s notification'
    );
    if (receivedStudentNotification) {
      console.log(`    ↳ Received payload: "${receivedStudentNotification.title}" - ${receivedStudentNotification.message}`);
    }

    // 6.9 Existing administrator notification delivery remains functional
    const adminSocketClient = ClientIO(`http://localhost:${TEST_PORT}`, {
      auth: { token: adminToken },
      transports: ['websocket'],
    });

    const adminSocketConnected = await new Promise((resolve) => {
      adminSocketClient.on('connect', () => resolve(true));
      adminSocketClient.on('connect_error', () => resolve(false));
      setTimeout(() => resolve(false), 3000);
    });
    assert(adminSocketConnected, 'Administrator Socket.IO client connects successfully');

    const adminServerSocket = getIO()?.sockets?.sockets?.get(adminSocketClient.id);
    assert(
      adminServerSocket?.rooms?.has('role:Administrator'),
      'Administrator socket automatically joins role:Administrator room'
    );

    const adminNotificationPromise = new Promise((resolve) => {
      adminSocketClient.on('notification:feedback_received', (data) => resolve(data));
      setTimeout(() => resolve(null), 4000);
    });

    // Trigger feedback submission notification to test administrative delivery
    const { emitFeedbackSubmitted } = await import('./sockets/socketHandler.js');
    await emitFeedbackSubmitted({
      facultyUserId: sampleFaculty,
      courseCode: sampleCourse?.courseCode || 'CS101',
      courseName: sampleCourse?.courseName || 'Computer Science',
      responseId: new mongoose.Types.ObjectId(),
      formId: new mongoose.Types.ObjectId(),
    });

    const receivedAdminNotification = await adminNotificationPromise;
    assert(
      !!receivedAdminNotification && receivedAdminNotification.title.includes('New Student Feedback Submitted'),
      'Existing administrator notification delivery remains functional'
    );
    if (receivedAdminNotification) {
      console.log(`    ↳ Admin received payload: "${receivedAdminNotification.title}" - ${receivedAdminNotification.message}`);
    }

    studentA_Client.disconnect();
    adminSocketClient.disconnect();

    // -------------------------------------------------------------------------
    // TEST SECTION 7: Persistent Notifications API (MongoDB Atlas)
    // -------------------------------------------------------------------------
    console.log('\n🔹 Testing Persistent Notifications in MongoDB Atlas:');
    const notifsRes = await request({
      method: 'GET',
      path: '/api/notifications',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(notifsRes.status === 200, 'GET /api/notifications returns 200 OK');
    assert(Array.isArray(notifsRes.data?.notifications), 'Returns notifications array from MongoDB Atlas');

    const markAllRes = await request({
      method: 'PATCH',
      path: '/api/notifications/read-all',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(markAllRes.status === 200, 'PATCH /api/notifications/read-all returns 200 OK');

    // -------------------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------------------
    console.log('\n===============================================================');
    console.log(`📊 Test Results: ${passedTests}/${totalTests} Passed (${Math.round((passedTests / totalTests) * 100)}%)`);
    console.log('===============================================================\n');

    server.close();
    await mongoose.disconnect();
    process.exit(passedTests === totalTests ? 0 : 1);
  } catch (error) {
    console.error('❌ Test execution error:', error);
    server.close();
    await mongoose.disconnect();
    process.exit(1);
  }
};

runBackendTests();
