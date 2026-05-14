const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
require('dotenv').config();

const { sequelize } = require('./models');
const { Server } = require('socket.io');
const chatSocket = require('./sockets/chatSocket');
require('./jobs/archiveJob'); // Start the cron job

const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from 'public' and 'views'
app.use(express.static(path.join(__dirname, 'public')));

// Set up routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ai', aiRoutes);

// View routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views/index.html')));
app.get('/chat', (req, res) => res.sendFile(path.join(__dirname, 'views/chat.html')));

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

chatSocket(io);

// Sync Database and Start Server
sequelize.sync({ force: false }) // Use alter for development
  .then(() => {
    console.log('Database synced');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to sync database:', err);
  });
