const mqtt = require("mqtt");
const db = require('./db');

let client = null;
let currentConfig = null;
let isConnectedFlag = false;

function connectMQTT(config, io) {
  // If trying to connect to different host/port, disconnect the old client first
  if (client) {
    const oldUrl = `${currentConfig?.protocol}${currentConfig?.host}:${currentConfig?.port}`;
    const newUrl = `${config.protocol}${config.host}:${config.port}`;
    
    if (oldUrl !== newUrl) {
      console.log("Host/port changed, disconnecting old client:", oldUrl);
      client.end(true, () => {
        client = null;
        isConnectedFlag = false;
        // Recursively call to connect with new config
        connectMQTT(config, io);
      });
      return;
    }
    
    // If already connecting to same host, return
    if (isConnectedFlag) {
      console.log("MQTT already connected to this host");
      return;
    }
  }

  currentConfig = config;
  const url = `${config.protocol}${config.host}:${config.port}`;
  console.log("Attempting to connect to MQTT:", url);

  client = mqtt.connect(url, {
    clientId: config.clientId,
    username: config.username || undefined,
    password: config.password || undefined,
    reconnectPeriod: 5000,
    connectTimeout: 10000,
  });

  client.on("connect", () => {
    console.log("MQTT connected successfully");
    isConnectedFlag = true;
    if (io) {
      io.emit("mqtt-status", { connected: true });
    }
    client.subscribe(config.topic || "#");
    console.log("Subscribed to topic:", config.topic || "#");
  });

  client.on("message", async (topic, message) => {
    try {
      const data = JSON.parse(message.toString());
      const epc = data.EPC;
      const read_time = data.Time;

      if (!epc || !read_time) {
        console.error("Invalid payload:", data);
        return;
      }

      console.log("Received EPC:", epc, "read_time:", read_time);

      // Query tag_info to get tag_name
      db.query(
        "SELECT tag_name FROM tag_info WHERE epc = ?",
        [epc],
        (err, results) => {
          // Use tag_name if found, otherwise use EPC as fallback
          const tag_name = (results && results.length > 0 && results[0]?.tag_name) ? results[0].tag_name : epc;

          // Emit MQTT data to connected clients (always emit, regardless of DB match)
          if (io) {
            io.emit('mqtt-data', {
              epc: epc,
              tag_name: tag_name,
              read_time: read_time,
              timestamp: new Date().toISOString()
            });
          }

          console.log("Emitted to clients:", { epc, tag_name, read_time });
        }
      );

      // Update EPC statistics in `epc_stats`
      db.query(
        `INSERT INTO epc_stats (epc, scan_count, last_seen)
         VALUES (?, 1, NOW())
         ON DUPLICATE KEY UPDATE
            scan_count = scan_count + 1,
            last_seen = NOW();`,
        [epc],
        (err) => {
          if (err) console.error("DB Update Error (epc_stats):", err);
          else console.log("Updated epc_stats:", epc);
        }
      );

    } catch (error) {
      console.error("JSON Parse Error:", error.message);
      console.error("Raw message:", message.toString());
    }
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
    console.log("Closing MQTT client...");
    client.end(true, () => {
      console.log("MQTT disconnected and cleaned up");
      isConnectedFlag = false;
      client = null;
      currentConfig = null;
      if (io) {
        io.emit("mqtt-status", { connected: false });
      }
    });
  } else {
    isConnectedFlag = false;
    console.log("No MQTT client to disconnect");
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