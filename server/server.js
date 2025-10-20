import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import http from 'http';
import { connectDB } from './lib/db.js';
import cors from 'cors';
import messageRouter from './routes/messageRoute.js';
import userRouter from './routes/userRoute.js';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
// Middleware
// ✅ Enable CORS
app.use(cors({
  origin: "http://localhost:5173",  // your frontend port
  credentials: true
}));

// ✅ Body size limits
app.use(express.json({ limit: "10mb" })); // For large base64 images
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Initialize socket.io server
export const io = new Server(server, {
  cors: { origin: "*" }
});

// Store online users
export const userSocketMap = {}; // {userId: socketId}

// Connection handler
io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  console.log('User connected', userId);

  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on('disconnect', () => {
    console.log('User disconnected', userId);
    delete userSocketMap[userId];
    io.emit('getOnlineUsers', Object.keys(userSocketMap));
  });
});


// DB connection
await connectDB();
console.log("✅ Database connected successfully");

// Routes
app.get('/api/status', (req, res) => {
  res.send('API Working successfully');
});

// Routers
app.use('/api/auth', userRouter);
app.use('/api/messages', messageRouter);

server.listen(3000, () => {
  console.log(`🚀 Server is running on port 3000`);
});
