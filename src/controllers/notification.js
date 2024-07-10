// src/controllers/notification.mjs
import Notifications from '../models/Notifications.js';
// import User from '../models/user.mjs';
import { sendToQueue } from '../services/messageQueue.js';
import { sendNotification } from '../services/socket.js';

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
