const { errorEmbed, successEmbed } = require('../utils/embeds');
const { getDb, saveDatabase } = require('../database/connection');
const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    // Handle chat input commands
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        console.warn(`[Bot] Unknown command: ${interaction.commandName}`);
        return;
      }

      try {
        await command.execute(interaction);
      } catch (err) {
        console.error(`[Bot] Error in /${interaction.commandName}:`, err);

        const reply = { embeds: [errorEmbed('An unexpected error occurred. Please try again.')], ephemeral: true };

        if (interaction.deferred || interaction.replied) {
          await interaction.editReply(reply).catch(() => {});
        } else {
          await interaction.reply(reply).catch(() => {});
        }
      }
    }

    // Handle result system button interactions
    if (interaction.isButton() && interaction.customId.startsWith('result_')) {
      const action = interaction.customId.split('_')[1];

      if (action === 'confirm') {
        await interaction.reply({
          embeds: [successEmbed('✅ Result confirmed and logged!')],
          ephemeral: true,
        });
        // TODO: Save result to database
      } else if (action === 'edit') {
        await interaction.reply({
          content: '✏️ Edit functionality coming soon! Please use `/result` again with corrected information.',
          ephemeral: true,
        });
      } else if (action === 'cancel') {
        await interaction.reply({
          embeds: [errorEmbed('Result cancelled.')],
          ephemeral: true,
        });
        // TODO: Delete the embed message
        await interaction.message.delete().catch(() => {});
      }
    }

    // Handle backup restore button interactions
    if (interaction.isButton() && interaction.customId.startsWith('restore_')) {
      await interaction.deferReply();

      try {
        const backupDir = path.join(__dirname, '../backups');
        const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.db')).sort().reverse();
        
        const idx = parseInt(interaction.customId.split('_')[1]);
        if (idx >= files.length) {
          return await interaction.editReply({
            embeds: [errorEmbed('Backup file not found.')]
          });
        }

        const backupFile = files[idx];
        const backupPath = path.join(backupDir, backupFile);
        const dbPath = path.join(__dirname, '../database/pvp_ranks.db');

        // Perform the restore
        fs.copyFileSync(backupPath, dbPath);
        
        // Reload database in memory
        const db = getDb();
        const data = fs.readFileSync(dbPath);
        const SQL = require('sql.js');
        const newDb = new SQL.Database(new Uint8Array(data));

        const embed = new EmbedBuilder()
          .setColor('#10b981')
          .setTitle('✅ Backup Restored')
          .setDescription('━━━━━━━━━━━━━━━━━━━━━')
          .addFields(
            { name: '💾 From Backup', value: `\`${backupFile}\``, inline: false },
            { name: '⏰ Restored At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false },
            { name: '✨ Status', value: '**Successfully restored** ✓', inline: false }
          )
          .setFooter({ text: '🔒 Backup restoration complete' })
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
      } catch (err) {
        console.error('Restore error:', err);
        await interaction.editReply({
          embeds: [errorEmbed(`Restore failed: ${err.message}`)]
        });
      }
    }
  },
};
