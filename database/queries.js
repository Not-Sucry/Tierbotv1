const { getDb, saveDatabase } = require('./connection');

/**
 * Insert a new row into rank_history.
 */
function logRankHistory({ userId, staffId, gamemode, rank }) {
  const db = getDb();
  db.run(
    `INSERT INTO rank_history (user_id, staff_id, gamemode, \`rank\`)
     VALUES (?, ?, ?, ?)`,
    [userId, staffId, gamemode, rank]
  );
  saveDatabase();
}

/**
 * Upsert the current rank for a user+gamemode.
 */
function upsertCurrentRank({ userId, staffId, gamemode, rank }) {
  const db = getDb();
  db.run(
    `INSERT INTO current_ranks (user_id, gamemode, \`rank\`, staff_id)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(user_id, gamemode) DO UPDATE SET 
       \`rank\` = excluded.\`rank\`, 
       staff_id = excluded.staff_id,
       updated_at = CURRENT_TIMESTAMP`,
    [userId, gamemode, rank, staffId]
  );
  saveDatabase();
}

/**
 * Fetch all current ranks for a given user.
 * Returns an array of { gamemode, rank, updated_at } rows.
 */
function getUserRanks(userId) {
  const db = getDb();
  const stmt = db.prepare(
    `SELECT gamemode, \`rank\`, updated_at
     FROM current_ranks
     WHERE user_id = ?
     ORDER BY gamemode ASC`
  );
  stmt.bind([userId]);
  
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

/**
 * Remove a user's rank for a specific gamemode.
 * Returns true if a row was deleted.
 */
function removeRank(userId, gamemode) {
  const db = getDb();
  const stmt = db.prepare(
    `DELETE FROM current_ranks WHERE user_id = ? AND gamemode = ?`
  );
  stmt.bind([userId, gamemode]);
  stmt.step();
  const changes = db.getRowsModified();
  stmt.free();
  saveDatabase();
  return changes > 0;
}

/**
 * Fetch leaderboard with detailed rank info per player.
 * Returns top 10 players with their ranks for each gamemode.
 */
function getDetailedLeaderboard() {
  const db = getDb();
  
  // First get top 10 players by points
  const topStmt = db.prepare(
    `SELECT
       user_id,
       SUM(CASE \`rank\` 
           WHEN 'S++' THEN 8 WHEN 'S+' THEN 7.5 WHEN 'S' THEN 7 WHEN 'S-' THEN 6.5
           WHEN 'A+' THEN 6 WHEN 'A' THEN 5.5 WHEN 'A-' THEN 5
           WHEN 'B+' THEN 4.5 WHEN 'B' THEN 4 WHEN 'B-' THEN 3.5
           WHEN 'C+' THEN 3 WHEN 'C' THEN 2.5 WHEN 'C-' THEN 2
           WHEN 'D+' THEN 1.5 WHEN 'D' THEN 1 ELSE 0 END) AS points,
       COUNT(*) AS gamemodes_ranked
     FROM current_ranks
     GROUP BY user_id
     ORDER BY points DESC, gamemodes_ranked DESC
     LIMIT 10`
  );
  
  const topPlayers = [];
  while (topStmt.step()) {
    topPlayers.push(topStmt.getAsObject());
  }
  topStmt.free();
  
  // For each player, get their ranks
  const rankStmt = db.prepare(
    `SELECT gamemode, \`rank\`
     FROM current_ranks
     WHERE user_id = ?
     ORDER BY gamemode ASC`
  );
  
  const result = topPlayers.map(player => {
    rankStmt.bind([player.user_id]);
    const ranks = [];
    while (rankStmt.step()) {
      ranks.push(rankStmt.getAsObject());
    }
    rankStmt.reset();
    return { ...player, ranks };
  });
  
  rankStmt.free();
  return result;
}

/**
 * Fetch the leaderboard: top 10 players by total rank points.
 * S=4, A=3, B=2, C=1 — summed across all gamemodes.
 */
function getLeaderboard() {
  const db = getDb();
  const stmt = db.prepare(
    `SELECT
       user_id,
       SUM(CASE \`rank\` 
           WHEN 'S++' THEN 8 WHEN 'S+' THEN 7.5 WHEN 'S' THEN 7 WHEN 'S-' THEN 6.5
           WHEN 'A+' THEN 6 WHEN 'A' THEN 5.5 WHEN 'A-' THEN 5
           WHEN 'B+' THEN 4.5 WHEN 'B' THEN 4 WHEN 'B-' THEN 3.5
           WHEN 'C+' THEN 3 WHEN 'C' THEN 2.5 WHEN 'C-' THEN 2
           WHEN 'D+' THEN 1.5 WHEN 'D' THEN 1 ELSE 0 END) AS points,
       COUNT(*) AS gamemodes_ranked
     FROM current_ranks
     GROUP BY user_id
     ORDER BY points DESC, gamemodes_ranked DESC
     LIMIT 10`
  );
  
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

/**
 * Full rank history for a user (newest first, last 20 entries).
 */
function getUserHistory(userId) {
  const db = getDb();
  const stmt = db.prepare(
    `SELECT gamemode, \`rank\`, staff_id, created_at
     FROM rank_history
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT 20`
  );
  stmt.bind([userId]);
  
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

/**
 * Log a test record for a tester.
 */
function logTest({ testerId, testedUserId, gamemode, result }) {
  const db = getDb();
  db.run(
    `INSERT INTO tester_stats (tester_id, tested_user_id, gamemode, result)
     VALUES (?, ?, ?, ?)`,
    [testerId, testedUserId, gamemode, result]
  );
  saveDatabase();
}

/**
 * Get statistics for a tester (total tested, passed, failed).
 */
function getTesterStats(testerId) {
  const db = getDb();
  const stmt = db.prepare(
    `SELECT
       COUNT(*) AS total_tested,
       SUM(CASE WHEN result = 'pass' THEN 1 ELSE 0 END) AS passed,
       SUM(CASE WHEN result = 'fail' THEN 1 ELSE 0 END) AS failed
     FROM tester_stats
     WHERE tester_id = ?`
  );
  stmt.bind([testerId]);
  
  let stats = { total_tested: 0, passed: 0, failed: 0 };
  if (stmt.step()) {
    stats = stmt.getAsObject();
  }
  stmt.free();
  return stats;
}

/**
 * Get per-gamemode statistics for a tester.
 */
function getTesterGamemodeStats(testerId) {
  const db = getDb();
  const stmt = db.prepare(
    `SELECT
       gamemode,
       COUNT(*) AS total_tested,
       SUM(CASE WHEN result = 'pass' THEN 1 ELSE 0 END) AS passed,
       SUM(CASE WHEN result = 'fail' THEN 1 ELSE 0 END) AS failed
     FROM tester_stats
     WHERE tester_id = ?
     GROUP BY gamemode
     ORDER BY gamemode ASC`
  );
  stmt.bind([testerId]);
  
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

/**
 * Get all testers ranked by total tested.
 */
function getAllTesterStats() {
  const db = getDb();
  const stmt = db.prepare(
    `SELECT
       tester_id,
       COUNT(*) AS total_tested,
       SUM(CASE WHEN result = 'pass' THEN 1 ELSE 0 END) AS passed,
       SUM(CASE WHEN result = 'fail' THEN 1 ELSE 0 END) AS failed
     FROM tester_stats
     GROUP BY tester_id
     ORDER BY total_tested DESC`
  );
  
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

module.exports = {
  logRankHistory,
  upsertCurrentRank,
  getUserRanks,
  removeRank,
  getLeaderboard,
  getDetailedLeaderboard,
  getUserHistory,
  logTest,
  getTesterStats,
  getTesterGamemodeStats,
  getAllTesterStats,
};
