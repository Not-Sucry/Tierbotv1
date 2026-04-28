const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('testerhelp')
    .setDescription('📖 Tester commands help and guide'),

  execute: async (interaction) => {
    await interaction.deferReply();

    try {
      const embeds = [
        new EmbedBuilder()
          .setColor('#3b82f6')
          .setTitle('📖 Tester Commands Help Guide')
          .setDescription('━━━━━━━━━━━━━━━━━━━━━\nLearn how to use all tester-related commands.')
          .addFields(
            {
              name: '📝 `/testerstats log` — Log a Test Result',
              value: 'Record a test you conducted on a player.\n\n' +
                '**Required Fields:**\n' +
                '• `tested_user` — The player you tested\n' +
                '• `gamemode` — Type of match (Bedwars, Skywars, Duels, etc.)\n' +
                '• `player_score` — The player\'s final match score\n' +
                '• `opponent_score` — The opponent\'s final match score\n' +
                '• `result` — Pass ✅ or Fail ❌\n\n' +
                '**Usage Example:**\n' +
                '`/testerstats log tested_user:@Player gamemode:Bedwars player_score:45 opponent_score:32 result:Pass`\n\n' +
                '**What it does:** Records the test in the system so your statistics are tracked.',
              inline: false
            },
            {
              name: '👤 `/testerstats my` — View Your Stats',
              value: 'Check your personal testing statistics.\n\n' +
                '**What you\'ll see:**\n' +
                '• Total number of players you\'ve tested\n' +
                '• Number of passes and fails\n' +
                '• Your pass rate percentage\n' +
                '• Stats broken down by gamemode\n\n' +
                '**Usage Example:**\n' +
                '`/testerstats my`\n\n' +
                '**What it does:** Displays all your testing stats at a glance.',
              inline: false
            }
          )
          .setFooter({ text: 'Page 1 of 2 — Continue scrolling' }),

        new EmbedBuilder()
          .setColor('#3b82f6')
          .setTitle('📖 Tester Commands Help Guide (continued)')
          .setDescription('━━━━━━━━━━━━━━━━━━━━━')
          .addFields(
            {
              name: '📋 `/testerstats view` — View Another Tester\'s Stats',
              value: 'Check the statistics of another tester.\n\n' +
                '**Required Fields:**\n' +
                '• `tester` — The tester you want to view\n\n' +
                '**What you\'ll see:**\n' +
                '• Their total number of players tested\n' +
                '• Their passes and fails\n' +
                '• Their pass rate percentage\n' +
                '• Their stats per gamemode\n\n' +
                '**Usage Example:**\n' +
                '`/testerstats view tester:@OtherTester`',
              inline: false
            },
            {
              name: '🏆 `/testerstats leaderboard` — Tester Leaderboard',
              value: 'See how all testers rank compared to each other.\n\n' +
                '**What you\'ll see:**\n' +
                '• Top 15 testers ranked by total tested\n' +
                '• 🥇 🥈 🥉 medals for top 3\n' +
                '• Total tested, passes, fails per tester\n' +
                '• Pass rate percentage for each\n\n' +
                '**Usage Example:**\n' +
                '`/testerstats leaderboard`\n\n' +
                '**Tip:** Compete with other testers to become #1 tester on the leaderboard!',
              inline: false
            }
          )
          .addFields(
            {
              name: '💡 Tips for Testers',
              value: '✅ Always log your tests immediately after\n' +
                '✅ Provide accurate scores from the match\n' +
                '✅ Check your stats regularly with `/testerstats my`\n' +
                '✅ Compete on the leaderboard with `/testerstats leaderboard`',
              inline: false
            }
          )
          .setFooter({ text: 'Page 2 of 2' })
      ];

      return await interaction.editReply({ embeds });
    } catch (error) {
      console.error('Error in testerhelp command:', error);
      return await interaction.editReply({
        content: `❌ Error: ${error.message}`
      });
    }
  }
};
