const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');
const { getDb } = require('../database/connection');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('analytics')
    .setDescription('📈 View detailed ranking analytics')
    .setDefaultMemberPermissions(null)
    .addStringOption(option =>
      option
        .setName('view')
        .setDescription('What analytics to view')
        .setRequired(true)
        .addChoices(
          { name: 'Overview', value: 'overview' },
          { name: 'Top Players', value: 'top' },
          { name: 'Gamemode Stats', value: 'gamemodes' },
          { name: 'Rank Distribution', value: 'distribution' }
        )
    ),

  execute: async (interaction) => {
    await interaction.deferReply();

    try {
      const db = getDb();
      const view = interaction.options.getString('view');

      if (view === 'overview') {
        const totalRanks = db.exec('SELECT COUNT(*) as count FROM current_ranks')[0]?.values[0]?.[0] || 0;
        const uniquePlayers = db.exec('SELECT COUNT(DISTINCT user_id) as count FROM current_ranks')[0]?.values[0]?.[0] || 0;
        const avgTiers = db.exec('SELECT AVG(tier_count) as avg FROM (SELECT user_id, COUNT(*) as tier_count FROM current_ranks GROUP BY user_id)')[0]?.values[0]?.[0] || 0;
        const totalPoints = db.exec('SELECT SUM((CASE rank WHEN "S" THEN 4 WHEN "A" THEN 3 WHEN "B" THEN 2 ELSE 1 END)) as total FROM current_ranks')[0]?.values[0]?.[0] || 0;

        const embed = new EmbedBuilder()
          .setColor('#ec4899')
          .setTitle('📊 Ranking System Overview')
          .setDescription('━━━━━━━━━━━━━━━━━━━━━')
          .addFields(
            { name: '👥 Unique Players', value: `🎮 **${uniquePlayers}** players`, inline: true },
            { name: '🏆 Total Ranks', value: `⭐ **${totalRanks}** assigned`, inline: true },
            { name: '💎 Total Points', value: `✨ **${totalPoints}** pts`, inline: true },
            { name: '📈 Avg Tiers/Player', value: `📊 **${avgTiers.toFixed(2)}** tiers`, inline: false }
          )
          .setFooter({ text: '✨ Updated just now' })
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

      } else if (view === 'top') {
        const topPlayers = db.exec(`
          SELECT user_id,
            SUM(CASE rank WHEN 'S' THEN 4 WHEN 'A' THEN 3 WHEN 'B' THEN 2 ELSE 1 END) as points,
            COUNT(*) as tier_count
          FROM current_ranks
          GROUP BY user_id
          ORDER BY points DESC
          LIMIT 10
        `);

        if (!topPlayers[0]?.values || topPlayers[0].values.length === 0) {
          return await interaction.editReply('No ranking data available.');
        }

        let topText = '';
        topPlayers[0].values.forEach((row, idx) => {
          const [userId, points, tiers] = row;
          const medals = ['🥇', '🥈', '🥉'];
          const medal = medals[idx] || `#${idx + 1}`;
          topText += `${medal} <@${userId}> • **${points}⭐** (${tiers} 🎯)\n`;
        });

        const embed = new EmbedBuilder()
          .setColor('#f59e0b')
          .setTitle('🏆 Top 10 Players')
          .setDescription('━━━━━━━━━━━━━━━━━━━━━\n' + topText)
          .setFooter({ text: 'Ranked by total points' })
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

      } else if (view === 'gamemodes') {
        const gamemodes = db.exec(`
          SELECT gamemode, COUNT(*) as count,
            SUM(CASE rank WHEN 'S' THEN 4 WHEN 'A' THEN 3 WHEN 'B' THEN 2 ELSE 1 END) as total_points
          FROM current_ranks
          GROUP BY gamemode
          ORDER BY total_points DESC
        `);

        if (!gamemodes[0]?.values || gamemodes[0].values.length === 0) {
          return await interaction.editReply('No gamemode data.');
        }

        const emojis = {
          'bedfight': '🛏️',
          'sumo': '🥋',
          'the_classic': '⚔️',
          'the_bridge': '🌉'
        };

        let gmText = '';
        gamemodes[0].values.forEach(row => {
          const [gm, count, points] = row;
          gmText += `${emojis[gm] || '🎮'} **${gm}**\n   ├─ 🎯 ${count} ranks\n   └─ ⭐ ${points} points\n`;
        });

        const embed = new EmbedBuilder()
          .setColor('#06b6d4')
          .setTitle('🎮 Gamemode Analytics')
          .setDescription('━━━━━━━━━━━━━━━━━━━━━\n' + gmText)
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

      } else if (view === 'distribution') {
        const distribution = db.exec(`
          SELECT rank, COUNT(*) as count,
            ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM current_ranks), 1) as percentage
          FROM current_ranks
          GROUP BY rank
          ORDER BY CASE rank WHEN 'S' THEN 1 WHEN 'A' THEN 2 WHEN 'B' THEN 3 ELSE 4 END
        `);

        if (!distribution[0]?.values || distribution[0].values.length === 0) {
          return await interaction.editReply('No rank data.');
        }

        let distText = '';
        const rankEmojis = { 'S': '⭐', 'A': '🔥', 'B': '💧', 'C': '❄️' };
        let total = 0;

        distribution[0].values.forEach(row => {
          const [rank, count, percentage] = row;
          total += count;
          const bar = '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5));
          distText += `${rankEmojis[rank]} **${rank}** │ ${count} │ \`${bar}\` ${percentage}%\n`;
        });

        const embed = new EmbedBuilder()
          .setColor('#8b5cf6')
          .setTitle('📊 Rank Distribution')
          .setDescription('━━━━━━━━━━━━━━━━━━━━━\n' + distText)
          .setFooter({ text: `Total: ${total} ranks` })
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
      }

    } catch (err) {
      console.error('❌ Analytics error:', err);
      await interaction.editReply(`❌ Error: ${err.message}`);
    }
  }
};
