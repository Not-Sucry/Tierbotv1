const { SlashCommandBuilder } = require('discord.js');
const { getDetailedLeaderboard } = require('../database/queries');
const { errorEmbed } = require('../utils/embeds');
const { formatLeaderboardMultiline } = require('../utils/leaderboardFormatter');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Show the top ranked players')
    .setDefaultMemberPermissions(null)
    .addStringOption(option =>
      option
        .setName('gamemode')
        .setDescription('Filter by gamemode (optional)')
        .setRequired(false)
        .addChoices(
          { name: 'Overall', value: 'all' },
          { name: 'Bedfight', value: 'bedfight' },
          { name: 'Sumo', value: 'sumo' },
          { name: 'The Classic', value: 'the_classic' },
          { name: 'The Bridge', value: 'the_bridge' }
        )
    ),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const gamemode = interaction.options.getString('gamemode') || 'all';
      const rows = getDetailedLeaderboard();
      
      // Fetch user data for each player
      const rowsWithUsers = await Promise.all(
        rows.map(async (row) => {
          try {
            const user = await interaction.client.users.fetch(row.user_id);
            return { ...row, username: user.username };
          } catch (err) {
            console.warn(`Could not fetch user ${row.user_id}:`, err.message);
            return { ...row, username: `Unknown#${row.user_id.slice(-4)}` };
          }
        })
      );
      
      // Filter by gamemode if needed
      let filteredRows = rowsWithUsers;
      if (gamemode !== 'all') {
        filteredRows = rowsWithUsers.filter(row => 
          row.ranks && row.ranks.some(r => r.gamemode === gamemode)
        );
      }

      const leaderboardEmbed = formatLeaderboardMultiline(filteredRows, gamemode === 'all' ? null : gamemode);
      return interaction.editReply({
        embeds: [leaderboardEmbed],
      });
    } catch (err) {
      console.error('[/leaderboard] Error:', err);
      return interaction.editReply({
        embeds: [errorEmbed('Failed to load the leaderboard.')],
      });
    }
  },
};
