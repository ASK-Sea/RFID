const mqtt = require('mqtt');
const db = require('./db');

function startMQTT(io) {
  const client = mqtt.connect(process.env.MQTT_HOST);

  client.on('connect', () => {
    console.log('MQTT connected');
    client.subscribe(process.env.MQTT_TOPIC);
  });

  client.on('message', async (topic, message) => {
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
          // Only emit if tag exists in database
          if (results && results.length > 0 && results[0]?.tag_name) {
            const tag_name = results[0].tag_name;

            // Emit MQTT data directly to connected clients
            io.emit('mqtt-data', {
              epc: epc,
              tag_name: tag_name,
              read_time: read_time,
              timestamp: new Date().toISOString()
            });

            console.log("Emitted to clients:", { epc, tag_name, read_time });
          } else {
            console.log("EPC not found in tag_info, skipping emission:", epc);
          }
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
}

module.exports = startMQTT;
