import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './src/routes/auth.js';
import notificationRoutes from './src/routes/notification.js';
import { initializeSocket } from './src/services/socket.js';
import { Server } from 'socket.io';
import swaggerConfig from './src/swagger.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());

swaggerConfig(app);

// Attach io to req
// app.use((req, res, next) => {
//     req.io = io;
//     next();
//   });



// Database connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

  console.log("Start hua");
  initializeSocket(server);
  console.log("Khtm hua");

  // Routes
  app.use('/api', authRoutes);
  app.use('/api', notificationRoutes);

server.listen(process.env.PORT, () => {
    console.log(`Server is running on port: ${process.env.PORT}`);
});