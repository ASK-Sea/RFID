const express = require("express");
const router = express.Router();
const db = require("./db");

//
// 1️⃣ Fetch ALL scan history (raw scans)
// GET /api/scans
//
router.get("/scans", (req, res) => {
  const sql = `
   SELECT 
      s.epc,
      s.read_time,
      COALESCE(t.tag_name, 'N/A') AS display_name,
      COALESCE(t.purpose, '') AS purpose
    FROM scans s
    LEFT JOIN tag_info t ON s.epc = t.epc
    ORDER BY s.read_time DESC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching scans:", err);
      return res.status(500).json({ error: "Failed to fetch scans" });
    }
    res.json(results);
  });
});

//
// 2️⃣ Fetch EPC statistics
// GET /api/stats
//
router.get("/stats", (req, res) => {
  const sql = `
    SELECT 
      epc,
      scan_count,
      last_seen
    FROM epc_stats
    ORDER BY last_seen DESC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching stats:", err);
      return res.status(500).json({ error: "Failed to fetch stats" });
    }
    res.json(results);
  });
});

//
// 3️⃣ Fetch TOP EPC by scan_count
// GET /api/top-epc
//
router.get("/top-epc", (req, res) => {
  const sql = `
    SELECT 
      e.epc,
      e.scan_count,
      COALESCE(t.tag_name, 'N/A') AS display_name,
      COALESCE(t.purpose, 'N/A') AS display_name
    FROM epc_stats e
    LEFT JOIN tag_info t ON e.epc = t.epc
    ORDER BY e.scan_count DESC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching top EPC:", err);
      return res.status(500).json({ error: "Failed to fetch top EPC" });
    }
    res.json(results);
  });
});

//
// 4️⃣ Fetch ALL tag list data
// GET /api/tags
//
router.get("/tags", (req, res) => {
  const sql = `
    SELECT
      t.epc,
      t.tag_name,
      t.purpose,
      t.position,
      e.last_seen
    FROM tag_info t
    LEFT JOIN epc_stats e ON t.epc = e.epc
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Failed to fetch tags:", err);
      return res.status(500).json({ error: "Failed to fetch tags" });
    }
    res.json(results);
  });
});

//
// 5️⃣ Create or update a tag
// POST /api/tags
//
router.post("/tags", (req, res) => {
  const { epc, tag_name, position, purpose } = req.body;

  if (!epc || !tag_name) {
    return res.status(400).json({ error: "EPC and tag_name required" });
  }

  const tagInfoSql = `
    INSERT INTO tag_info (epc, tag_name, purpose, position)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      tag_name = VALUES(tag_name),
      purpose = VALUES(purpose),
      position = VALUES(position)
  `;
  const epcStatsSql = `
    INSERT INTO epc_stats (epc, scan_count, last_seen)
    VALUES (?, 0, NOW())
    ON DUPLICATE KEY UPDATE
      scan_count = scan_count,
      last_seen = last_seen
  `;

  db.query(tagInfoSql, [epc, tag_name, purpose, position], (err) => {
    if (err) {
      console.error("Failed to save tag_info:", err);
      return res.status(500).json({ error: "Failed to save tag" });
    }

    db.query(epcStatsSql, [epc], (err2, result) => {
      if (err2) {
        console.error("Failed to save epc_stats:", err2);
        return res.status(500).json({ error: "Failed to save EPC stats" });
      }
      console.log("✓ Saved epc_stats for EPC:", epc, "| Affected rows:", result.affectedRows);
      res.json({ message: "Tag saved successfully" });
    });
  });
});

//
// 6️⃣ Delete a tag
// DELETE /api/tags/:epcF
//
router.delete("/tags/:epc", (req, res) => {
  const { epc } = req.params;

  if (!epc) {
    return res.status(400).json({ error: "EPC is required" });
  }

  db.query("DELETE FROM tag_info WHERE epc = ?", [epc], (err) => {
    if (err) {
      console.error("Error deleting tag_info:", err);
      return res.status(500).json({ error: "Failed to delete tag" });
    }

    res.json({ message: "Tag deleted successfully", deletedEpc: epc });
  });
});


// MQTT Routes
const mqttControl = require("./mqttControl");
router.use("/mqtt", mqttControl);

module.exports = router;
