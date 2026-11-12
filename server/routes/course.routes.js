import express from 'express';
import {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../controllers/course.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { validateCourse } from '../middleware/validate.middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getAllCourses);
router.get('/:id', getCourseById);

// Admin-only mutations with validation
router.post('/', authorizeRoles('Administrator'), validateCourse, createCourse);
router.put('/:id', authorizeRoles('Administrator'), updateCourse);
router.delete('/:id', authorizeRoles('Administrator'), deleteCourse);

export default router;
