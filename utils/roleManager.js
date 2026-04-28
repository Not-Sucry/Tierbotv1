const { PermissionsBitField } = require('discord.js');
const config = require('../config');

const RANK_NAMES = Object.keys(config.ranks).map(r => `${r} Rank`);

// Color mapping for new sub-tier system
const RANK_COLORS = { 
  'S++': 0xFF1493,  // Deep Pink
  'S+': 0xFFD700,   // Gold
  'S': 0xFFA500,    // Orange
  'S-': 0xFF8C00,   // Dark Orange
  'A+': 0xFF4500,   // Orange-Red
  'A': 0xFF6347,    // Tomato
  'A-': 0xFF7F50,   // Coral
  'B+': 0x1E90FF,   // Dodger Blue
  'B': 0x0000FF,    // Blue
  'B-': 0x4169E1,   // Royal Blue
  'C+': 0x32CD32,   // Lime Green
  'C': 0x00FF00,    // Lime
  'C-': 0x90EE90,   // Light Green
  'D+': 0x808080,   // Gray
  'D': 0x606060     // Dark Gray
};

/**
 * Finds or creates a rank role (e.g. "S+ Rank") in the guild.
 * Roles are colour-coded by tier.
 */
async function getOrCreateRankRole(guild, rank) {
  const roleName = `${rank} Rank`;
  const existing = guild.roles.cache.find(r => r.name === roleName);
  if (existing) return existing;

  return guild.roles.create({
    name: roleName,
    color: RANK_COLORS[rank] ?? 0x99AAB5,
    reason: 'PvP Rank Bot — auto-created rank role',
  });
}

/**
 * Removes all rank roles (A/B/C/S Rank) from a member, then assigns the new one.
 */
async function assignRankRole(member, rank) {
  const guild = member.guild;

  // Collect all existing rank role IDs to remove
  const toRemove = member.roles.cache.filter(r => RANK_NAMES.includes(r.name));

  if (toRemove.size > 0) {
    await member.roles.remove(toRemove, 'PvP Rank Bot — removing old rank role');
  }

  const newRole = await getOrCreateRankRole(guild, rank);
  await member.roles.add(newRole, `PvP Rank Bot — assigned ${rank} Rank`);

  return newRole;
}

/**
 * Removes all rank roles from a member.
 * Returns the names of the roles that were removed.
 */
async function removeAllRankRoles(member) {
  const toRemove = member.roles.cache.filter(r => RANK_NAMES.includes(r.name));
  if (toRemove.size === 0) return [];
  await member.roles.remove(toRemove, 'PvP Rank Bot — rank removed');
  return toRemove.map(r => r.name);
}

/**
 * Check that the bot has the Manage Roles permission.
 */
function botCanManageRoles(guild) {
  return guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles);
}

module.exports = { assignRankRole, removeAllRankRoles, botCanManageRoles };
