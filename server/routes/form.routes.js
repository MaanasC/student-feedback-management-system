import express from 'express';
import {
  getAllForms,
  getFormById,
  createForm,
  updateForm,
  toggleFormStatus,
  deleteForm,
} from '../controllers/form.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { validateFeedbackForm } from '../middleware/validate.middleware.js';

const router = express.Router();

router.use(authenticateToken);

// All authenticated roles can list and view forms
router.get('/', getAllForms);
router.get('/:id', getFormById);

// Admin-only management with validation
router.post('/', authorizeRoles('Administrator'), validateFeedbackForm, createForm);
router.put('/:id', authorizeRoles('Administrator'), updateForm);
router.patch('/:id/toggle-status', authorizeRoles('Administrator'), toggleFormStatus);
router.delete('/:id', authorizeRoles('Administrator'), deleteForm);

export default router;
