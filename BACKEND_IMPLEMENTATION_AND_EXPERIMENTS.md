# Student Feedback Management System — Backend & Database Implementation

This document provides a comprehensive overview of the **Backend, Database, and Class Experiments (5, 6, 7)** implemented for the **Student Feedback Management System** based on the specification document **`Maanas_Chawan_FSD_Exp0.pdf`**.

---

## 1. System Architecture Overview

```
                      +---------------------------------------+
                      |       React 19 Frontend (Vite)        |
                      |   (Dashboards, Forms, Analytics UI)   |
                      +-------------------+-------------------+
                                          |
                        REST APIs (HTTP)  |  WebSockets (Socket.IO)
                                          |
                      +-------------------v-------------------+
                      |      Node.js & Express.js Backend     |
                      |          (Port 5000 / HTTP)           |
                      +-------------------+-------------------+
                                          |
             +----------------------------+---------------------------+
             |                            |                           |
+------------v------------+  +------------v------------+  +-----------v-----------+
|  JWT Authentication &   |  |   REST API Controllers  |  |  Socket.IO Real-Time  |
|  Role-Based Auth (RBAC) |  |   (Courses, Forms,      |  |  Notification Gateway |
|      (Experiment 6)     |  |    Responses, Analytics)|  |      (Experiment 7)   |
+-------------------------+  +------------+------------+  +-----------------------+
                                          |
                                 Mongoose ODM
                                          |
                      +-------------------v-------------------+
                      |          MongoDB Database             |
                      |       (`StudentFeedbackDB`)           |
                      |           (Experiment 5)              |
                      +---------------------------------------+
```

---

## 2. Experiment Mappings & Features Implemented

### 🌟 Experiment 5: MongoDB & Mongoose Persistent REST API CRUD
- **Database Engine**: MongoDB / MongoDB Atlas via **Mongoose**.
- **Database Name**: `StudentFeedbackDB` (Section 9.0 of PDF).
- **Mongoose Data Models (`server/models/`)**:
  1. [`User.js`](file:///c:/Users/chawa/Documents/student_feedback_management_system/server/models/User.js): Stores credentials, roles (`Student`, `Faculty`, `Administrator`), and account status (`Active`/`Inactive`).
  2. [`Student.js`](file:///c:/Users/chawa/Documents/student_feedback_management_system/server/models/Student.js): Stores student-specific academic information (`rollNo`, `department`, `semester`, enrolled courses).
  3. [`Faculty.js`](file:///c:/Users/chawa/Documents/student_feedback_management_system/server/models/Faculty.js): Stores faculty-specific information (`department`, `designation`, specialization).
  4. [`Course.js`](file:///c:/Users/chawa/Documents/student_feedback_management_system/server/models/Course.js): Stores courses and supports co-teaching via an array of faculty references (`facultyIds: [{ type: ObjectId, ref: 'Faculty' }]` as specified in Section 9.2 #4 and 9.3).
  5. [`FeedbackForm.js`](file:///c:/Users/chawa/Documents/student_feedback_management_system/server/models/FeedbackForm.js): Stores evaluation forms, evaluation periods (`startDate`, `endDate`), status (`Active`, `Draft`, `Completed`), and evaluation criteria questions (`Rating` and `Text`).
  6. [`FeedbackResponse.js`](file:///c:/Users/chawa/Documents/student_feedback_management_system/server/models/FeedbackResponse.js): Stores submitted ratings, comments, suggestions, and submission timestamp.
  7. [`Notification.js`](file:///c:/Users/chawa/Documents/student_feedback_management_system/server/models/Notification.js): Stores persistent in-app notifications.

- **Mandatory Database Constraint (Section 9.2 #7 & 9.3)**:
  ```javascript
  feedbackResponseSchema.index({ formId: 1, studentId: 1 }, { unique: true });
  ```
  Applied in `FeedbackResponse.js` and verified by the automated test suite. Prevents duplicate submissions for the same feedback form by the same student at the database level.

---

### 🌟 Experiment 6: User Authentication & Role-Based Authorization (RBAC)
- **Password Hashing**: `bcryptjs` with auto-salt generation (10 rounds) in the `User` pre-save hook.
- **JWT Authentication**:
  - `generateToken(payload)` signs a secure JSON Web Token containing `id`, `name`, `email`, `role`, and `profileId`.
  - [`auth.middleware.js`](file:///c:/Users/chawa/Documents/student_feedback_management_system/server/middleware/auth.middleware.js): Intercepts incoming `Authorization: Bearer <token>` headers, validates the token signature, and attaches `req.user`, `req.studentProfile`, or `req.facultyProfile`.
- **Role-Based Authorization (RBAC)**:
  - [`role.middleware.js`](file:///c:/Users/chawa/Documents/student_feedback_management_system/server/middleware/role.middleware.js): Restricts endpoints based on role:
    - `authorizeRoles('Administrator')`: Access to User Management, Course CRUD, and Form creation.
    - `authorizeRoles('Student')`: Access to Feedback Submission (`POST /api/feedback-responses`) and Personal Submission History.
    - `authorizeRoles('Faculty', 'Administrator')`: Access to Feedback Analytics, Question Statistics, and Student Comments.

---

### 🌟 Experiment 7: WebSockets & Socket.IO Real-Time Notifications
- **Gateway**: [`server/sockets/socketHandler.js`](file:///c:/Users/chawa/Documents/student_feedback_management_system/server/sockets/socketHandler.js).
- **Socket Rooms**:
  - Role Rooms: `role:Student`, `role:Faculty`, `role:Administrator`.
  - User Rooms: `user:<userId>`.
- **Real-Time Event Triggers**:
  1. `notification:form_created`: Broadcast to `role:Student` whenever an Administrator creates and publishes an evaluation form.
  2. `notification:form_updated`: Broadcast to `role:Student` and `role:Administrator` whenever a form is activated, deactivated, or modified.
  3. `notification:feedback_received`: Sent directly to the evaluated Faculty member's private socket room when a student submits feedback.
  4. `notification:feedback_stat_updated`: Broadcast to `role:Administrator` to update real-time completion percentages.

---

## 3. REST API Endpoint Reference

| Module | Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **System** | `GET` | `/api/health` | Public | System status and active experiment features |
| **Auth** | `POST` | `/api/auth/register` | Public | Register new user with student/faculty profile |
| **Auth** | `POST` | `/api/auth/login` | Public | Authenticate with bcrypt & issue JWT token |
| **Auth** | `GET` | `/api/auth/profile` | Private | Retrieve authenticated profile information |
| **Auth** | `PUT` | `/api/auth/profile` | Private | Update profile information |
| **Auth** | `PUT` | `/api/auth/change-password` | Private | Change password with current password verification |
| **Users** | `GET` | `/api/users` | Admin | List users with role/status filters (View 8) |
| **Users** | `POST` | `/api/users` | Admin | Create user account |
| **Users** | `PUT` | `/api/users/:id` | Admin | Update user details and role |
| **Users** | `PATCH` | `/api/users/:id/toggle-status` | Admin | Activate / deactivate user account |
| **Users** | `DELETE` | `/api/users/:id` | Admin | Delete user account and associated profile |
| **Courses** | `GET` | `/api/courses` | Authenticated | List all courses with populated faculty (View 9) |
| **Courses** | `POST` | `/api/courses` | Admin | Create course with co-teaching faculty |
| **Courses** | `PUT` | `/api/courses/:id` | Admin | Update course and faculty assignments |
| **Courses** | `DELETE` | `/api/courses/:id` | Admin | Remove course |
| **Forms** | `GET` | `/api/feedback-forms` | Authenticated | List forms with student submission status (View 10) |
| **Forms** | `GET` | `/api/feedback-forms/:id` | Authenticated | Retrieve form and questions (View 3) |
| **Forms** | `POST` | `/api/feedback-forms` | Admin | Create and publish form (**Socket.IO event**) |
| **Forms** | `PUT` | `/api/feedback-forms/:id` | Admin | Update form details or questions |
| **Forms** | `PATCH` | `/api/feedback-forms/:id/toggle-status` | Admin | Toggle Active / Draft status (**Socket.IO event**) |
| **Forms** | `DELETE` | `/api/feedback-forms/:id` | Admin | Delete form and associated responses |
| **Responses** | `POST` | `/api/feedback-responses` | Student | Submit feedback (**Duplicate check + Socket.IO**) |
| **Responses** | `GET` | `/api/feedback-responses/my` | Student | Get authenticated student's submission history |
| **Responses** | `GET` | `/api/feedback-responses/form/:formId` | Faculty/Admin | Get all responses for a form (anonymized) |
| **Analytics** | `GET` | `/api/analytics/faculty/dashboard` | Faculty/Admin | Average ratings & course performance (View 5) |
| **Analytics** | `GET` | `/api/analytics/course/:courseId` | Faculty/Admin | Question breakdown & comments (View 6) |
| **Analytics** | `GET` | `/api/analytics/admin-summary` | Admin | Institutional stats & dept metrics (Views 7 & 11) |

---

## 4. How to Run, Test, and Verify

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on `mongodb://127.0.0.1:27017` (or MongoDB Atlas connection string in `.env`)

### Step 1: Seed the Database
Populates the database with realistic demo accounts, courses, forms, and responses:
```bash
npm run seed
```
**Demo Accounts Created:**
- **Administrator**: `eleanor.vance@university.edu` / `password123`
- **Faculty**: `alan.turing@university.edu` / `password123`
- **Faculty**: `grace.hopper@university.edu` / `password123`
- **Student**: `maanas.chawan@university.edu` / `password123`
- **Student**: `alex.chen@university.edu` / `password123`

### Step 2: Start the Backend Server
Starts the Express server with Socket.IO on port `5000`:
```bash
npm run server
```

### Step 3: Run the Automated Verification Suite
Runs the end-to-end automated test runner verifying Experiments 5, 6, and 7:
```bash
npm run test:backend
```
*(All 23 assertions validate 100% pass rate)*.

---

## 5. Postman Collection

A complete Postman collection is ready to import at:
[`postman/Student_Feedback_System.postman_collection.json`](file:///c:/Users/chawa/Documents/student_feedback_management_system/postman/Student_Feedback_System.postman_collection.json)

**Features:**
- Automatic Token Management: Logging in with Administrator, Student, or Faculty automatically updates `{{admin_token}}`, `{{student_token}}`, and `{{faculty_token}}`.
- Covers all CRUD, RBAC, submission checks, and analytics queries.
