# Mini Project Evaluation — DevOps, Deployment & Architecture Guide

This document provides a comprehensive guide for the **Mini Project Evaluation**, covering the compulsory checklist, step-by-step DevOps & deployment instructions, and how to connect to **MongoDB Atlas**.

---

## 1. Mini Project Compulsory Checklist Compliance Matrix

| Requirement | Implementation Details | Code References |
| :--- | :--- | :--- |
| **1. Frontend with Tailwind** | Built using React 19 and Tailwind CSS v4. Includes fully responsive enterprise dashboards, custom KPI cards, fluid layout (`max-w-[1720px]`), and accessible UI components without mock notes. | [`src/index.css`](file:///c:/Users/chawa/Documents/student_feedback_management_system/src/index.css), [`AppLayout.jsx`](file:///c:/Users/chawa/Documents/student_feedback_management_system/src/components/layout/AppLayout.jsx), [`Header.jsx`](file:///c:/Users/chawa/Documents/student_feedback_management_system/src/components/layout/Header.jsx) |
| **2. React & State Management** | Centralized reactive state in `AppContext.jsx` using `useContext`, `useState`, `useEffect`, and `useMemo`. Derived state ensures live changes (e.g., adding courses, creating forms, submitting feedback) reflect across all dashboards instantly. | [`AppContext.jsx`](file:///c:/Users/chawa/Documents/student_feedback_management_system/src/context/AppContext.jsx) |
| **3. Backend REST API** | Express.js REST API with clean modular routing for Authentication, Users, Courses, Feedback Forms, Feedback Responses, and Analytics. | [`server/index.js`](file:///c:/Users/chawa/Documents/student_feedback_management_system/server/index.js), [`server/routes/`](file:///c:/Users/chawa/Documents/student_feedback_management_system/server/routes/) |
| **4. MongoDB & Mongoose** | Mongoose schemas conforming to Section 9 of the specification (`StudentFeedbackDB`). Implements the mandatory unique compound index `{ formId: 1, studentId: 1 }` preventing duplicate submissions. | [`server/models/`](file:///c:/Users/chawa/Documents/student_feedback_management_system/server/models/), [`server/config/db.js`](file:///c:/Users/chawa/Documents/student_feedback_management_system/server/config/db.js) |
| **5. Data Validation** | Comprehensive data validation on both backend and frontend: input sanitization, email format regex, password length rules, course code pattern (`[A-Z]{2,5}[0-9]{3,4}`), rating 1–5 range checks, and mandatory question checks. | [`validate.middleware.js`](file:///c:/Users/chawa/Documents/student_feedback_management_system/server/middleware/validate.middleware.js), [`FeedbackFormPage.jsx`](file:///c:/Users/chawa/Documents/student_feedback_management_system/src/pages/student/FeedbackFormPage.jsx) |
| **6. Authentication & Authorization** | JWT token generation (`jsonwebtoken`), password hashing using `bcryptjs` (10 salt rounds), authentication middleware, and Role-Based Authorization (RBAC) protecting Student, Faculty, and Admin endpoints. | [`auth.middleware.js`](file:///c:/Users/chawa/Documents/student_feedback_management_system/server/middleware/auth.middleware.js), [`role.middleware.js`](file:///c:/Users/chawa/Documents/student_feedback_management_system/server/middleware/role.middleware.js), [`jwt.js`](file:///c:/Users/chawa/Documents/student_feedback_management_system/server/utils/jwt.js) |
| **7. Real-Time Features (Socket.IO)** | WebSockets & Socket.IO server broadcasting real-time events: `notification:form_created`, `notification:form_updated`, and `notification:feedback_received`. | [`socketHandler.js`](file:///c:/Users/chawa/Documents/student_feedback_management_system/server/sockets/socketHandler.js), [`socket.js`](file:///c:/Users/chawa/Documents/student_feedback_management_system/src/services/socket.js) |
| **8. Docker Containerization** | Multi-stage `Dockerfile` (Nginx reverse proxy), `server/Dockerfile` (Node.js non-root runtime), and `compose.yaml` orchestrating Frontend, Backend, and MongoDB with persistent volumes and health checks. | [`Dockerfile`](file:///c:/Users/chawa/Documents/student_feedback_management_system/Dockerfile), [`server/Dockerfile`](file:///c:/Users/chawa/Documents/student_feedback_management_system/server/Dockerfile), [`compose.yaml`](file:///c:/Users/chawa/Documents/student_feedback_management_system/compose.yaml) |
| **9. DevOps & Deployment** | GitHub Actions CI workflow for automated testing and builds, plus complete deployment blueprints for MongoDB Atlas, Render, Railway, and Vercel. | [`.github/workflows/ci.yml`](file:///c:/Users/chawa/Documents/student_feedback_management_system/.github/workflows/ci.yml) |

---

## 2. Connecting to MongoDB Atlas (When Ready)

Follow these steps when you are ready to connect to your cloud MongoDB Atlas cluster:

### Step 1: Create a Cluster on MongoDB Atlas
1. Sign in to [MongoDB Cloud](https://cloud.mongodb.com/).
2. Create a free **M0 Sandbox Cluster**.
3. Under **Database Access**, create a user (e.g., username `admin_feedback` and a strong password).
4. Under **Network Access**, click **Add IP Address** and choose **Allow Access From Anywhere** (`0.0.0.0/0`) or add your current IP address.

### Step 2: Obtain Connection String
1. Click **Connect** > **Drivers** (Node.js).
2. Copy the connection string. It will look like:
   ```
   mongodb+srv://admin_feedback:<password>@cluster0.mongodb.net/StudentFeedbackDB?retryWrites=true&w=majority
   ```

### Step 3: Update `.env`
In your project `.env` file, replace `MONGODB_URI`:
```env
MONGODB_URI=mongodb+srv://admin_feedback:YOUR_PASSWORD_HERE@cluster0.mongodb.net/StudentFeedbackDB?retryWrites=true&w=majority
```

### Step 4: Seed the Cloud Database
Run the seed script to populate your Atlas database with initial users, courses, and forms:
```bash
npm run seed
```

---

## 3. Running with Docker Compose (Connected to MongoDB Atlas)

`compose.yaml` orchestrates the Frontend, Backend, and MongoDB services on an isolated bridge network (`edufeedback-network`), while preserving database records in the `edufeedback-mongo-data` volume. It also supports direct connection to **MongoDB Atlas** via `MONGODB_URI` in `.env`.

### How to Run with Docker:

1. **Ensure `.env` contains your MongoDB Atlas URI:**
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/StudentFeedbackDB?retryWrites=true&w=majority
   JWT_SECRET=super_secret_university_feedback_jwt_key_2026_secure
   PORT=5000
   NODE_ENV=production
   ```

2. **Execute Docker Compose Build & Start:**
   Open PowerShell or Command Prompt in the project folder and run:
   ```powershell
   # Build images and start Frontend & Backend containers in background
   docker compose up --build -d
   ```

3. **Verify running containers:**
   ```powershell
   docker compose ps
   ```

4. **View backend connection logs (confirming MongoDB Atlas connection):**
   ```powershell
   docker compose logs -f backend
   ```
   You will see:
   ```
   [MongoDB] Connected successfully to host: cluster0-shard-00-00.mongodb.net, database: StudentFeedbackDB
   [Server] Student Feedback System backend running on http://localhost:5000
   [Socket.IO] Real-time notification server active
   ```

5. **Access the application in your browser:**
   - **Frontend Web Portal**: Open `http://localhost` (or `http://localhost:5173`)
   - **Backend REST API**: `http://localhost:5000/api/health`

6. **To stop the Docker containers:**
   ```powershell
   docker compose down
   ```

---

## 4. Production Cloud Deployment Guide

### Option A: Free PaaS Deployment (Recommended for Student Projects)

```
  +------------------+          +------------------+          +-------------------+
  |      Vercel      |  HTTPS   |  Render/Railway  |   TLS    |   MongoDB Atlas   |
  | (React Frontend) +----------> (Express Backend)+---------->  (Cloud Database) |
  +------------------+          +------------------+          +-------------------+
```

#### 1. Backend Deployment on Render.com or Railway.app
1. Push your repository to GitHub.
2. Log in to [Render](https://render.com) and click **New Web Service**.
3. Connect your GitHub repository.
4. Set the following settings:
   - **Root Directory**: Leave blank (or `.`)
   - **Build Command**: `npm ci`
   - **Start Command**: `node server/index.js`
5. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `MONGODB_URI`: Your MongoDB Atlas URI
   - `JWT_SECRET`: A secure random secret string
   - `JWT_EXPIRES_IN`: `7d`
6. Click **Deploy Web Service**. You will receive an endpoint like `https://student-feedback-backend.onrender.com`.

#### 2. Frontend Deployment on Vercel
1. Log in to [Vercel](https://vercel.com) and click **Add New Project**.
2. Select your GitHub repository.
3. In **Environment Variables**, add:
   - `VITE_API_URL`: `https://student-feedback-backend.onrender.com/api`
   - `VITE_SOCKET_URL`: `https://student-feedback-backend.onrender.com`
4. Click **Deploy**. Vercel will build the frontend with Vite and provide a live URL (e.g. `https://student-feedback-portal.vercel.app`).

---

## 5. Automated Verification & Testing Commands

To verify all features before evaluation:

```bash
# 1. Test backend REST API, validation, JWT auth, RBAC & Socket.IO (25/25 Tests)
npm run test:backend

# 2. Verify clean production build
npm run build

# 3. Reset & seed database with clean demo data
npm run seed
```

**Pre-configured Evaluator Accounts:**
- **Administrator**: `eleanor.vance@university.edu` / `password123`
- **Faculty**: `alan.turing@university.edu` / `password123`
- **Faculty**: `grace.hopper@university.edu` / `password123`
- **Student**: `maanas.chawan@university.edu` / `password123`
