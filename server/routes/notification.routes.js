import express from 'express';
import {
  getMyNotifications,
  getNotificationById,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../controllers/notification.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getMyNotifications);
router.get('/:id', getNotificationById);
router.patch('/read-all', markAllNotificationsAsRead);
router.patch('/:id/read', markNotificationAsRead);
router.delete('/:id', deleteNotification);

export default router;
