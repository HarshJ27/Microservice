// // src/services/socket.mjs
// import Notifications from '../models/Notifications.js';
// import amqp from 'amqplib/callback_api.js';


// const queue = 'notifications';

// export const setupSocket = (io) => {
//   io.on('connection', (socket) => {
//     console.log('a user connected');

//     socket.on('disconnect', () => {
//       console.log('user disconnected');
//     });
//   });

//   amqp.connect('amqp://localhost', (error0, connection) => {
//     if (error0) {
//       throw error0;
//     }
//     connection.createChannel((error1, channel) => {
//       if (error1) {
//         throw error1;
//       }
//       channel.assertQueue(queue, { durable: false });
//       channel.consume(queue, async (msg) => {
//         const notification = JSON.parse(msg.content.toString());
//         const userNotification = await Notifications.findById(notification._id).populate('userId');
//         if (userNotification.userId.connected) {
//           io.emit('notification', notification);
//         }
//       }, { noAck: true });
//     });
//   });
// };

import Users from "../models/Users.js";
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken'

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
      const user = await Users.findById(decoded.id);
      if (!user) {
        return next(new Error('User not found'));
      }
      
      user.connected = true;
      user.socketId = socket.id;
      await user.save();
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connect', (socket) => {
    console.log('a user connected:', socket.id);

    socket.on('authenticate', async (token) => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await Users.findById(decoded.id);
        if (user) {
          user.connected = true;
          user.socketId = socket.id;
          await user.save();
          console.log(`User ${user.userName} authenticated with socket ${socket.id}`);
        }
      } catch (error) {
        console.error('Authentication error:', error);
      }
    });

    socket.on('disconnect', async () => {
      try {
        const user = await Users.findOne({ socketId: socket.id });
        if (user) {
          user.connected = false;
          user.socketId = null;
          await user.save();
          console.log(`User ${user.userName} disconnected`);
        }
      } catch (error) {
        console.error('Disconnection error:', error);
      }
      console.log('user disconnected:', socket.id);
    });

    socket.on('send-notification', async ({ recipientId, notification }) => {
      try {
        const recipient = await Users.findById(recipientId);
        if (recipient && recipient.connected && recipient.socketId) {
          io.to(recipient.socketId).emit('notification', notification);
          console.log(`Notification sent from ${socket.id} to ${recipient.socketId}`);
        } else {
          console.log('Recipient not found or not connected');
        }
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    });
  });
};

export const sendNotification = async (notification) => {
  const user = await Users.findById(notification.userId);
  if (user && user.connected) {
    io.to(user.socketId).emit('notification', notification);
  }
};

