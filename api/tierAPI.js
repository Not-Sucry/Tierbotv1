const express = require('express');
const { getUserRanks } = require('../database/queries');
const { getDb } = require('../database/connection');

const router = express.Router();

/**
 * GET /api/player/:minecraftUUID/tier
 * Get primary tier for a player (highest ranked gamemode)
 */
router.get('/player/:minecraftUUID/tier', (req, res) => {
  try {
    const { minecraftUUID } = req.params;
    
    // Query the database to map Minecraft UUID to Discord ID
    const db = getDb();
    const stmt = db.prepare(
      `SELECT discord_id FROM minecraft_accounts WHERE minecraft_uuid = ? LIMIT 1`
    );
    stmt.bind([minecraftUUID]);
    
    if (!stmt.step()) {
      stmt.free();
      return res.status(404).json({ error: 'Player not found' });
    }
    
    const { discord_id } = stmt.getAsObject();
    stmt.free();
    
    // Get player's ranks
    const ranks = getUserRanks(discord_id);
    
    if (ranks.length === 0) {
      return res.status(404).json({ error: 'No tiers assigned' });
    }
    
    // Return the first (primary) tier
    const primaryTier = ranks[0];
    return res.json({
      minecraftUUID,
      discordID: discord_id,
      gamemode: primaryTier.gamemode,
      rank: primaryTier.rank,
    });
  } catch (err) {
    console.error('[API] Error fetching tier:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/player/:minecraftUUID/tiers
 * Get all tiers for a player
 */
router.get('/player/:minecraftUUID/tiers', (req, res) => {
  try {
    const { minecraftUUID } = req.params;
    
    const db = getDb();
    const stmt = db.prepare(
      `SELECT discord_id FROM minecraft_accounts WHERE minecraft_uuid = ? LIMIT 1`
    );
    stmt.bind([minecraftUUID]);
    
    if (!stmt.step()) {
      stmt.free();
      return res.status(404).json({ error: 'Player not found' });
    }
    
    const { discord_id } = stmt.getAsObject();
    stmt.free();
    
    const ranks = getUserRanks(discord_id);
    
    return res.json({
      minecraftUUID,
      discordID: discord_id,
      tiers: ranks,
    });
  } catch (err) {
    console.error('[API] Error fetching tiers:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/player/:minecraftUUID/register
 * Register a Minecraft UUID to a Discord ID
 * Body: { discordID: "123456789" }
 */
router.post('/player/:minecraftUUID/register', (req, res) => {
  try {
    const { minecraftUUID } = req.params;
    const { discordID } = req.body;
    
    if (!discordID) {
      return res.status(400).json({ error: 'discordID is required' });
    }
    
    const db = getDb();
    
    // Check if already registered
    const checkStmt = db.prepare(
      `SELECT minecraft_uuid FROM minecraft_accounts WHERE minecraft_uuid = ? LIMIT 1`
    );
    checkStmt.bind([minecraftUUID]);
    
    if (checkStmt.step()) {
      checkStmt.free();
      return res.status(409).json({ error: 'Already registered' });
    }
    checkStmt.free();
    
    // Insert new registration
    const insertStmt = db.prepare(
      `INSERT INTO minecraft_accounts (minecraft_uuid, discord_id, registered_at)
       VALUES (?, ?, CURRENT_TIMESTAMP)`
    );
    insertStmt.bind([minecraftUUID, discordID]);
    insertStmt.step();
    insertStmt.free();
    
    const { saveDatabase } = require('../database/connection');
    saveDatabase();
    
    return res.json({ success: true, minecraftUUID, discordID });
  } catch (err) {
    console.error('[API] Error registering player:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/leaderboard
 * Get top 10 players with tiers
 */
router.get('/leaderboard', (req, res) => {
  try {
    const db = getDb();
    
    // Get top players with their tiers
    const stmt = db.prepare(`
      SELECT
        cr.user_id,
        SUM(CASE \`rank\` WHEN 'S' THEN 4 WHEN 'A' THEN 3 WHEN 'B' THEN 2 WHEN 'C' THEN 1 ELSE 0 END) AS points,
        COUNT(*) AS gamemodes_ranked
      FROM current_ranks cr
      GROUP BY cr.user_id
      ORDER BY points DESC
      LIMIT 10
    `);
    
    const players = [];
    while (stmt.step()) {
      players.push(stmt.getAsObject());
    }
    stmt.free();
    
    return res.json({ leaderboard: players });
  } catch (err) {
    console.error('[API] Error fetching leaderboard:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
