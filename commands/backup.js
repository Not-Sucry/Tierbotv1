const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const { getDb, saveDatabase } = require('../database/connection');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('backup')
    .setDescription('💾 Backup and export ranking data')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .addStringOption(option =>
      option
        .setName('action')
        .setDescription('What to do with the backup')
        .setRequired(true)
        .addChoices(
          { name: 'Create Backup', value: 'create' },
          { name: 'List Backups', value: 'list' },
          { name: 'Restore from Backup', value: 'restore' },
          { name: 'Export as CSV', value: 'export' }
        )
    ),

  execute: async (interaction) => {
    await interaction.deferReply();

    try {
      const action = interaction.options.getString('action');
      const backupDir = path.join(__dirname, '../backups');

      // Create backups directory if it doesn't exist
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      if (action === 'create') {
        const db = getDb();
        saveDatabase();
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupName = `backup_${timestamp}.db`;
        const backupPath = path.join(backupDir, backupName);
        
        const dbPath = path.join(__dirname, '../database/pvp_ranks.db');
        fs.copyFileSync(dbPath, backupPath);

        const embed = new EmbedBuilder()
          .setColor('#10b981')
          .setTitle('✅ Backup Created')
          .setDescription('━━━━━━━━━━━━━━━━━━━━━')
          .addFields(
            { name: '💾 Backup Name', value: `\`${backupName}\``, inline: false },
            { name: '📁 Location', value: `\`backups/${backupName}\``, inline: false },
            { name: '⏰ Timestamp', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false },
            { name: '✨ Status', value: '**Successfully backed up** ✓', inline: false }
          )
          .setFooter({ text: '🔒 Your data is safe' })
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

      } else if (action === 'list') {
        const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.db')).sort().reverse();
        
        if (files.length === 0) {
          return await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setColor('#ef4444')
                .setTitle('📭 No Backups Found')
                .setDescription('━━━━━━━━━━━━━━━━━━━━━')
                .addFields({
                  name: '💾 Backup List',
                  value: 'No backups have been created yet. Use `/backup create` to make one!',
                  inline: false
                })
            ]
          });
        }

        const filesList = files.map((f, i) => `**${i + 1}.** \`${f}\``).join('\n');

        const embed = new EmbedBuilder()
          .setColor('#3b82f6')
          .setTitle('📋 Backup List')
          .setDescription('━━━━━━━━━━━━━━━━━━━━━\n' + filesList)
          .setFooter({ text: `📦 Total: ${files.length} backup(s)` })
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

      } else if (action === 'export') {
        const db = getDb();
        const result = db.exec('SELECT user_id, gamemode, rank, updated_at FROM current_ranks ORDER BY user_id, gamemode');

        if (!result[0]?.values) {
          return await interaction.editReply('📭 No ranking data to export.');
        }

        let csvContent = 'User ID,Gamemode,Rank,Updated At\n';
        result[0].values.forEach(row => {
          csvContent += `${row[0]},${row[1]},${row[2]},${row[3]}\n`;
        });

        const timestamp = new Date().toISOString().split('T')[0];
        const csvPath = path.join(backupDir, `rankings_export_${timestamp}.csv`);
        fs.writeFileSync(csvPath, csvContent);

        const embed = new EmbedBuilder()
          .setColor('#8b5cf6')
          .setTitle('📊 Rankings Exported')
          .setDescription('━━━━━━━━━━━━━━━━━━━━━')
          .addFields(
            { name: '📄 File Name', value: `\`rankings_export_${timestamp}.csv\``, inline: false },
            { name: '📝 Records', value: `**${result[0].values.length}** rank entries`, inline: true },
            { name: '💾 Format', value: '**CSV** (Spreadsheet)', inline: true },
            { name: '📁 Location', value: `\`backups/rankings_export_${timestamp}.csv\``, inline: false }
          )
          .setFooter({ text: '✨ Export complete' })
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

      } else if (action === 'restore') {
        const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.db')).sort().reverse();
        
        if (files.length === 0) {
          return await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setColor('#ef4444')
                .setTitle('📭 No Backups Found')
                .setDescription('━━━━━━━━━━━━━━━━━━━━━')
                .addFields({
                  name: '💾 Backup List',
                  value: 'No backups available to restore from.',
                  inline: false
                })
            ]
          });
        }

        const displayList = files.slice(0, 5).map((f, i) => `**${i + 1}.** \`${f}\``).join('\n');
        const buttons = files.slice(0, 5).map((file, idx) =>
          new ButtonBuilder()
            .setCustomId(`restore_${idx}`)
            .setLabel(`Restore ${idx + 1}`)
            .setStyle(ButtonStyle.Danger)
        );

        const row = new ActionRowBuilder().addComponents(buttons);

        const embed = new EmbedBuilder()
          .setColor('#f59e0b')
          .setTitle('⚠️ Restore from Backup')
          .setDescription('━━━━━━━━━━━━━━━━━━━━━\n' + displayList)
          .addFields({
            name: '🔴 WARNING',
            value: 'This will **overwrite current data**. Cannot be undone!',
            inline: false
          })
          .setFooter({ text: `📦 ${files.length} backup(s) available` })
          .setTimestamp();

        await interaction.editReply({ embeds: [embed], components: [row] });
      }

    } catch (err) {
      console.error('❌ Backup error:', err);
      await interaction.editReply(`❌ Error: ${err.message}`);
    }
  }
};
