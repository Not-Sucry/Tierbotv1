/**
 * Hypixel-style rank message templates
 * Supports: promotion, demotion, and failed tests
 * Uses variable placeholders: {player}, {opponent}, {score_player}, {score_opponent}, {rank}, {gamemode}
 */

const TEMPLATES = {
  promotion: `╔══════════════════════════════╗
║        {GAMEMODE} — RANK UPDATE
╚══════════════════════════════╝
Player: {player}
New Rank: ✦ {rank} ✦
━━━━━━━━━━━━━━━━━━━━━━
Match Result
{opponent} {score_opponent} ┃ {score_player} {player}
━━━━━━━━━━━━━━━━━━━━━━
Rank Evaluation
Based on an outstanding and dominant performance, {player} has met the requirements for {rank} Tier in {gamemode}.

Rankings are determined by overall gameplay performance, including mechanics, consistency, and game sense — not solely the final score.
━━━━━━━━━━━━━━━━━━━━━━
GGs to both players!`,

  demotion: `╔══════════════════════════════╗
║        {GAMEMODE} — RANK UPDATE
╚══════════════════════════════╝
Player: {player}
New Rank: ✦ {rank} ✦
━━━━━━━━━━━━━━━━━━━━━━
Match Result
{opponent} {score_opponent} ┃ {score_player} {player}
━━━━━━━━━━━━━━━━━━━━━━
Rank Evaluation
Following a below-standard performance, {player} no longer meets the requirements for their previous tier and has been adjusted to {rank} Tier in {gamemode}.

Rankings are based on overall gameplay performance, not just match results.
━━━━━━━━━━━━━━━━━━━━━━
Keep practicing and come back stronger! 💪`,

  failed: `╔══════════════════════════════╗
║        {GAMEMODE} — TEST RESULT
╚══════════════════════════════╝
Player: {player}
Result: NOT PASSED ✗
━━━━━━━━━━━━━━━━━━━━━━
Match Result
{opponent} {score_opponent} ┃ {score_player} {player}
━━━━━━━━━━━━━━━━━━━━━━
Evaluation
After review, {player} did not meet the requirements for the requested tier in {gamemode}.

Focus on improving consistency, mechanics, and decision-making before requesting another test.
━━━━━━━━━━━━━━━━━━━━━━
Good effort — keep grinding! 🔥`,
};

/**
 * Generate a Hypixel-style rank message from template
 * @param {string} type - 'promotion', 'demotion', or 'failed'
 * @param {Object} data - { player, opponent, scorePlayer, scoreOpponent, rank, gamemode }
 * @returns {string} - Formatted message
 */
function generateRankMessage(type, data) {
  const template = TEMPLATES[type];
  if (!template) {
    throw new Error(`Unknown template type: ${type}`);
  }

  const { player, opponent, scorePlayer, scoreOpponent, rank, gamemode } = data;
  
  let message = template;
  message = message.replace(/{player}/g, player);
  message = message.replace(/{opponent}/g, opponent);
  message = message.replace(/{score_player}/g, scorePlayer);
  message = message.replace(/{score_opponent}/g, scoreOpponent);
  message = message.replace(/{rank}/g, rank);
  message = message.replace(/{GAMEMODE}/g, gamemode.toUpperCase());
  message = message.replace(/{gamemode}/g, gamemode);

  return message;
}

/**
 * Create promotion message
 */
function createPromotionMessage({ player, opponent, scorePlayer, scoreOpponent, rank, gamemode }) {
  return generateRankMessage('promotion', {
    player,
    opponent,
    scorePlayer,
    scoreOpponent,
    rank,
    gamemode,
  });
}

/**
 * Create demotion message
 */
function createDemotionMessage({ player, opponent, scorePlayer, scoreOpponent, rank, gamemode }) {
  return generateRankMessage('demotion', {
    player,
    opponent,
    scorePlayer,
    scoreOpponent,
    rank,
    gamemode,
  });
}

/**
 * Create failed test message
 */
function createFailedMessage({ player, opponent, scorePlayer, scoreOpponent, requestedRank, gamemode }) {
  return generateRankMessage('failed', {
    player,
    opponent,
    scorePlayer,
    scoreOpponent,
    rank: requestedRank,
    gamemode,
  });
}

module.exports = {
  generateRankMessage,
  createPromotionMessage,
  createDemotionMessage,
  createFailedMessage,
};
