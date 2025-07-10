const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIO = require('socket.io');
require('dotenv').config();

const connectToMongo = require('./config/db');

const allowedOrigins = ['https://macrology-ponx.vercel.app','http://localhost:5173']

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

app.use('/api/user', require('./routes/userPage'));
app.use('/api/chats', require('./routes/chatPage'));
app.use('/api/message', require('./routes/messagePage'));

const server = http.createServer(app);

const io = socketIO(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {

  // Setup user-specific room for private events
  socket.on('setup', (userData) => {
    socket.join(userData._id);
    socket.emit('connected');
  });

  // Join a chat room for group messages
  socket.on('join chat', (room) => {
    socket.join(room);
  });

  // New message handler: broadcast to all users in the chat room except sender
  socket.on('new message', (newMessage) => {
    const chat = newMessage.chat;

    if (!chat._id) return;

    // Emit to all in the chat room except sender
    socket.to(chat._id).emit('message received', newMessage);
  });

  // Optional typing indicators
  socket.on('typing', (room) => socket.in(room).emit('typing'));
  socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));

  socket.on('disconnect', () => {
    // console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectToMongo();
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
