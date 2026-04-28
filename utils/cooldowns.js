const config = require('../config');

// staffCooldowns: Map<staffId, lastUsedTimestamp>
const staffCooldowns = new Map();

// targetCooldowns: Map<`${staffId}:${targetId}`, lastUsedTimestamp>
const targetCooldowns = new Map();

// spamLog: Map<staffId, attemptCount> — resets every minute
const spamLog = new Map();
setInterval(() => spamLog.clear(), 60_000);

/**
 * Check if a staff member is on cooldown.
 * @returns {number|null} Remaining ms if on cooldown, null if clear.
 */
function checkStaffCooldown(staffId) {
  const last = staffCooldowns.get(staffId);
  if (!last) return null;
  const remaining = config.cooldowns.staff - (Date.now() - last);
  return remaining > 0 ? remaining : null;
}

/**
 * Check if a target player was ranked too recently.
 * @returns {number|null} Remaining ms if on cooldown, null if clear.
 */
function checkTargetCooldown(targetId) {
  const last = targetCooldowns.get(targetId);
  if (!last) return null;
  const remaining = config.cooldowns.targetPlayer - (Date.now() - last);
  return remaining > 0 ? remaining : null;
}

/**
 * Stamp cooldowns after a successful /tier set.
 */
function stampCooldowns(staffId, targetId) {
  const now = Date.now();
  staffCooldowns.set(staffId, now);
  targetCooldowns.set(targetId, now);
}

/**
 * Track a spam attempt and return the current count.
 */
function trackSpamAttempt(staffId) {
  const count = (spamLog.get(staffId) ?? 0) + 1;
  spamLog.set(staffId, count);
  return count;
}

module.exports = { checkStaffCooldown, checkTargetCooldown, stampCooldowns, trackSpamAttempt };
