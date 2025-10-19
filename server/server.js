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

app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
