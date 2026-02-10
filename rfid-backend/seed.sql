-- SQL seed for rfid_db
-- Usage: open in MySQL Workbench and run, or from shell: mysql -u root -p < seed.sql

CREATE DATABASE IF NOT EXISTS `rfid_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `rfid_db`;

-- tag_info table
CREATE TABLE IF NOT EXISTS `tag_info` (
  `epc` VARCHAR(255) NOT NULL,
  `tag_name` VARCHAR(255) NOT NULL,
  `purpose` TEXT,
  `position` VARCHAR(255),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`epc`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- epc_stats table
CREATE TABLE IF NOT EXISTS `epc_stats` (
  `epc` VARCHAR(255) NOT NULL,
  `scan_count` INT DEFAULT 0,
  `last_seen` DATETIME,
  PRIMARY KEY (`epc`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- scans table
CREATE TABLE IF NOT EXISTS `scans` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `epc` VARCHAR(255) NOT NULL,
  `read_time` DATETIME NOT NULL,
  `tid` VARCHAR(255),
  `rssi` VARCHAR(50),
  `antId` VARCHAR(50),
  `device` VARCHAR(255),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sample tag entries
INSERT INTO `tag_info` (`epc`, `tag_name`, `purpose`, `position`) VALUES
  ('EPC-001','Front Door Key','Access','Entrance'),
  ('EPC-002','Visitor Badge','Temporary','Lobby'),
  ('EPC-003','Asset Tag - Laptop','Asset','Office')
ON DUPLICATE KEY UPDATE tag_name=VALUES(tag_name), purpose=VALUES(purpose), position=VALUES(position);

-- Sample epc_stats
INSERT INTO `epc_stats` (`epc`, `scan_count`, `last_seen`) VALUES
  ('EPC-001', 12, NOW()),
  ('EPC-002', 5, NOW()),
  ('EPC-003', 3, NOW())
ON DUPLICATE KEY UPDATE scan_count=VALUES(scan_count), last_seen=VALUES(last_seen);

-- Sample scans
INSERT INTO `scans` (`epc`, `read_time`, `tid`, `rssi`, `antId`, `device`) VALUES
  ('EPC-001', DATE_SUB(NOW(), INTERVAL 5 MINUTE), NULL, NULL, NULL, NULL),
  ('EPC-002', DATE_SUB(NOW(), INTERVAL 3 MINUTE), NULL, NULL, NULL, NULL),
  ('EPC-001', DATE_SUB(NOW(), INTERVAL 30 SECOND), NULL, NULL, NULL, NULL),
  ('EPC-003', NOW(), NULL, NULL, NULL, NULL);

-- Verify
SELECT 'seed_complete' AS status;
