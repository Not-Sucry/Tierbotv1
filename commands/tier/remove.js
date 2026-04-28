const { SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config');
const { deleteRank } = require('../../services/rankService');
const { errorEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName('remove')
    .setDescription("Remove a player's rank for a specific gamemode.")
    .addUserOption(opt =>
      opt.setName('user')
        .setDescription('The player whose rank to remove')
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName('gamemode')
        .setDescription('The gamemode to remove the rank for')
        .setRequired(true)
        .addChoices(
          { name: 'Bedfight', value: 'bedfight' },
          { name: 'Sumo', value: 'sumo' },
          { name: 'The Classic', value: 'the_classic' },
          { name: 'The Bridge', value: 'the_bridge' },
        )),

  async execute(interaction) {
    await interaction.deferReply();

    const staff    = interaction.member;
    const target   = interaction.options.getMember('user');
    const rawMode  = interaction.options.getString('gamemode').toLowerCase().trim();

    // Staff guard
    if (!staff.roles.cache.has(config.staffRoleId)) {
      return interaction.editReply({
        embeds: [errorEmbed('You need the **Staff** role to use this command.')],
      });
    }

    if (!target) {
      return interaction.editReply({
        embeds: [errorEmbed('That user could not be found in this server.')],
      });
    }

    if (!config.gamemodes.includes(rawMode)) {
      return interaction.editReply({
        embeds: [errorEmbed(
          `Invalid gamemode. Valid options: ${config.gamemodes.map(g => `\`${g}\``).join(', ')}`
        )],
      });
    }

    try {
      const { removed, roleNames } = await deleteRank(interaction.client, {
        target,
        gamemode: rawMode,
      });

      if (!removed) {
        return interaction.editReply({
          embeds: [errorEmbed(
            `<@${target.id}> does not have a rank recorded for **${rawMode}**.`
          )],
        });
      }

      const displayMode = rawMode.charAt(0).toUpperCase() + rawMode.slice(1);
      const embed = new EmbedBuilder()
        .setColor(0xE74C3C)
        .setTitle('🗑️ Rank Removed')
        .setDescription('━━━━━━━━━━━━━━━━━━━━━')
        .addFields(
          { name: '👤 Player', value: `<@${target.id}>`, inline: true },
          { name: '🎮 Gamemode', value: `\`${displayMode}\``, inline: true },
          { name: '✨ Status', value: 'Successfully removed ✓', inline: true }
        )
        .setFooter({ text: '🔄 Rank data updated' })
        .setTimestamp();

      if (roleNames.length > 0) {
        embed.addFields({
          name: '🏷️ Roles Removed',
          value: roleNames.join(', '),
          inline: false
        });
      }

      return interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error('[/tier remove] Error:', err);
      return interaction.editReply({
        embeds: [errorEmbed('An error occurred while removing the rank.')],
      });
    }
  },
};
