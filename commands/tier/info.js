const { SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config');

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName('info')
    .setDescription('Show the complete tier system guide with point values.'),

  async execute(interaction) {
    await interaction.deferReply();

    const tiers = [
      { name: 'S++', emoji: '👑', points: 8.0, description: 'Top 1% - Elite' },
      { name: 'S+', emoji: '⭐', points: 7.5, description: 'Exceptional' },
      { name: 'S', emoji: '✨', points: 7.0, description: 'Superior' },
      { name: 'S-', emoji: '🌟', points: 6.5, description: 'Advanced Elite' },
      { name: 'A+', emoji: '🔥', points: 6.0, description: 'Master' },
      { name: 'A', emoji: '🔴', points: 5.5, description: 'Expert' },
      { name: 'A-', emoji: '🟠', points: 5.0, description: 'Advanced' },
      { name: 'B+', emoji: '💧', points: 4.5, description: 'Proficient+' },
      { name: 'B', emoji: '🔵', points: 4.0, description: 'Proficient' },
      { name: 'B-', emoji: '🟦', points: 3.5, description: 'Intermediate+' },
      { name: 'C+', emoji: '🟢', points: 3.0, description: 'Competent+' },
      { name: 'C', emoji: '💚', points: 2.5, description: 'Competent' },
      { name: 'C-', emoji: '🟩', points: 2.0, description: 'Beginner+' },
      { name: 'D+', emoji: '⚫', points: 1.5, description: 'Developing+' },
      { name: 'D', emoji: '◼️', points: 1.0, description: 'Developing' },
    ];

    // Split into sections for better readability
    const embed = new EmbedBuilder()
      .setColor(0xFFD700)
      .setTitle('📋 TIER GUIDE - Point Values & Rankings')
      .setDescription('Complete reference for all 15 tiers in the new sub-tier system')
      .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 256 }));

    // Elite Section (S-tier)
    const eliteText = tiers
      .filter(t => t.name.includes('S'))
      .map(t => `${t.emoji} **${t.name}** → ${t.points} pts (${t.description})`)
      .join('\n');
    embed.addFields({ name: '👑 ELITE TIER', value: eliteText, inline: false });

    // Advanced Section (A-tier)
    const advancedText = tiers
      .filter(t => t.name.includes('A'))
      .map(t => `${t.emoji} **${t.name}** → ${t.points} pts (${t.description})`)
      .join('\n');
    embed.addFields({ name: '🔥 ADVANCED TIER', value: advancedText, inline: false });

    // Intermediate Section (B-tier)
    const intermediateText = tiers
      .filter(t => t.name.includes('B'))
      .map(t => `${t.emoji} **${t.name}** → ${t.points} pts (${t.description})`)
      .join('\n');
    embed.addFields({ name: '💧 INTERMEDIATE TIER', value: intermediateText, inline: false });

    // Beginner Section (C-tier and D-tier)
    const beginnerText = tiers
      .filter(t => t.name.includes('C') || t.name.includes('D'))
      .map(t => `${t.emoji} **${t.name}** → ${t.points} pts (${t.description})`)
      .join('\n');
    embed.addFields({ name: '🟢 BEGINNER TIER', value: beginnerText, inline: false });

    // Summary stats
    const totalTiers = tiers.length;
    const maxPoints = Math.max(...tiers.map(t => t.points));
    embed.addFields({
      name: '📊 Summary',
      value: `Total Tiers: **${totalTiers}**\nMax Points: **${maxPoints}**\nPoint Range: **1.0 - ${maxPoints}**`,
      inline: false
    });

    embed.setFooter({ text: 'PvP Rank Bot v2.0 • Sub-Tier System' });
    embed.setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  },
};
