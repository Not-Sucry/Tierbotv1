const { EmbedBuilder } = require('discord.js');

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

const RANK_EMOJIS = { 
  'S++': '👑', 
  'S+': '⭐', 
  'S': '✨', 
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

/**
 * Promotion embed shown in the main channel.
 */
function promotionEmbed({ target, rank, gamemode }) {
  const displayMode = gamemode
    .replace(/_/g, ' ')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  const emoji = RANK_EMOJIS[rank] ?? '🏅';

  return new EmbedBuilder()
    .setColor(RANK_COLORS[rank] ?? 0x99AAB5)
    .setTitle(`${emoji}${displayMode.toUpperCase()} RANK PROMOTION`)
    .setDescription(`✨ **${target.username}** has been promoted!`)
    .addFields(
      { name: '👤 Player', value: `<@${target.id}>`, inline: true },
      { name: '⭐ Rank', value: `**${rank}** Rank`, inline: true },
      { name: '🎮 Gamemode', value: `**${displayMode}**`, inline: true },
      { name: '🎉 Announcement', value: `Congratulations to <@${target.id}> for achieving **${rank} Rank** in **${displayMode}**! Keep up the great work! 🚀`, inline: false }
    )
    .setThumbnail(target.displayAvatarURL({ dynamic: true, size: 256 }))
    .setFooter({ text: 'fakepixel tier test • Rank System' })
    .setTimestamp();
}

/**
 * Staff-channel log embed.
 */
function logEmbed({ target, staff, rank, gamemode, timestamp }) {
  const displayMode = gamemode
    .replace(/_/g, ' ')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  
  return new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle('📋 Rank Assignment Log')
    .setThumbnail(target.displayAvatarURL({ dynamic: true, size: 128 }))
    .addFields(
      { name: '👤 Player Tested', value: `<@${target.id}> (\`${target.id}\`)`, inline: false },
      { name: '👮 Staff Member', value: `<@${staff.id}> (\`${staff.id}\`)`, inline: false },
      { name: '🎮 Gamemode', value: displayMode, inline: true },
      { name: '⭐ Rank', value: `${RANK_EMOJIS[rank]}${rank} Rank`, inline: true },
      { name: '⏰ Timestamp', value: `<t:${Math.floor(timestamp / 1000)}:F>`, inline: false }
    )
    .setFooter({ text: 'fakepixel tier test • Rank System' })
    .setTimestamp(timestamp);
}

/**
 * View embed — shows all of a player's current ranks.
 */
function viewEmbed({ target, ranks }) {
  const embed = new EmbedBuilder()
    .setColor(0x2ECC71)
    .setTitle(`📊 Rank Profile — ${target.username}`)
    .setDescription('━━━━━━━━━━━━━━━━━━━━━')
    .setThumbnail(target.displayAvatarURL({ dynamic: true, size: 256 }))
    .setTimestamp();

  if (ranks.length === 0) {
    embed.addFields({
      name: '📭 No Ranks',
      value: 'This player has not been ranked yet.',
      inline: false
    });
  } else {
    const ranksByGamemode = {};
    ranks.forEach(r => {
      if (!ranksByGamemode[r.gamemode]) ranksByGamemode[r.gamemode] = [];
      ranksByGamemode[r.gamemode].push(r);
    });

    Object.entries(ranksByGamemode).forEach(([gamemode, gamemodeRanks]) => {
      const displayMode = gamemode
        .replace(/_/g, ' ')
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      
      const rankText = gamemodeRanks.map(r => {
        const emoji = RANK_EMOJIS[r.rank] ?? '🎯';
        const ts = Math.floor(new Date(r.updated_at).getTime() / 1000);
        return `${emoji}**${r.rank}** — <t:${ts}:R>`;
      }).join('\n');

      embed.addFields({
        name: `🎮 ${displayMode}`,
        value: rankText,
        inline: false
      });
    });
  }

  return embed;
}

/**
 * Leaderboard embed with detailed rank info.
 */
function leaderboardEmbed({ rows, guild, gamemode = 'all' }) {
  const gamemodeDisplay = {
    'bedfight': 'Bedfight',
    'sumo': 'Sumo',
    'the_classic': 'Classic',
    'the_bridge': 'Bridge'
  };

  const rankPoints = {
    'S++': 8, 'S+': 7.5, 'S': 7, 'S-': 6.5,
    'A+': 6, 'A': 5.5, 'A-': 5,
    'B+': 4.5, 'B': 4, 'B-': 3.5,
    'C+': 3, 'C': 2.5, 'C-': 2,
    'D+': 1.5, 'D': 1
  };

  const embed = new EmbedBuilder()
    .setColor(0xFFD700)
    .setTimestamp();

  if (rows.length === 0) {
    embed.setTitle('🏆 FAKEPIXEL — OVERALL RANKINGS')
      .setDescription('No players have been ranked yet.');
    return embed;
  }

  // Build the leaderboard text
  let leaderboardText = '🏆 FAKEPIXEL — OVERALL RANKINGS\n\n';

  rows.forEach((row, i) => {
    const position = i + 1;
    const playerName = row.username || 'Unknown';
    
    // Find the tier with the highest points for the 🏆 symbol
    let highestTier = null;
    let highestPoints = 0;
    let ranksDisplay = [];

    if (gamemode === 'all') {
      // Overall rankings - show all gamemodes
      row.ranks.forEach(r => {
        const displayName = gamemodeDisplay[r.gamemode] || r.gamemode;
        ranksDisplay.push({ name: displayName, rank: r.rank, points: rankPoints[r.rank] || 0 });
        
        if ((rankPoints[r.rank] || 0) > highestPoints) {
          highestPoints = rankPoints[r.rank] || 0;
          highestTier = r.rank;
        }
      });
    } else {
      // Filtered by gamemode
      const filtered = row.ranks.filter(r => r.gamemode === gamemode);
      if (filtered.length === 0) return;
      
      filtered.forEach(r => {
        ranksDisplay.push({ name: gamemodeDisplay[r.gamemode] || r.gamemode, rank: r.rank, points: rankPoints[r.rank] || 0 });
        highestTier = r.rank;
      });
    }

    // Format line: #N  PLAYERNAME  ⭐ POINTS   🏆 TIER (if applicable)
    let line = `#${position.toString().padEnd(3)}${playerName.padEnd(24)}⭐ ${row.points}`;
    if (highestTier && gamemode === 'all') {
      line += `   🏆 ${highestTier}`;
    }
    
    leaderboardText += line + '\n';
    
    // Add indented gamemode ranks
    ranksDisplay.forEach(r => {
      leaderboardText += `${r.name.padEnd(10)}${r.rank}\n`;
    });
    
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

  // Use code block for better formatting
  embed.setDescription('```\n' + leaderboardText + '\n```')
    .setTitle('🏆 FAKEPIXEL — OVERALL RANKINGS');

  return embed;
}

/**
 * Simple error embed.
 */
function errorEmbed(message) {
  return new EmbedBuilder()
    .setColor(0xE74C3C)
    .setTitle('❌ Error')
    .setDescription(message)
    .setTimestamp();
}

/**
 * Success embed.
 */
function successEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(0x10b981)
    .setTitle('✅ ' + title)
    .setDescription(description)
    .setTimestamp();
}

/**
 * Info embed.
 */
function infoEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(0x3b82f6)
    .setTitle('ℹ️ ' + title)
    .setDescription(description)
    .setTimestamp();
}

/**
 * Promotion message with ASCII formatting
 */
function promotionMessage({ target, rank, gamemode, opponent, opponentScore, playerScore, previousRank }) {
  const displayMode = gamemode.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const playerMention = `<@${target.id}>`;
  const opponentMention = opponent ? `<@${opponent.id}>` : 'N/A';
  
  let message = `╔══════════════════════════════╗\n`;
  message += `║ ${displayMode.toUpperCase()} RANK PROMOTION\n`;
  message += `╚══════════════════════════════╝\n`;
  message += `Player: ${playerMention}\n`;
  message += `Rank Earned: ✦ ${rank} ✦\n`;
  
  // Add previous tier if applicable
  if (previousRank && previousRank !== rank) {
    message += `Previous Tier: ${previousRank}\n`;
    message += `New Tier: ${rank}\n`;
  }
  
  message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `Match Result\n`;
  
  if (opponent && opponentScore !== null && playerScore !== null) {
    message += `${opponentMention} ${opponentScore} ┃ ${playerScore} ${playerMention}\n`;
  }
  
  message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `Official Decision\n`;
  message += `Based on comprehensive performance evaluation including mechanics, consistency, game sense, and overall dominance, ${playerMention} has been successfully promoted to ${rank} in ${displayMode}.\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `GGs to both players!`;
  
  return message;
}

/**
 * Retier message with fancy formatting (for rank updates/demotions)
 */
function retierMessage({ target, oldRank, newRank, gamemode, opponent, opponentScore, playerScore }) {
  const displayMode = gamemode.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const playerMention = `<@${target.id}>`;
  const opponentMention = opponent ? `<@${opponent.id}>` : 'N/A';
  
  let message = `Previous Tier: ${oldRank}\n`;
  message += `New Tier: ${newRank}\n\n`;
  message += `╔══════════════════════════════╗\n`;
  message += `║ ${displayMode.toUpperCase()} RANK UPDATE\n`;
  message += `╚══════════════════════════════╝\n`;
  message += `Player: ${playerMention}\n`;
  message += `Rank Updated: ✦ ${newRank} ✦\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `Match Result\n`;
  
  if (opponent && opponentScore !== null && playerScore !== null) {
    message += `${opponentMention} ${opponentScore} ┃ ${playerScore} ${playerMention}\n`;
  }
  
  message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `Official Decision\n`;
  message += `Based on comprehensive performance evaluation (mechanics, consistency, game sense, dominance), ${playerMention} has been adjusted to ${newRank} in ${displayMode}.\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `GGs to both players!`;
  
  return message;
}

module.exports = { promotionEmbed, promotionMessage, retierMessage, logEmbed, viewEmbed, leaderboardEmbed, errorEmbed, successEmbed, infoEmbed };
