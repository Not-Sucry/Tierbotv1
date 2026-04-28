const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

/**
 * Create action buttons for result confirmation
 */
function createButtonRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('result_confirm')
      .setLabel('Confirm')
      .setEmoji('✅')
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId('result_edit')
      .setLabel('Edit')
      .setEmoji('✏️')
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId('result_cancel')
      .setLabel('Cancel')
      .setEmoji('❌')
      .setStyle(ButtonStyle.Danger)
  );
}

module.exports = { createButtonRow };
