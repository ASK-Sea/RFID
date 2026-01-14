const mqtt = require('mqtt');
const db = require('./db');

function startMQTT() {
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

      // 1️⃣ Insert raw scan into `scans`
      db.query(
        "INSERT INTO scans (epc, read_time) VALUES (?, ?)",
        [epc, read_time],
        (err) => {
          if (err) console.error("DB Insert Error (scans):", err);
          else console.log("Inserted into scans:", epc);
        }
      );

      // 2️⃣ Update EPC statistics in `epc_stats`
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
