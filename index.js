require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const express = require('express');
const fs   = require('node:fs');
const path = require('node:path');
const config = require('./config');
const { testConnection } = require('./database/connection');
const tierAPI = require('./api/tierAPI');

// ── Client setup ─────────────────────────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

// ── Commands collection ───────────────────────────────────────────────────────
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
    console.log(`[Commands] Loaded: /${command.data.name}`);
  } else {
    console.warn(`[Commands] Skipping ${file} — missing data or execute export.`);
  }
}

// ── Events ────────────────────────────────────────────────────────────────────
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
  console.log(`[Events] Registered: ${event.name}`);
}

// ── Global error handlers ─────────────────────────────────────────────────────
process.on('unhandledRejection', err => console.error('[Process] Unhandled rejection:', err));
process.on('uncaughtException',  err => console.error('[Process] Uncaught exception:', err));

// ── Boot sequence ─────────────────────────────────────────────────────────────
(async () => {
  await testConnection();          // Initialize SQLite database
  
  // Start Express API server
  const app = express();
  app.use(express.json());
  app.use('/api', tierAPI);
  
  const API_PORT = process.env.API_PORT || 3000;
  app.listen(API_PORT, () => {
    console.log(`[API] Server running on http://localhost:${API_PORT}`);
  });
  
  // Start Discord bot
  await client.login(config.token);
})();
