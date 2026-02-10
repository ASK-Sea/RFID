require("dotenv").config(); // load .env
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const http = require("http");
const socketIO = require("socket.io");
const path = require("path");

const routes = require("./routes"); // adjust if your routes path is different

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: { origin: "*" }, // Allow all origins when packaged
});

// Store io instance for routes
app.set("io", io);

// Middleware
app.use(cors()); // Allow all origins when packaged
app.use(bodyParser.json());

// Serve static files from the built React frontend
const distPath = path.join(__dirname, "../rfid-dashboard/dist");
app.use(express.static(distPath));

// Mount all routes at /api
app.use("/api", routes);

// Serve index.html for all non-API routes (SPA fallback)
app.use((req, res, next) => {
  if (!req.path.startsWith("/api")) {
    res.sendFile(path.join(distPath, "index.html"));
  } else {
    next();
  }
});

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
