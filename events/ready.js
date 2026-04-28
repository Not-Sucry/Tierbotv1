module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`[Bot] Logged in as ${client.user.tag}`);
    console.log(`[Bot] Serving ${client.guilds.cache.size} guild(s)`);
    client.user.setActivity('Fakepxiel tier test', { type: 3 /* Watching */ });
  },
};
