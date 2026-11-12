import express from 'express';
import {
  getFacultyDashboard,
  getCourseAnalysis,
  getAdminSummary,
  getDetailedReports,
} from '../controllers/analytics.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';

const router = express.Router();

router.use(authenticateToken);

// Faculty dashboard metrics
router.get('/faculty/dashboard', authorizeRoles('Faculty', 'Administrator'), getFacultyDashboard);

// Course-specific detailed breakdown
router.get('/course/:courseId', authorizeRoles('Faculty', 'Administrator'), getCourseAnalysis);

// Admin institutional summary (Reports & Analytics View 11)
router.get('/admin-summary', authorizeRoles('Administrator'), getAdminSummary);

// Comprehensive dynamic institutional analytics & reports
router.get('/reports', authorizeRoles('Administrator'), getDetailedReports);

export default router;
