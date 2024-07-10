import express from 'express';
import authenicateJWT from '../middlewares/authenticateJWT.js';
import { createNotification, getNotificationById, getNotifications, markAsRead } from '../controllers/notification.js';

const router = express.Router();

router.post('/notifications', authenicateJWT, createNotification);
router.get('/notifications', authenicateJWT, getNotifications);
router.get('/notifications/:id', authenicateJWT, getNotificationById);
router.put('/notifications/:id', authenicateJWT, markAsRead);

export default router;