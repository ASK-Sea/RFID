const express = require("express");
const router = express.Router();
const { connectMQTT, disconnectMQTT, isConnected } = require("./mqttManager");
const { isAutoMQTTConnected, stopAutoMQTT, restartAutoMQTT } = require("./mqtt");

let savedConfig = null;

router.post("/save", (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "No configuration data provided" });
  }
  
  savedConfig = req.body;
  console.log("MQTT config saved:", { 
    name: savedConfig.name,
    protocol: savedConfig.protocol,
    host: savedConfig.host,
    port: savedConfig.port,
    clientId: savedConfig.clientId,
    password: "***"
  });
  res.json({ success: true, message: "Configuration saved successfully" });
});

router.post("/connect", (req, res) => {
  if (!savedConfig) {
    return res.status(400).json({ error: "No MQTT config saved" });
  }
  
  const io = req.app.get("io");
  console.log("Connect request received with saved config:", savedConfig.host);
  
  // Stop auto connection first to prevent interference
  stopAutoMQTT(io);
  
  // Give a brief moment for auto connection to stop, then disconnect managed connection
  setTimeout(() => {
    disconnectMQTT(io);
    
    // Then connect with saved config
    setTimeout(() => {
      connectMQTT(savedConfig, io);
      res.json({ connected: true });
    }, 500);
  }, 300);
});

router.post("/disconnect", (req, res) => {
  const io = req.app.get("io");
  console.log("Disconnect request received");
  
  // Disconnect managed connection
  disconnectMQTT(io);
  
  // Disconnect auto connection to fully disconnect MQTT
  stopAutoMQTT(io);
  
  console.log("Both managed and auto MQTT disconnected");
  res.json({ connected: false });
});

router.get("/status", (req, res) => {
  // Prioritize managed connection status (from settings form)
  const managedConnected = isConnected();
  const connected = managedConnected;
  
  console.log("MQTT status check:", { 
    connected, 
    managedConnected,
    hasSavedConfig: !!savedConfig 
  });
  
  res.json({ connected: connected });
});

module.exports = router;
