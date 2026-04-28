const { SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName('criteria')
    .setDescription('View the ranking evaluation criteria and factors.'),

  async execute(interaction) {
    await interaction.deferReply();

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('📋 RANKING EVALUATION CRITERIA')
      .setDescription('Rankings are determined through comprehensive match performance evaluation')
      .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 256 }));

    embed.addFields(
      {
        name: '⚙️ MECHANICS',
        value: '• PvP technique and accuracy\n• Ability to land consistent shots/hits\n• Proper weapon usage and item management\n• Technical skill level',
        inline: false
      },
      {
        name: '📊 CONSISTENCY',
        value: '• Performance stability across multiple rounds\n• Reliable decision-making under pressure\n• Minimal mistakes and recoveries\n• Predictable skill application',
        inline: false
      },
      {
        name: '🧠 GAME SENSE',
        value: '• Map awareness and positioning\n• Strategic understanding of matchups\n• Resource management efficiency\n• Prediction and anticipation skills',
        inline: false
      },
      {
        name: '👑 OVERALL DOMINANCE',
        value: '• Control of the match pace\n• Ability to adapt to opponent strategies\n• Mental resilience and composure\n• Leadership and impact on games',
        inline: false
      },
      {
        name: '⚠️ SCORE CONTEXT',
        value: 'While match scores are recorded, **rankings prioritize performance quality** over raw score. A player can achieve a lower score but demonstrate excellent mechanics and game sense, warranting a higher tier.',
        inline: false
      }
    );

    embed.addFields(
      {
        name: '🏆 TIER RANGES',
        value: '**S++ (8.0 pts)** - Elite tier reserved for top 1% exceptional players\n**S-Tier (6.5-7.5 pts)** - Superior competitive players\n**A-Tier (5.0-6.0 pts)** - Advanced skilled players\n**B-Tier (3.5-4.5 pts)** - Intermediate proficient players\n**C-Tier (2.0-3.0 pts)** - Beginner/competent players\n**D-Tier (1.0-1.5 pts)** - Developing players',
        inline: false
      }
    );

    embed.setFooter({ text: 'Fair and comprehensive evaluation ensures incentive for skill development' });
    embed.setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  },
};
