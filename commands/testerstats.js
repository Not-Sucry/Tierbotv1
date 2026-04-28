const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { logTest, getTesterStats, getTesterGamemodeStats, getAllTesterStats } = require('../database/queries');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('testerstats')
    .setDescription('📊 Tester statistics and tracking')
    .addSubcommand(subcommand =>
      subcommand
        .setName('log')
        .setDescription('📝 Log a test result (Staff only)')
        .addUserOption(option =>
          option
            .setName('tested_user')
            .setDescription('User who was tested')
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
              { name: 'Castle Wars', value: 'castlewars' },
              { name: 'Other', value: 'other' }
            )
        )
        .addStringOption(option =>
          option
            .setName('result')
            .setDescription('Test result')
            .setRequired(true)
            .addChoices(
              { name: '✅ Pass', value: 'pass' },
              { name: '❌ Fail', value: 'fail' }
            )
        )
        .addIntegerOption(option =>
          option
            .setName('player_score')
            .setDescription("Player's match score")
            .setRequired(true)
            .setMinValue(0)
        )
        .addIntegerOption(option =>
          option
            .setName('opponent_score')
            .setDescription("Opponent's match score")
            .setRequired(true)
            .setMinValue(0)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('my')
        .setDescription('👤 View your test statistics')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('view')
        .setDescription('📋 View another tester\'s statistics')
        .addUserOption(option =>
          option
            .setName('tester')
            .setDescription('Tester to view stats for')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('leaderboard')
        .setDescription('🏆 View tester leaderboard (by total tested)')
    ),

  execute: async (interaction) => {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'log') {
      await interaction.deferReply({ ephemeral: true });

      try {
        const testedUser = interaction.options.getUser('tested_user');
        const gamemode = interaction.options.getString('gamemode');
        const result = interaction.options.getString('result');
        const playerScore = interaction.options.getInteger('player_score');
        const opponentScore = interaction.options.getInteger('opponent_score');
        const tester = interaction.user;

        // Log the test
        logTest({
          testerId: tester.id,
          testedUserId: testedUser.id,
          gamemode,
          result
        });

        const resultEmoji = result === 'pass' ? '✅' : '❌';
        const embed = new EmbedBuilder()
          .setColor(result === 'pass' ? '#10b981' : '#ef4444')
          .setTitle(`${resultEmoji} Test Logged`)
          .setDescription('━━━━━━━━━━━━━━━━━━━━━')
          .addFields(
            { name: 'Tester', value: tester.toString(), inline: true },
            { name: 'Tested User', value: testedUser.toString(), inline: true },
            { name: 'Gamemode', value: gamemode.toUpperCase(), inline: true },
            { name: 'Player Score', value: playerScore.toString(), inline: true },
            { name: 'Opponent Score', value: opponentScore.toString(), inline: true },
            { name: 'Result', value: result.toUpperCase(), inline: true }
          )
          .setTimestamp();

        return await interaction.editReply({ embeds: [embed] });
      } catch (error) {
        console.error('Error logging test:', error);
        return await interaction.editReply({
          content: `❌ Error: ${error.message}`,
          ephemeral: true
        });
      }
    }

    if (subcommand === 'my') {
      await interaction.deferReply();

      try {
        const tester = interaction.user;
        const stats = getTesterStats(tester.id);
        const gamemodeStats = getTesterGamemodeStats(tester.id);

        const passRate = stats.total_tested > 0 
          ? ((stats.passed / stats.total_tested) * 100).toFixed(1) 
          : '0.0';

        let gamemodeField = '';
        if (gamemodeStats.length > 0) {
          gamemodeField = gamemodeStats
            .map(g => `**${g.gamemode.toUpperCase()}**: ${g.total_tested} (✅ ${g.passed} | ❌ ${g.failed})`)
            .join('\n');
        } else {
          gamemodeField = 'No test data yet';
        }

        const embed = new EmbedBuilder()
          .setColor('#3b82f6')
          .setTitle(`📊 ${tester.username}'s Test Statistics`)
          .setDescription('━━━━━━━━━━━━━━━━━━━━━')
          .addFields(
            { name: 'Total Tested', value: stats.total_tested.toString(), inline: true },
            { name: 'Passed', value: `✅ ${stats.passed}`, inline: true },
            { name: 'Failed', value: `❌ ${stats.failed}`, inline: true },
            { name: 'Pass Rate', value: `${passRate}%`, inline: true },
            { name: 'Per-Gamemode Stats', value: gamemodeField, inline: false }
          )
          .setThumbnail(tester.displayAvatarURL())
          .setTimestamp();

        return await interaction.editReply({ embeds: [embed] });
      } catch (error) {
        console.error('Error fetching tester stats:', error);
        return await interaction.editReply({
          content: `❌ Error: ${error.message}`
        });
      }
    }

    if (subcommand === 'view') {
      await interaction.deferReply();

      try {
        const tester = interaction.options.getUser('tester');
        const stats = getTesterStats(tester.id);
        const gamemodeStats = getTesterGamemodeStats(tester.id);

        if (stats.total_tested === 0) {
          return await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setColor('#6b7280')
                .setTitle(`📊 ${tester.username}'s Test Statistics`)
                .setDescription('No test data yet.')
            ]
          });
        }

        const passRate = stats.total_tested > 0 
          ? ((stats.passed / stats.total_tested) * 100).toFixed(1) 
          : '0.0';

        const gamemodeField = gamemodeStats
          .map(g => `**${g.gamemode.toUpperCase()}**: ${g.total_tested} (✅ ${g.passed} | ❌ ${g.failed})`)
          .join('\n');

        const embed = new EmbedBuilder()
          .setColor('#3b82f6')
          .setTitle(`📊 ${tester.username}'s Test Statistics`)
          .setDescription('━━━━━━━━━━━━━━━━━━━━━')
          .addFields(
            { name: 'Total Tested', value: stats.total_tested.toString(), inline: true },
            { name: 'Passed', value: `✅ ${stats.passed}`, inline: true },
            { name: 'Failed', value: `❌ ${stats.failed}`, inline: true },
            { name: 'Pass Rate', value: `${passRate}%`, inline: true },
            { name: 'Per-Gamemode Stats', value: gamemodeField, inline: false }
          )
          .setThumbnail(tester.displayAvatarURL())
          .setTimestamp();

        return await interaction.editReply({ embeds: [embed] });
      } catch (error) {
        console.error('Error fetching tester stats:', error);
        return await interaction.editReply({
          content: `❌ Error: ${error.message}`
        });
      }
    }

    if (subcommand === 'leaderboard') {
      await interaction.deferReply();

      try {
        const allTesters = getAllTesterStats();

        if (allTesters.length === 0) {
          return await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setColor('#6b7280')
                .setTitle('🏆 Tester Leaderboard')
                .setDescription('No tester data yet.')
            ]
          });
        }

        const leaderboardText = allTesters
          .slice(0, 15)
          .map((tester, index) => {
            const passRate = tester.total_tested > 0 
              ? ((tester.passed / tester.total_tested) * 100).toFixed(1) 
              : '0.0';
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
            return `${medal} <@${tester.tester_id}> — **${tester.total_tested}** tested (✅ ${tester.passed} | ❌ ${tester.failed}) | ${passRate}%`;
          })
          .join('\n');

        const embed = new EmbedBuilder()
          .setColor('#f59e0b')
          .setTitle('🏆 Tester Leaderboard')
          .setDescription('━━━━━━━━━━━━━━━━━━━━━\n' + leaderboardText)
          .setTimestamp();

        return await interaction.editReply({ embeds: [embed] });
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return await interaction.editReply({
          content: `❌ Error: ${error.message}`
        });
      }
    }
  }
};
