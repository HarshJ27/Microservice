// src/controllers/notification.mjs
import Notifications from '../models/Notifications.js';
// import User from '../models/user.mjs';
import { sendToQueue } from '../services/messageQueue.js';
import { sendNotification } from '../services/socket.js';

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notifications API
 */

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Create a new notification for a user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Notification created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */

export const createNotification = async (req, res) => {
  const { userId, message } = req.body;
  try {
    const notification = new Notifications({ userId, message });
    await notification.save();
    sendToQueue(notification);
    await sendNotification(notification)
    res.status(201).json({notification: notification});
  } catch (err) {
    res.status(400).send(err.message);
  }
};

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get a list of all notifications for the authenticated user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 *       401:
 *         description: Unauthorized
 */

export const getNotifications = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const notifications = await Notifications.find({ userId: req.user.id })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    const count = await Notifications.countDocuments({ userId: req.user.id });
    res.json({ notifications, totalPages: Math.ceil(count / limit), currentPage: page });
  } catch (err) {
    res.status(400).send(err.message);
  }
};

/**
 * @swagger
 * /api/notifications/{id}:
 *   get:
 *     summary: Get details of a specific notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 */

export const getNotificationById = async (req, res) => {
  try {
    const notification = await Notifications.findById(req.params.id);
    if (!notification) {
      return res.status(404).send('Notification not found');
    }
    res.json(notification);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

/**
 * @swagger
 * /api/notifications/{id}:
 *   put:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 */

export const markAsRead = async (req, res) => {
  try {
    const notification = await Notifications.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!notification) {
      return res.status(404).send('Notification not found');
    }
    res.json(notification);
  } catch (err) {
    res.status(400).send(err.message);
  }
};
