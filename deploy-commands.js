/**
 * deploy-commands.js
 * Run once (or after any command change) to register slash commands with Discord.
 *
 * Usage:
 *   node deploy-commands.js          → deploys to your GUILD_ID (instant, dev)
 *   node deploy-commands.js --global → deploys globally (up to 1h to propagate)
 */

require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs   = require('node:fs');
const path = require('node:path');
const config = require('./config');

const commands = [];

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command.data) {
    commands.push(command.data.toJSON());
    console.log(`Queued: /${command.data.name}`);
  }
}

const rest = new REST({ version: '10' }).setToken(config.token);

const isGlobal = process.argv.includes('--global');
const route = isGlobal
  ? Routes.applicationCommands(config.clientId)
  : Routes.applicationGuildCommands(config.clientId, config.guildId);

(async () => {
  try {
    console.log(`\nDeploying ${commands.length} command(s) ${isGlobal ? 'globally' : `to guild ${config.guildId}`}...`);
    const data = await rest.put(route, { body: commands });
    console.log(`✅  Successfully deployed ${data.length} command(s).`);
  } catch (err) {
    console.error('❌  Deployment failed:', err);
    process.exit(1);
  }
})();
