import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
} from '../controllers/user.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';

const router = express.Router();

// All user management routes require Administrator role
router.use(authenticateToken);
router.use(authorizeRoles('Administrator'));

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.patch('/:id/toggle-status', toggleUserStatus);
router.delete('/:id', deleteUser);

export default router;
