/**
 * Text-based leaderboard formatter for FAKEPIXEL tier rankings
 * Formats leaderboard data into compact text format with tier emojis
 */

const { EmbedBuilder } = require('discord.js');

const RANK_EMOJIS = {
  'S++': '⭐⭐',
  'S+': '✨',
  'S': '🔥',
  'S-': '🌟',
  'A+': '🔥',
  'A': '🔴',
  'A-': '🟠',
  'B+': '💧',
  'B': '🔵',
  'B-': '🟦',
  'C+': '🟢',
  'C': '💚',
  'C-': '🟩',
  'D+': '⚫',
  'D': '◼️'
};

const MEDAL_EMOJIS = ['🥇', '🥈', '🥉'];

const TIER_SCALE = `Fakepixel Tier Test • S++=8 S+=7.5 S=7 S-=6.5 A+=6 A=5.5 A-=5 B+=4.5 B=4 B-=3.5 C+=3 C=2.5 C-=2 D+=1.5 D=1`;

/**
 * Format leaderboard data into text format
 * @param {Array} players - Array of player objects with user_id, points, ranks
 * @param {string} username - Discord username
 * @returns {string} Formatted leaderboard text
 */
function formatLeaderboard(players, usernames = {}) {
  let output = '🏆 FAKEPIXEL TIER LEADERBOARD\n';
  output += '━━━━━━━━━━━━━━━━━━━━━\n';
  output += '📊 Rankings\n';

  players.forEach((player, index) => {
    const rank = index + 1;
    let rankEmoji;

    if (rank === 1) rankEmoji = MEDAL_EMOJIS[0];
    else if (rank === 2) rankEmoji = MEDAL_EMOJIS[1];
    else if (rank === 3) rankEmoji = MEDAL_EMOJIS[2];
    else rankEmoji = `#${rank}`;

    const username = usernames[player.user_id] || `Unknown#${player.user_id.slice(-4)}`;
    const stars = Math.round(player.points * 10) / 10; // Round to 1 decimal
    
    // Get tier emojis for each gamemode
    let tierEmojis = '';
    if (player.ranks && player.ranks.length > 0) {
      // Sort ranks by gamemode for consistent display
      const rankedModes = player.ranks
        .sort((a, b) => a.gamemode.localeCompare(b.gamemode));
      
      rankedModes.forEach(rankData => {
        const emoji = RANK_EMOJIS[rankData.rank] || '❓';
        const rankLabel = rankData.rank;
        tierEmojis += ` ${emoji}${rankLabel}`;
      });
    }

    // Format: "🥇 @username • 13⭐ 💚C 🔴A ◼️D 🔵B"
    output += `${rankEmoji} @${username} • ${stars}⭐${tierEmojis}\n`;
  });

  output += `${TIER_SCALE}`;

  return output;
}

/**
 * Format players with limited tier display (max 3 gamemodes shown)
 * @param {Array} players - Array of player objects with user_id, points, ranks
 * @param {string} gamemode - Filter by gamemode (optional)
 * @returns {string} Formatted leaderboard text
 */
function formatLeaderboardCompact(players, usernames = {}, gamemode = null) {
  let output = '🏆 FAKEPIXEL TIER LEADERBOARD\n';
  output += '━━━━━━━━━━━━━━━━━━━━━\n';
  output += '📊 Rankings\n';

  players.forEach((player, index) => {
    const rank = index + 1;
    let rankEmoji;

    if (rank === 1) rankEmoji = MEDAL_EMOJIS[0];
    else if (rank === 2) rankEmoji = MEDAL_EMOJIS[1];
    else if (rank === 3) rankEmoji = MEDAL_EMOJIS[2];
    else rankEmoji = `#${rank}`;

    const username = usernames[player.user_id] || `Unknown#${player.user_id.slice(-4)}`;
    const stars = Math.round(player.points * 10) / 10;
    
    // Get tier emojis for each gamemode (limited display)
    let tierEmojis = '';
    if (player.ranks && player.ranks.length > 0) {
      const displayRanks = gamemode 
        ? player.ranks.filter(r => r.gamemode === gamemode)
        : player.ranks.slice(0, 3); // Show max 3 gamemodes
      
      displayRanks.forEach(rankData => {
        const emoji = RANK_EMOJIS[rankData.rank] || '❓';
        tierEmojis += ` ${emoji}${rankData.rank}`;
      });
    }

    output += `${rankEmoji} @${username} • ${stars}⭐${tierEmojis}\n`;
  });

  output += `\n${TIER_SCALE}`;

  return output;
}

/**
 * Format leaderboard as a Discord embed with multi-line player blocks
 * @param {Array} players - Array of player objects with user_id, points, ranks
 * @param {string} gamemode - Filter by gamemode (optional)
 * @returns {EmbedBuilder} Formatted Discord embed
 */
function formatLeaderboardMultiline(players, gamemode = null) {
  let leaderboardText = '';

  players.forEach((player, index) => {
    const rank = index + 1;
    const stars = Math.round(player.points * 10) / 10;
    
    // Get overall tier (highest rank)
    let overallTier = '—';
    if (player.ranks && player.ranks.length > 0) {
      const tierValues = {
        'S++': 8.5, 'S+': 8.0, 'S': 7.5, 'S-': 7.0,
        'A+': 6.5, 'A': 6.0, 'A-': 5.5,
        'B+': 5.0, 'B': 4.5, 'B-': 4.0,
        'C+': 3.5, 'C': 3.0, 'C-': 2.5,
        'D+': 2.0, 'D': 1.5
      };
      
      let highestTier = player.ranks[0].rank;
      let highestValue = tierValues[highestTier] || 0;
      
      player.ranks.forEach(r => {
        if ((tierValues[r.rank] || 0) > highestValue) {
          highestTier = r.rank;
          highestValue = tierValues[r.rank] || 0;
        }
      });
      overallTier = highestTier;
    }

    // Player header line
    leaderboardText += `#${rank}  <@${player.user_id}>     ⭐ ${stars}   🏆 ${overallTier}\n`;
    
    // Game modes
    if (player.ranks && player.ranks.length > 0) {
      const gamemodeNames = {
        'bedfight': 'Bedfight',
        'sumo': 'Sumo',
        'the_bridge': 'Bridge',
        'the_classic': 'Classic'
      };
      
      player.ranks.forEach(rankData => {
        const modeName = gamemodeNames[rankData.gamemode] || rankData.gamemode;
        leaderboardText += `${modeName}      ${rankData.rank}\n`;
      });
    }
    
    // Gap between players
    leaderboardText += '\n';
  });

  // Add tier scale
  leaderboardText += '────────────────────────────\n\n';
  leaderboardText += 'TIER SCALE\n';
  leaderboardText += 'S++ 8.0   S+ 7.5   S 7.0   S- 6.5\n';
  leaderboardText += 'A+  6.0   A  5.5   A- 5.0\n';
  leaderboardText += 'B+  4.5   B  4.0   B- 3.5\n';
  leaderboardText += 'C+  3.0   C  2.5   C- 2.0\n';
  leaderboardText += 'D+  1.5   D  1.0';

  const embed = new EmbedBuilder()
    .setColor(0xFFD700) // Gold color
    .setTitle('🏆 FAKEPIXEL — OVERALL RANKINGS')
    .setDescription(leaderboardText);

  return embed;
}

module.exports = {
  formatLeaderboard,
  formatLeaderboardCompact,
  formatLeaderboardMultiline,
  RANK_EMOJIS,
  MEDAL_EMOJIS,
  TIER_SCALE,
};
