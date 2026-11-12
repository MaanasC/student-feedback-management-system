import express from 'express';
import {
  submitFeedback,
  getMySubmissions,
  getResponsesByForm,
  getAllResponses,
  getResponseById,
} from '../controllers/response.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { validateFeedbackResponse } from '../middleware/validate.middleware.js';

const router = express.Router();

router.use(authenticateToken);

// Students submit feedback with validation and view their own submissions
router.post('/', authorizeRoles('Student'), validateFeedbackResponse, submitFeedback);
router.get('/my', authorizeRoles('Student'), getMySubmissions);

// Administrator gets all submissions
router.get('/', authorizeRoles('Administrator'), getAllResponses);

// Faculty and Admins can view responses per form or single response by ID
router.get('/form/:formId', authorizeRoles('Faculty', 'Administrator'), getResponsesByForm);
router.get('/:id', authorizeRoles('Faculty', 'Administrator'), getResponseById);

export default router;
