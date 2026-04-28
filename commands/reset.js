const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getDb, saveDatabase } = require('../database/connection');
const { removeAllRankRoles } = require('../utils/roleManager');

// Owner user ID - only this user can use this command
const OWNER_ID = '1165962426081091594';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reset')
    .setDescription('🔄 Reset all tier rankings (Owner only)')
    .addSubcommand(subcommand =>
      subcommand
        .setName('all')
        .setDescription('Remove all tier roles and clear database')
    ),

  execute: async (interaction) => {
    // Check if user is the owner
    if (interaction.user.id !== OWNER_ID) {
      return await interaction.reply({
        content: '❌ You do not have permission to use this command.',
        ephemeral: true
      });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const subcommand = interaction.options.getSubcommand();

      if (subcommand === 'all') {
        const guild = interaction.guild;
        let rolesRemoved = 0;
        let membersProcessed = 0;

        // Get all members
        await guild.members.fetch();
        const members = guild.members.cache;

        // Remove tier roles from all members
        for (const [, member] of members) {
          try {
            const removed = await removeAllRankRoles(member);
            if (removed.length > 0) {
              rolesRemoved += removed.length;
            }
            membersProcessed++;
          } catch (err) {
            console.error(`Failed to remove roles from ${member.user.tag}:`, err);
          }
        }

        // Clear all ranks from database
        const db = getDb();
        db.run(`DELETE FROM current_ranks`);
        db.run(`DELETE FROM rank_history`);
        saveDatabase();

        const embed = new EmbedBuilder()
          .setColor('#ff6b6b')
          .setTitle('🔄 All Tiers Reset')
          .setDescription('━━━━━━━━━━━━━━━━━━━━━')
          .addFields(
            { name: 'Members Processed', value: membersProcessed.toString(), inline: true },
            { name: 'Roles Removed', value: rolesRemoved.toString(), inline: true },
            { name: 'Database', value: '✅ Cleared', inline: true },
            { name: 'Status', value: '✅ Reset Complete', inline: false }
          )
          .setTimestamp();

        return await interaction.editReply({
          embeds: [embed]
        });
      }
    } catch (error) {
      console.error('Reset command error:', error);
      return await interaction.editReply({
        content: `❌ Error: ${error.message}`,
        ephemeral: true
      });
    }
  }
};
