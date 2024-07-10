// src/services/messageQueue.mjs
import amqp from 'amqplib/callback_api.js';

const queue = 'notifications';
const maxRetries = 5;

export const sendToQueue = (message, retries = 0) => {
  amqp.connect('amqp://localhost', (error0, connection) => {
    if (error0) {
      throw error0;
    }
    connection.createChannel((error1, channel) => {
      if (error1) {
        throw error1;
      }
      channel.assertQueue(queue, { durable: false });
      channel.sendToQueue(queue, Buffer.from(JSON.stringify({ message, retries })));
      console.log(" [x] Sent %s", message);
    });

    setTimeout(() => {
      connection.close();
    }, 500);
  });
};

export const processMessage = async (msg) => {
  const { message, retries } = JSON.parse(msg.content.toString());
  try {
    // Process the message
  } catch (error) {
    if (retries < maxRetries) {
      setTimeout(() => sendToQueue(message, retries + 1), Math.pow(2, retries) * 1000);
    } else {
      // Optionally move to Dead Letter Queue (DLQ)
    }
  }
};
