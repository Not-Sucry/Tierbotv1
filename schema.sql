-- Run this script once to set up your database
-- mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS pvp_ranks CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pvp_ranks;

-- Stores every rank assignment ever made (full audit log)
CREATE TABLE IF NOT EXISTS rank_history (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     VARCHAR(20)  NOT NULL,
  staff_id    VARCHAR(20)  NOT NULL,
  gamemode    VARCHAR(32)  NOT NULL,
  `rank`      VARCHAR(3)   NOT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK(`rank` IN ('D', 'D+', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+', 'S-', 'S', 'S+', 'S++')),
  INDEX idx_user_gamemode (user_id, gamemode),
  INDEX idx_created_at    (created_at)
) ENGINE=InnoDB;

-- Stores only the latest rank per user per gamemode
CREATE TABLE IF NOT EXISTS current_ranks (
  user_id     VARCHAR(20)  NOT NULL,
  gamemode    VARCHAR(32)  NOT NULL,
  `rank`      VARCHAR(3)   NOT NULL,
  staff_id    VARCHAR(20)  NOT NULL,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CHECK(`rank` IN ('D', 'D+', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+', 'S-', 'S', 'S+', 'S++')),
  PRIMARY KEY (user_id, gamemode)
) ENGINE=InnoDB;
