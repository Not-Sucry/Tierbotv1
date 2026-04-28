const { EmbedBuilder } = require('discord.js');

/**
 * Calculate evaluation text based on score difference and result type
 */
function getEvaluationText(scorePlayer, scoreOpponent, type) {
  const diff = scorePlayer - scoreOpponent;
  const absDiff = Math.abs(diff);

  if (type === 'promotion') {
    if (absDiff >= 10) {
      return `Showcased a **dominant performance** with an impressive ${scorePlayer}-${scoreOpponent} victory. Your mechanical skill and game sense were on full display. Well deserved promotion!`;
    } else if (absDiff >= 5) {
      return `Delivered a **solid performance** with a ${scorePlayer}-${scoreOpponent} victory. Strong gameplay and good decision-making earned this promotion.`;
    } else {
      return `Secured a **hard-fought victory** with a close ${scorePlayer}-${scoreOpponent} match. Your determination and clutch plays have earned this well-deserved promotion.`;
    }
  }

  if (type === 'demotion') {
    if (absDiff >= 10) {
      return `The ${scorePlayer}-${scoreOpponent} loss indicates your current performance doesn't match this rank. Focus on fundamentals and comebacks. You'll get back to this rank.`;
    } else if (absDiff >= 5) {
      return `Lost this match ${scorePlayer}-${scoreOpponent}. Your rank will be adjusted to match your current skill level. Use this as motivation to improve.`;
    } else {
      return `A close match result of ${scorePlayer}-${scoreOpponent} led to this demotion. You're on the edge of this tier—keep grinding to reclaim it!`;
    }
  }

  if (type === 'fail') {
    if (absDiff >= 10) {
      return `Score of ${scorePlayer}-${scoreOpponent} fell short of the requirements. The gap was significant. Review your gameplay and try again when ready.`;
    } else if (absDiff >= 5) {
      return `Unfortunately, a ${scorePlayer}-${scoreOpponent} result didn't meet the promotion criteria. Close attempt—analyze what you can improve and retry.`;
    } else {
      return `A narrow ${scorePlayer}-${scoreOpponent} loss. This was very close! Refine your strategy and test again soon.`;
    }
  }

  return 'Test result recorded.';
}

/**
 * Generate color based on result type
 */
function getColor(type) {
  const colors = {
    promotion: '#FFD700', // Gold
    demotion: '#EF4444',  // Red
    fail: '#F97316',      // Orange
  };
  return colors[type] || '#6366F1';
}

/**
 * Generate title emoji and text
 */
function getTitleInfo(type) {
  const titles = {
    promotion: { emoji: '🏆', text: 'PROMOTION' },
    demotion: { emoji: '📉', text: 'DEMOTION' },
    fail: { emoji: '❌', text: 'TEST FAILED' },
  };
  return titles[type] || { emoji: '📊', text: 'RESULT' };
}

/**
 * Main embed generator
 */
function generateEmbed(resultData) {
  const { type, player, gamemode, rank, opponent, scorePlayer, scoreOpponent, tester } = resultData;

  const titleInfo = getTitleInfo(type);
  const evaluation = getEvaluationText(scorePlayer, scoreOpponent, type);
  const color = getColor(type);

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(`${titleInfo.emoji} ${titleInfo.text}`)
    .setDescription('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    .addFields(
      {
        name: '👤 Player',
        value: `\`${player}\``,
        inline: true,
      },
      {
        name: '🎮 Gamemode',
        value: `\`${gamemode.charAt(0).toUpperCase() + gamemode.slice(1)}\``,
        inline: true,
      },
      {
        name: `${type === 'fail' ? '📊 Rank (Optional)' : '🏅 Rank'}`,
        value: `\`${rank}\``,
        inline: true,
      },
      {
        name: '⚔️ Match Result',
        value: `\`${opponent} ${scoreOpponent} ┃ ${scorePlayer} ${player}\``,
        inline: false,
      },
      {
        name: '📝 Evaluation',
        value: evaluation,
        inline: false,
      }
    )
    .setFooter({ text: `Tested by ${tester}` })
    .setTimestamp();

  return embed;
}

module.exports = { generateEmbed };
