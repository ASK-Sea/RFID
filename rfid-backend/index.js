require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const open = require('open');
const routes = require('./routes');
const startMQTT = require('./mqtt');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store io instance for use in routes
app.set('io', io);

app.use(cors());
app.use(express.json());

// Serve static files from the built React frontend
const distPath = path.join(__dirname, "../rfid-dashboard/dist");
app.use(express.static(distPath));

// Attach API routes
app.use('/api', routes);

// Serve index.html for all non-API routes (SPA fallback)
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// MQTT connection is now controlled only by the Settings form
// startMQTT is no longer auto-started to avoid conflicts with managed connection

// Start express server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`Server running on ${url}`);
  
  // Auto-launch the dashboard in the default browser
  open(url).catch(err => {
    console.warn(`Could not auto-launch browser: ${err.message}`);
  });
});