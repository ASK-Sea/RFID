require('dotenv').config();
const db = require('./db');

function q(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
}

async function createTables() {
  await q(`
    CREATE TABLE IF NOT EXISTS tag_info (
      epc VARCHAR(255) PRIMARY KEY,
      tag_name VARCHAR(255) NOT NULL,
      purpose TEXT,
      position VARCHAR(255),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await q(`
    CREATE TABLE IF NOT EXISTS epc_stats (
      epc VARCHAR(255) PRIMARY KEY,
      scan_count INT DEFAULT 0,
      last_seen DATETIME
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await q(`
    CREATE TABLE IF NOT EXISTS scans (
      id INT AUTO_INCREMENT PRIMARY KEY,
      epc VARCHAR(255) NOT NULL,
      read_time DATETIME NOT NULL,
      tid VARCHAR(255),
      rssi VARCHAR(50),
      antId VARCHAR(50),
      device VARCHAR(255),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

async function insertSamples() {
  const tags = [
    { epc: 'EPC-001', tag_name: 'Front Door Key', purpose: 'Access', position: 'Entrance' },
    { epc: 'EPC-002', tag_name: 'Visitor Badge', purpose: 'Temporary', position: 'Lobby' },
    { epc: 'EPC-003', tag_name: 'Asset Tag - Laptop', purpose: 'Asset', position: 'Office' },
  ];

  for (const t of tags) {
    await q(
      `INSERT INTO tag_info (epc, tag_name, purpose, position) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE tag_name=VALUES(tag_name), purpose=VALUES(purpose), position=VALUES(position)`,
      [t.epc, t.tag_name, t.purpose, t.position]
    );

    await q(
      `INSERT INTO epc_stats (epc, scan_count, last_seen) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE scan_count=VALUES(scan_count), last_seen=VALUES(last_seen)`,
      [t.epc, Math.floor(Math.random() * 20) + 1, new Date()]
    );
  }

  const now = new Date();
  const scans = [
    { epc: 'EPC-001', read_time: new Date(now.getTime() - 1000 * 60 * 5) },
    { epc: 'EPC-002', read_time: new Date(now.getTime() - 1000 * 60 * 3) },
    { epc: 'EPC-001', read_time: new Date(now.getTime() - 1000 * 30) },
    { epc: 'EPC-003', read_time: new Date() },
  ];

  for (const s of scans) {
    await q(`INSERT INTO scans (epc, read_time) VALUES (?, ?)`,[s.epc, s.read_time]);
  }
}

async function wipeAll() {
  await q('DROP TABLE IF EXISTS scans');
  await q('DROP TABLE IF EXISTS epc_stats');
  await q('DROP TABLE IF EXISTS tag_info');
}

async function main() {
  try {
    const args = process.argv.slice(2);
    const wipe = args.includes('--wipe') || args.includes('-w');

    if (wipe) {
      console.log('Wiping existing tables...');
      await wipeAll();
    }

    console.log('Creating tables...');
    await createTables();

    console.log('Inserting sample data...');
    await insertSamples();

    console.log('Seed complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
