import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
} from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validateRegister, validateLogin } from '../middleware/validate.middleware.js';

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.put('/change-password', authenticateToken, changePassword);

export default router;
