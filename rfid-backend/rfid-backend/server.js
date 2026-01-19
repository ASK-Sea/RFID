require("dotenv").config(); // load .env
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const http = require("http");
const socketIO = require("socket.io");

const routes = require("./routes"); // adjust if your routes path is different

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: { origin: "http://localhost:5173" },
});

// Store io instance for routes
app.set("io", io);

// Middleware
app.use(cors({ origin: "http://localhost:5173" })); // frontend port
app.use(bodyParser.json());

// Mount all routes at /api
app.use("/api", routes);

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
