const { SlashCommandSubcommandBuilder } = require('discord.js');
const { getUserRanks } = require('../../database/queries');
const { viewEmbed, errorEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName('view')
    .setDescription("View a player's current ranks across all gamemodes.")
    .addUserOption(opt =>
      opt.setName('user')
        .setDescription('The player to look up')
        .setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply();

    const target = interaction.options.getMember('user');

    if (!target) {
      return interaction.editReply({
        embeds: [errorEmbed('That user could not be found in this server.')],
      });
    }

    try {
      const ranks = getUserRanks(target.id);
      return interaction.editReply({
        embeds: [viewEmbed({ target: target.user, ranks })],
      });
    } catch (err) {
      console.error('[/tier view] Error:', err);
      return interaction.editReply({
        embeds: [errorEmbed('Failed to retrieve rank data from the database.')],
      });
    }
  },
};
