const express = require("express");
const router = express.Router();
const { connectMQTT, disconnectMQTT, isConnected } = require("./mqttManager");
const { isAutoMQTTConnected } = require("./mqtt");

let savedConfig = null;

router.post("/save", (req, res) => {
  savedConfig = req.body;
  console.log("MQTT config saved:", { 
    name: savedConfig.name,
    protocol: savedConfig.protocol,
    host: savedConfig.host,
    port: savedConfig.port,
    clientId: savedConfig.clientId,
    password: "***"
  });
  res.json({ success: true });
});

router.post("/connect", (req, res) => {
  if (!savedConfig) {
    return res.status(400).json({ error: "No MQTT config saved" });
  }
  connectMQTT(savedConfig, req.app.get("io"));
  res.json({ connected: true });
});

router.post("/disconnect", (req, res) => {
  disconnectMQTT(req.app.get("io"));
  res.json({ connected: false });
});

router.get("/status", (req, res) => {
  // Check both the managed connection and the automatic connection
  const managedConnected = isConnected();
  const autoConnected = isAutoMQTTConnected();
  const connected = managedConnected || autoConnected;
  
  console.log("MQTT status check:", { 
    connected, 
    managedConnected,
    autoConnected,
    hasSavedConfig: !!savedConfig 
  });
  
  res.json({ connected: connected });
});

module.exports = router;
