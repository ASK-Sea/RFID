const mqtt = require("mqtt");
const db = require("./db");

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
      const payload = JSON.parse(message.toString());
      
      // Extract data from the new nested structure
      const data = payload.data || payload;
      const epc = data.EPC;
      const read_time = data.ReadTime || data.Time;

      if (!epc || !read_time) {
        console.error("Invalid payload:", payload);
        return;
      }

      db.query(
        "SELECT tag_name, purpose, position FROM tag_info WHERE epc = ?",
        [epc],
        (err, results) => {
          let tag_name = "N/A";
          let purpose = "";
          let position = "";
          if (results && results.length > 0) {
            tag_name = results[0]?.tag_name || "N/A";
            purpose = results[0]?.purpose || "";
            position = results[0]?.position || "";
          }

          // Emit MQTT data to connected clients
          if (io) {
            io.emit("mqtt-data", {
              epc: epc,
              tag_name: tag_name,
              purpose: purpose,
              position: position,
              read_time: read_time,
              timestamp: new Date().toISOString(),
              // New fields from the enhanced payload
              tid: data.TID || "N/A",
              rssi: data.RSSI || "N/A",
              antId: data.AntId || "N/A",
              mac: data.MAC || "N/A",
              device: data.Device || "N/A",
              readType: data.ReadType || "N/A",
              ip: data.IP || "N/A",
              netMsg: data.NetMsg || "N/A",
            });
          }

          console.log("Emitted to clients:", { epc, tag_name, purpose, read_time });
        },
      );
      // Only update epc_stats if EPC already exists (don't insert new)
      db.query(
        `UPDATE epc_stats 
         SET scan_count = scan_count + 1, last_seen = NOW()
         WHERE epc = ?;`,
        [epc],
        (err, result) => {
          if (err) {
            console.error("DB Update Error (epc_stats):", err);
          } else {
            if (result.affectedRows > 0) {
              console.log("✓ Updated epc_stats for EPC:", epc);
              console.log("  Affected rows:", result.affectedRows);
              // Query to verify the current count
              db.query(
                "SELECT scan_count FROM epc_stats WHERE epc = ?",
                [epc],
                (err2, rows) => {
                  if (!err2 && rows && rows.length > 0) {
                    console.log("  Current count in DB:", rows[0].scan_count);
                  }
                }
              );
            } else {
              console.log("⚠ EPC not registered in database:", epc);
            }
          }
        },
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

  client.on("error", (err) => {
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
