const mqtt = require("mqtt");

let client = null;
let currentConfig = null;
let isConnectedFlag = false;

function connectMQTT(config, io) {
  if (client) {
    console.log("MQTT already connected or connecting");
    return;
  }

  currentConfig = config;
  const url = `${config.protocol}${config.host}:${config.port}`;
  console.log("Attempting to connect to MQTT:", url);

  client = mqtt.connect(url, {
    clientId: config.clientId,
    username: config.username,
    password: config.password,
    reconnectPeriod: 5000,
  });

  client.on("connect", () => {
    console.log("MQTT connected successfully");
    isConnectedFlag = true;
    if (io) {
      io.emit("mqtt-status", { connected: true });
    }
    client.subscribe(config.topic || "#");
  });

  client.on("close", () => {
    console.log("MQTT disconnected");
    isConnectedFlag = false;
    if (io) {
      io.emit("mqtt-status", { connected: false });
    }
  });

  client.on("error", err => {
    console.error("MQTT error:", err.message);
    isConnectedFlag = false;
    if (io) {
      io.emit("mqtt-status", { connected: false });
    }
  });

  return client;
}

function disconnectMQTT(io) {
  if (client) {
    client.end(true, () => {
      console.log("MQTT disconnected");
      isConnectedFlag = false;
      if (io) {
        io.emit("mqtt-status", { connected: false });
      }
      client = null;
    });
  }
}

function isConnected() {
  // Check if our managed client is connected
  if (client && isConnectedFlag && client.connected) {
    return true;
  }
  
  // If not, return the flag status
  return isConnectedFlag;
}

function getClient() {
  return client;
}

module.exports = {
  connectMQTT,
  disconnectMQTT,
  isConnected,
  getClient,
};