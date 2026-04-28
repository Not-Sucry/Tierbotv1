const { logRankHistory, upsertCurrentRank, removeRank } = require('../database/queries');
const { assignRankRole, removeAllRankRoles } = require('../utils/roleManager');
const { sendLog } = require('./logService');

/**
 * Core service that:
 *  1. Assigns the Discord role
 *  2. Writes to SQLite
 *  3. Sends the staff log
 */
async function applyRank(client, { guild, target, staff, gamemode, rank }) {
  const timestamp = Date.now();

  try {
    // 1 — Roles
    await assignRankRole(target, rank);
  } catch (roleErr) {
    console.error('[rankService] Role assignment error:', roleErr.message);
    throw new Error(`Failed to assign role: ${roleErr.message}`);
  }

  // 2 — Database (synchronous for SQLite)
  upsertCurrentRank({ userId: target.id, staffId: staff.id, gamemode, rank });
  logRankHistory({ userId: target.id, staffId: staff.id, gamemode, rank });

  // 3 — Staff log
  await sendLog(client, { target: target.user, staff: staff.user, rank, gamemode, timestamp });
}

/**
 * Removes a user's rank role(s) and deletes from the DB.
 * Returns { removed: boolean, roleNames: string[] }
 */
async function deleteRank(client, { target, gamemode }) {
  const dbRemoved   = removeRank(target.id, gamemode);
  const roleNames   = await removeAllRankRoles(target);
  return { removed: dbRemoved || roleNames.length > 0, roleNames };
}

module.exports = { applyRank, deleteRank };
