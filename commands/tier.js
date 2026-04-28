const { SlashCommandBuilder } = require('discord.js');
const setCmd    = require('./tier/set');
const viewCmd   = require('./tier/view');
const removeCmd = require('./tier/remove');
const retierCmd = require('./tier/retier');
const infoCmd   = require('./tier/info');
const criteriaCmd = require('./tier/criteria');

// Build the parent /tier command and attach all subcommands
const data = new SlashCommandBuilder()
  .setName('tier')
  .setDescription('PvP rank management commands.')
  .setDefaultMemberPermissions(null)
  .addSubcommand(setCmd.data)
  .addSubcommand(viewCmd.data)
  .addSubcommand(removeCmd.data)
  .addSubcommand(retierCmd.data)
  .addSubcommand(infoCmd.data)
  .addSubcommand(criteriaCmd.data);

// Subcommand router
async function execute(interaction) {
  const sub = interaction.options.getSubcommand();
  if (sub === 'set')    return setCmd.execute(interaction);
  if (sub === 'view')   return viewCmd.execute(interaction);
  if (sub === 'remove') return removeCmd.execute(interaction);
  if (sub === 'retier') return retierCmd.execute(interaction);
  if (sub === 'info')   return infoCmd.execute(interaction);
  if (sub === 'criteria') return criteriaCmd.execute(interaction);
}

module.exports = { data, execute };
