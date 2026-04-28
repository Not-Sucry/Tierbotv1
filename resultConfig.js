/**
 * Result system configuration
 */

module.exports = {
  // Gamemodes available
  GAMEMODES: {
    bedwars: { name: 'Bedwars', emoji: '🛏️' },
    skywars: { name: 'Skywars', emoji: '☁️' },
    duels: { name: 'Duels', emoji: '⚔️' },
    sumo: { name: 'Sumo', emoji: '🥋' },
    classic: { name: 'Classic', emoji: '🎯' },
    other: { name: 'Other', emoji: '🎮' },
  },

  // Rank tier system
  RANKS: {
    'S++': { value: 8.5, emoji: '⭐⭐' },
    'S+': { value: 8.0, emoji: '⭐' },
    'S': { value: 7.5, emoji: '🔥' },
    'S-': { value: 7.0, emoji: '✨' },
    'A+': { value: 6.5, emoji: '💎' },
    'A': { value: 6.0, emoji: '👑' },
    'A-': { value: 5.5, emoji: '🏅' },
    'B+': { value: 5.0, emoji: '🥇' },
    'B': { value: 4.5, emoji: '🥈' },
    'B-': { value: 4.0, emoji: '🥉' },
    'C+': { value: 3.5, emoji: '🎖️' },
    'C': { value: 3.0, emoji: '📜' },
    'C-': { value: 2.5, emoji: '📋' },
    'D+': { value: 2.0, emoji: '🎯' },
    'D': { value: 1.5, emoji: '📍' },
  },

  // Result types
  RESULT_TYPES: {
    promotion: { emoji: '🏆', color: '#FFD700', title: 'PROMOTION' },
    demotion: { emoji: '📉', color: '#EF4444', title: 'DEMOTION' },
    fail: { emoji: '❌', color: '#F97316', title: 'TEST FAILED' },
  },

  // Score thresholds for evaluation
  SCORE_THRESHOLDS: {
    dominant: 10,      // 10+ point difference
    solid: 5,          // 5-9 point difference
    close: 4,          // Close match (0-4 difference)
  },
};
