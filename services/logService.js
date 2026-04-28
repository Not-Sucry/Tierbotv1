const { logEmbed } = require('../utils/embeds');
const config = require('../config');

/**
 * Sends a log embed to the configured staff log channel.
 * Silently swallows errors so a missing channel never breaks the main flow.
 */
async function sendLog(client, { target, staff, rank, gamemode, timestamp }) {
  try {
    const channel = await client.channels.fetch(config.logChannelId).catch(() => null);
    if (!channel?.isTextBased()) return;

    const embed = logEmbed({ target, staff, rank, gamemode, timestamp });
    await channel.send({ embeds: [embed] });
  } catch (err) {
    console.error('[LogService] Failed to send log embed:', err.message);
  }
}

module.exports = { sendLog };
