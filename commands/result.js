const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { generateEmbed } = require('../utils/embedGenerator');
const { createButtonRow } = require('../utils/buttonRow');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('result')
    .setDescription('Log a PvP test result (promotion, demotion, or fail)')
    .setDefaultMemberPermissions(null)
    .addStringOption(option =>
      option
        .setName('type')
        .setDescription('Result type')
        .setRequired(true)
        .addChoices(
          { name: '🏆 Promotion', value: 'promotion' },
          { name: '📉 Demotion', value: 'demotion' },
          { name: '❌ Failed', value: 'fail' }
        )
    )
    .addStringOption(option =>
      option
        .setName('player')
        .setDescription('Player name/username')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('gamemode')
        .setDescription('Gamemode tested')
        .setRequired(true)
        .addChoices(
          { name: 'Bedwars', value: 'bedwars' },
          { name: 'Skywars', value: 'skywars' },
          { name: 'Duels', value: 'duels' },
          { name: 'Sumo', value: 'sumo' },
          { name: 'Classic', value: 'classic' },
          { name: 'Other', value: 'other' }
        )
    )
    .addStringOption(option =>
      option
        .setName('opponent')
        .setDescription('Opponent name')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('score_player')
        .setDescription('Player score')
        .setRequired(true)
        .setMinValue(0)
    )
    .addIntegerOption(option =>
      option
        .setName('score_opponent')
        .setDescription('Opponent score')
        .setRequired(true)
        .setMinValue(0)
    )
    .addStringOption(option =>
      option
        .setName('rank')
        .setDescription('Rank (optional for fails)')
        .setRequired(false)
        .addChoices(
          { name: 'S++', value: 'S++' },
          { name: 'S+', value: 'S+' },
          { name: 'S', value: 'S' },
          { name: 'S-', value: 'S-' },
          { name: 'A+', value: 'A+' },
          { name: 'A', value: 'A' },
          { name: 'A-', value: 'A-' },
          { name: 'B+', value: 'B+' },
          { name: 'B', value: 'B' },
          { name: 'B-', value: 'B-' },
          { name: 'C+', value: 'C+' },
          { name: 'C', value: 'C' },
          { name: 'C-', value: 'C-' },
          { name: 'D+', value: 'D+' },
          { name: 'D', value: 'D' }
        )
    ),

  execute: async (interaction) => {
    try {
      await interaction.deferReply();

      const resultType = interaction.options.getString('type');
      const player = interaction.options.getString('player');
      const gamemode = interaction.options.getString('gamemode');
      const rank = interaction.options.getString('rank');
      const opponent = interaction.options.getString('opponent');
      const scorePlayer = interaction.options.getInteger('score_player');
      const scoreOpponent = interaction.options.getInteger('score_opponent');

      const resultData = {
        type: resultType,
        player,
        gamemode,
        rank: rank || 'N/A',
        opponent,
        scorePlayer,
        scoreOpponent,
        tester: interaction.user.username,
      };

      const embed = generateEmbed(resultData);
      const buttons = createButtonRow();

      await interaction.editReply({
        embeds: [embed],
        components: [buttons],
      });

    } catch (error) {
      console.error('[Result Command] Error:', error);
      await interaction.editReply({
        content: '❌ An error occurred while processing the result.',
        ephemeral: true,
      });
    }
  },
};
