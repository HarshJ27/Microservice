import { io } from 'socket.io-client';
import fetch from 'node-fetch';

// Function to get JWT token
async function getToken() {
  const response = await fetch('http://localhost:5002/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'six@testing',
      password: 'user1234'
    })
  });

  const data = await response.json();
  return data.token;
}

// Main function to connect to Socket.IO and listen for notifications
async function main() {
  const token = await getToken();
  
  // Connect to Socket.IO server
  const socket = io('http://localhost:5002', {
    auth: {
      token: `Bearer ${token}`
    }
  });

  socket.on('connect', () => {
    console.log('Connected to the server');
    socket.emit('authenticate', token);
  });

  socket.on('notification', (notification) => {
    console.log('Received notification:', notification);
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from the server');
  });

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
  });
}

main();
