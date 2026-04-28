require('dotenv').config();

module.exports = {
  token: process.env.BOT_TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID,

  staffRoleId: process.env.STAFF_ROLE_ID,
  tierTesterRoleId: '1490690065137930323',
  logChannelId: process.env.LOG_CHANNEL_ID,
  resultsChannelId: '1490690407380554049',

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'pvp_ranks',
  },

  // Valid gamemodes (lowercase for comparison)
  gamemodes: ['bedfight', 'sumo', 'the_classic', 'the_bridge'],

  // Valid ranks and their point values (sub-tier system for better progression tracking)
  ranks: {
    'D': 1,
    'D+': 1.5,
    'C-': 2,
    'C': 2.5,
    'C+': 3,
    'B-': 3.5,
    'B': 4,
    'B+': 4.5,
    'A-': 5,
    'A': 5.5,
    'A+': 6,
    'S-': 6.5,
    'S': 7,
    'S+': 7.5,
    'S++': 8,  // Top 1% players
  },

  // Cooldowns in milliseconds
  cooldowns: {
    staff: 10_000,       // 10 seconds between any /tier set uses per staff
    targetPlayer: 30_000, // 30 seconds before same target can be ranked again
  },
};
