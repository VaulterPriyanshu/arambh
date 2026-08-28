const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Pass io to routes/services if needed by attaching to req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/screenings', require('./routes/screeningRoutes'));
app.use('/api/mood', require('./routes/moodRoutes'));
app.use('/api/routines', require('./routes/routineRoutes'));
app.use('/api/wellness', require('./routes/wellnessRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

const PORT = process.env.PORT || 5000;

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  
  // Optionally, clients can emit an event to register their user ID
  socket.on('register', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} registered to socket ${socket.id}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Start background services
const notificationService = require('./services/notificationService');
// Pass the io instance to the notification service
notificationService.init(io);
notificationService.start();

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} with Supabase + Socket.io`);
});
