# 🎓 EduFeedback: Student Feedback Management System
> **Full-Stack Academic Feedback & Real-Time Course Evaluation Platform**  
> Built with **React 19, Tailwind CSS v4, Node.js, Express, MongoDB Atlas, Mongoose, JWT Authentication, and Socket.IO**.

[![Build Status](https://img.shields.io/badge/Build-Passing-emerald)](https://github.com/)
[![Tests](https://img.shields.io/badge/Tests-28%2F28%20Passed%20(100%25)-blue)](https://github.com/)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-green)](https://www.mongodb.com/cloud/atlas)
[![Sockets](https://img.shields.io/badge/Real--Time-Socket.IO%20v4-orange)](https://socket.io/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED)](https://www.docker.com/)

---

## 📌 1. Project Overview

**EduFeedback** is a full-stack, enterprise-grade academic feedback management web application designed for higher education institutions. It replaces outdated paper-based evaluations with an automated, responsive, role-based platform that facilitates student feedback collection, faculty analytics, and administrative oversight.

### Key Capabilities
* **Role-Based Access Control (RBAC)**: Distinct dashboards and permissions for **Students**, **Faculty**, and **Administrators**.
* **JWT Authentication & Password Hashing**: Secure registration, login, and password verification using `bcryptjs` and `jsonwebtoken`.
* **Real-Time Notification Gateway**: WebSocket-driven instant alerts using `Socket.IO` when administrators publish forms and when students submit evaluations.
* **Database Concurrency & Integrity**: Persistent storage in **MongoDB Atlas** with compound unique index enforcement (`{ formId: 1, studentId: 1 }`) to eliminate duplicate submissions.
* **Dynamic Analytics & Reporting**: Real-time aggregation of student evaluations, departmental trends, and CSV data export capabilities.
* **Production Docker Containerization**: Multi-stage Docker containers with Nginx reverse proxy and health checking.

---

## 🏗️ 2. Technology Stack & Architecture

```
┌────────────────────────────────────────────────────────┐
│                   React 19 Client                      │
│        (Tailwind CSS v4, Lucide Icons, Context API)    │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP REST / WebSocket (WS)
┌──────────────────────────▼─────────────────────────────┐
│                 Express.js Backend API                 │
│         (JWT Auth, RBAC Middleware, Morgan, CORS)      │
├──────────────────────────┬─────────────────────────────┤
│   Socket.IO Gateway      │    Mongoose ODM Engine      │
│  (Real-Time Rooms)       │   (Validation & Indexing)   │
└────────────┬─────────────┴──────────────┬──────────────┘
             │                            │
┌────────────▼─────────────┐ ┌────────────▼──────────────┐
│  Connected Active Clients│ │    MongoDB Atlas Cluster  │
│  (Student / Admin Rooms) │ │  (StudentFeedbackDB Cloud)│
└──────────────────────────┘ └───────────────────────────┘
```

* **Frontend**: React 19, Tailwind CSS v4, Lucide React, Socket.IO Client
* **Backend API**: Node.js, Express.js 5, JSON Web Tokens (JWT), Bcrypt.js, CORS
* **Database**: MongoDB Atlas Cluster via Mongoose 9 ODM
* **WebSockets**: Socket.IO 4.8.4
* **DevOps**: Docker, Docker Compose, Nginx, GitHub Actions CI

---

## 📋 3. Mini Project Evaluation Checklist Mapping

| Requirement | Implementation Details | Verified Status |
| :--- | :--- | :--- |
| **Frontend with Tailwind** | Semantic layout with Tailwind v4, mobile-first design, high contrast accessible UI | ✅ Complete |
| **React & State Management** | React 19 Context API (`AppContext`), session retention in localStorage | ✅ Complete |
| **Backend REST API** | Express controllers for Auth, Users, Courses, Forms, Responses, Analytics, Notifications | ✅ Complete |
| **MongoDB & Mongoose** | 7 Collections in MongoDB Atlas (`users`, `students`, `faculties`, `courses`, `feedbackforms`, `feedbackresponses`, `notifications`) | ✅ Complete |
| **Data Validation** | Frontend live checks + Express schema validation + Mongo Unique constraints | ✅ Complete |
| **Authentication & RBAC** | JWT Tokens (7d expiry), Bcrypt hashing (10 salt rounds), Admin/Student/Faculty guards | ✅ Complete |
| **Real-Time Features** | Socket.IO rooms (`role:Student`, `role:Administrator`, `user:<id>`) | ✅ Complete |
| **Docker** | Multi-stage `Dockerfile`, `server/Dockerfile`, `compose.yaml`, `nginx.conf` | ✅ Complete |
| **DevOps & Deployment** | Automated health checks (`/api/health`), GitHub Actions CI (`.github/workflows/ci.yml`) | ✅ Complete |

---

## 🔑 4. Demo Accounts & Credentials

The database is pre-seeded with verified test accounts across all roles:

| Role | Email / Username | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Administrator** | `eleanor.vance@university.edu` | `password123` | Institutional dashboard, course creation, form publishing, user management |
| **Faculty Member** | `alan.turing@university.edu` | `password123` | Department feedback analytics, rating breakdowns, course evaluations |
| **Student** | `maanas.chawan@university.edu` | `password123` | Pending course evaluations, feedback submissions, confirmation receipts |

> [!TIP]
> On the login page, you can also use the **One-Click Evaluator Demo Access** buttons to instantly populate credentials and log in.

---

## ⚡ 5. Important Two-Tab Demonstration Scenario

To demonstrate real-time WebSocket communication and database persistence for college evaluators:

### Step 1: Open Two Separate Browser Windows
1. Open **Browser Window A (or Regular Window)**: Navigate to `http://localhost:5173`.
   * Log in as **Administrator** (`eleanor.vance@university.edu` / `password123`).
2. Open **Browser Window B (or Incognito / Second Browser)**: Navigate to `http://localhost:5173`.
   * Log in as **Student** (`maanas.chawan@university.edu` / `password123`).

### Step 2: Admin Publishes a Feedback Form
1. In the **Admin window**, navigate to **Feedback Forms** (`feedback-form-management`).
2. Click **+ Create Feedback Form**, enter a title (e.g. `Advanced Computer Science Lab Evaluation`), and click **Publish Form**.
3. **Observe the Student Window**:
   * A real-time toast alert immediately appears: *"New Feedback Form Available"*.
   * The notification bell badge increments without refreshing.
   * The new evaluation form appears in the Student's **Pending Feedback** list.

### Step 3: Student Submits Course Feedback
1. In the **Student window**, click **Evaluate** on any active course form.
2. Complete the star ratings (1 to 5), enter comments/suggestions, and click **Submit Feedback**.
3. The student receives a unique confirmation ID (e.g. `SFB-XXXXX`).
4. **Observe the Admin Window**:
   * A real-time toast notification immediately pops up on the Admin's screen: *"New Student Feedback Submitted"*.
   * The Admin's notification bell increments.

### Step 4: Verify Persistence Across Page Refreshes
1. Press **F5 (Refresh)** in both the Student and Admin browser windows.
2. Both sessions are **fully retained** (users are not kicked out to login).
3. Open the **Notification Bell**: All notifications persist directly from **MongoDB Atlas**.
4. Attempting to submit feedback again on the same form is blocked with `409 Conflict` (Duplicate Submission Prevention).

---

## 🚀 6. Installation & Local Setup

### Prerequisites
* Node.js (v20+ recommended)
* npm (v10+)
* Active MongoDB Atlas cluster connection string

### Step 1: Clone and Install Dependencies
```bash
git clone https://github.com/your-username/student_feedback_management_system.git
cd student_feedback_management_system
npm install
```

### Step 2: Configure Environment Variables
Create a `.env` file in the project root:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=super_secret_university_feedback_jwt_key_2026_secure
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### Step 3: Seed the MongoDB Atlas Database
```bash
npm run seed
```

### Step 4: Run the Application
In your terminal, start the backend and frontend:

**Option A: Running Frontend & Backend Concurrently**
```bash
# Terminal 1: Backend Server (Port 5000)
npm run server

# Terminal 2: Vite React Frontend (Port 5173)
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 🧪 7. Running the Automated Verification Suite

The repository includes a comprehensive 28-point automated integration test suite validating REST APIs, JWT tokens, RBAC, MongoDB Atlas CRUD, and Socket.IO:

```bash
npm run test:backend
```

**Expected Output:**
```text
===============================================================
🧪 Starting Backend Verification Suite (Exp 5, 6, & 7)
===============================================================
  ✅ [PASS] GET /api/health returns 200 OK
  ✅ [PASS] Admin login succeeds with 200 OK
  ✅ [PASS] JWT Token generated and returned for Admin
  ✅ [PASS] Role correctly decoded as Administrator
  ✅ [PASS] Student login succeeds with 200 OK
  ✅ [PASS] Invalid password rejected with 401 Unauthorized
  ✅ [PASS] Student accessing Admin-only route (/api/users) is blocked with 403 Forbidden
  ✅ [PASS] Administrator accessing /api/users succeeds with 200 OK
  ✅ [PASS] POST /api/courses creates new course (201 Created)
  ✅ [PASS] Duplicate submission blocked with 409 Conflict (Compound Unique Index)
  ✅ [PASS] Socket.IO client received real-time notification:form_created event
  ✅ [PASS] GET /api/notifications returns 200 OK
===============================================================
📊 Test Results: 28/28 Passed (100%)
===============================================================
```

---

## 🐳 8. Production Docker Deployment & Orchestration

EduFeedback features a complete, multi-container production deployment using **Docker** and **Docker Compose** (`compose.yaml`).

### System Container Topology

```text
┌────────────────────────────────────────────────────────┐
│               Host Network (Ports 80, 5173, 5000)      │
└──────────────────────────┬─────────────────────────────┘
                           │
       ┌───────────────────┴───────────────────┐
       ▼                                       ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐
│  edufeedback-frontend        │ │  edufeedback-backend         │
│  (Nginx Alpine Reverse Proxy)│ │  (Node.js 20 Alpine Non-Root)│
│  Port 80 (HTTP) & 5173       │ │  Port 5000 (REST & WS)       │
└──────────────┬───────────────┘ └──────────────┬───────────────┘
               │ (Proxy /api/ & /socket.io/)    │
               └───────────────┬────────────────┘
                               │ Internal Network: edufeedback-net
                               ▼
                ┌──────────────────────────────┐
                │  edufeedback-db              │
                │  (MongoDB 7.0 LTS)           │
                │  Volume: edufeedback-mongo-data
                └──────────────────────────────┘
```

### Prerequisites
* **Docker Engine** v24.0+ or **Docker Desktop**
* **Docker Compose** v2.20+ (`docker compose`)

### Environment Configuration
Copy the template configuration file:
```bash
cp .env.example .env
```
Default settings in `.env.example` are pre-configured to work immediately with containerized MongoDB and require no manual edits for local Docker evaluation.

### One-Command Deployment
To build all images from scratch and launch the full stack:
```bash
docker compose up --build
```
Or to run in detached (background) mode:
```bash
docker compose up --build -d
```

### Verified Application Endpoints
| Component | URL | Description |
| :--- | :--- | :--- |
| **Frontend Web Portal** | `http://localhost:80` | Primary Nginx production web interface |
| **Frontend Dev-Port** | `http://localhost:5173` | Mapped to Nginx port 80 for backward compatibility |
| **Backend REST API** | `http://localhost:5000` | Direct Express.js & Socket.IO server |
| **System Health Check** | `http://localhost:5000/api/health` | Backend JSON health status |
| **Reverse-Proxied API** | `http://localhost:80/api/health` | Verified Nginx gateway pass-through |

### Database Initialization & Persistence Guarantees
* **Automated Cold-Start Seeding**: When containers are launched for the first time against an empty database volume, the backend automatically seeds initial test accounts, courses, and active evaluation forms.
* **Idempotent Restart Protection**: On subsequent container starts, recreations, or host reboots, the system detects existing records and automatically bypasses seeding. **Your new user registrations, published forms, and submitted feedback are strictly preserved.**
* **Persistent Named Volume**: All database files are stored in the Docker named volume `edufeedback-mongo-data`.

### Stopping the Services
* **Stop containers while preserving all data**:
  ```bash
  docker compose down
  ```
* **Stop containers and purge persistent data** (complete factory reset):
  ```bash
  docker compose down -v
  ```

### Container Health Monitoring & Troubleshooting
* **Check live container health**:
  ```bash
  docker compose ps
  ```
  Expected status for all 3 services: `Up (healthy)`.
* **View real-time service logs**:
  ```bash
  # View backend logs (DB connection, socket events, API requests)
  docker compose logs -f backend

  # View Nginx access & reverse-proxy logs
  docker compose logs -f frontend

  # View MongoDB engine logs
  docker compose logs -f mongo
  ```
* **Port Conflict Resolution**:
  If port `80`, `5173`, or `5000` is in use by another application on your host machine, adjust the port mappings in `compose.yaml` (e.g., change `"80:80"` to `"8080:80"`).

---

## 📁 9. Project Directory Structure

```text
student_feedback_management_system/
├── compose.yaml                   # Authoritative Docker Compose configuration
├── Dockerfile                     # Multi-stage production Dockerfile (React + Nginx)
├── nginx.conf                     # Production Nginx reverse-proxy & SPA routing config
├── .dockerignore                  # Docker build context exclusions
├── .env.example                   # Environment configuration template
├── .github/workflows/ci.yml       # Automated GitHub Actions CI pipeline
├── server/
│   ├── Dockerfile                 # Backend production Dockerfile (Node.js 20 Non-Root)
│   ├── config/db.js               # MongoDB connection with TLS & auto-indexing
│   ├── controllers/               # Express API controllers (Auth, Form, Response, etc.)
│   ├── middleware/                # JWT Auth, Role RBAC, Input Validation, Error handling
│   ├── models/                    # Mongoose Models (User, Student, Faculty, Course, Form, Response, Notification)
│   ├── routes/                    # REST API routes
│   ├── sockets/socketHandler.js   # Real-time WebSocket notification gateway
│   ├── seed.js                    # Idempotent database initialization and seed module
│   ├── test-backend.js            # Automated 28-test integration test runner
│   └── index.js                   # Express application entrypoint
├── src/
│   ├── components/
│   │   ├── common/                # UI components (SubmissionReviewModal, Toast, StatCard)
│   │   └── layout/                # AppLayout, Header, Sidebar
│   ├── context/AppContext.jsx     # Centralized state management & WebSocket subscriptions
│   ├── pages/
│   │   ├── LoginPage.jsx          # JWT Authentication & Student Registration
│   │   ├── admin/                 # Institutional Dashboard, Forms, Users, Analytics
│   │   ├── faculty/               # Faculty Dashboard, Course Feedback Analysis
│   │   └── student/               # Student Dashboard, Evaluation Form, Submissions
│   └── services/
│       ├── api.js                 # Frontend REST API client
│       └── socket.js              # Frontend Socket.IO client manager
└── README.md                      # Comprehensive system documentation
```

---

## 🔒 10. Security & Best Practices

1. **Password Security**: Passwords hashed with `bcryptjs` using 10 salt rounds prior to storage.
2. **Access Control**: Strict role verification on both backend middleware and client routing.
3. **No Credential Leaks**: Credentials excluded by default via Mongoose `{ select: false }`. Sensitive variables (.env) are gitignored.
4. **Duplicate Prevention**: Database compound unique index `{ formId: 1, studentId: 1 }` prevents race condition submissions.
5. **CORS & Rate Limiting**: Secure cross-origin policies configured for production readiness.

---

## 📜 11. License
Academic and educational license for university mini-project demonstration.
Developed by **Maanas Chawan** (2024–2026).
