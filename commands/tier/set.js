const { SlashCommandSubcommandBuilder } = require('discord.js');
const config = require('../../config');
const { applyRank } = require('../../services/rankService');
const { botCanManageRoles } = require('../../utils/roleManager');
const { promotionEmbed, errorEmbed } = require('../../utils/embeds');
const { getUserRanks } = require('../../database/queries');
const { createPromotionMessage, createDemotionMessage, createFailedMessage } = require('../../utils/rankMessageTemplates');
const {
  checkStaffCooldown,
  checkTargetCooldown,
  stampCooldowns,
  trackSpamAttempt,
} = require('../../utils/cooldowns');

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName('set')
    .setDescription('Assign a PvP rank to a player.')
    .addStringOption(opt =>
      opt.setName('gamemode')
        .setDescription('The gamemode being tested')
        .setRequired(true)
        .addChoices(
          { name: 'Bedfight', value: 'bedfight' },
          { name: 'Sumo', value: 'sumo' },
          { name: 'The Classic', value: 'the_classic' },
          { name: 'The Bridge', value: 'the_bridge' },
        ))
    .addStringOption(opt =>
      opt.setName('rank')
        .setDescription('The rank to assign (D to S++)')
        .setRequired(true)
        .addChoices(
          { name: 'S++ Rank (Top 1%)', value: 'S++' },
          { name: 'S+ Rank', value: 'S+' },
          { name: 'S Rank', value: 'S' },
          { name: 'S- Rank', value: 'S-' },
          { name: 'A+ Rank', value: 'A+' },
          { name: 'A Rank', value: 'A' },
          { name: 'A- Rank', value: 'A-' },
          { name: 'B+ Rank', value: 'B+' },
          { name: 'B Rank', value: 'B' },
          { name: 'B- Rank', value: 'B-' },
          { name: 'C+ Rank', value: 'C+' },
          { name: 'C Rank', value: 'C' },
          { name: 'C- Rank', value: 'C-' },
          { name: 'D+ Rank', value: 'D+' },
          { name: 'D Rank', value: 'D' },
        ))
    .addUserOption(opt =>
      opt.setName('user')
        .setDescription('The player being ranked')
        .setRequired(true))
    .addUserOption(opt =>
      opt.setName('opponent')
        .setDescription('The opponent in the match')
        .setRequired(true))
    .addIntegerOption(opt =>
      opt.setName('opponent_score')
        .setDescription('Opponent\'s match score')
        .setRequired(true)
        .setMinValue(0))
    .addIntegerOption(opt =>
      opt.setName('player_score')
        .setDescription('Player\'s match score')
        .setRequired(true)
        .setMinValue(0)),

  async execute(interaction) {
    await interaction.deferReply();

    const staff  = interaction.member;
    const target = interaction.options.getMember('user');
    const rank   = interaction.options.getString('rank').toUpperCase();
    const rawMode = interaction.options.getString('gamemode').toLowerCase().trim();

    // ── 1. Staff role guard ──────────────────────────────────────────────────
    const isStaff = staff.roles.cache.has(config.staffRoleId);
    const isTierTester = staff.roles.cache.has(config.tierTesterRoleId);
    if (!isStaff && !isTierTester) {
      return interaction.editReply({
        embeds: [errorEmbed('You need the **Staff** or **Tier Tester** role to use this command.')],
      });
    }

    const isSelfRanking = staff.id === target.id;

    // ── 2. Gamemode validation ───────────────────────────────────────────────
    if (!config.gamemodes.includes(rawMode)) {
      return interaction.editReply({
        embeds: [errorEmbed(
          `\`${rawMode}\` is not a valid gamemode.\nValid options: ${config.gamemodes.map(g => `\`${g}\``).join(', ')}`
        )],
      });
    }

    // ── 3. Rank validation ───────────────────────────────────────────────────
    if (!config.ranks[rank]) {
      return interaction.editReply({
        embeds: [errorEmbed('Invalid rank. Choose from: `D`, `D+`, `C-`, `C`, `C+`, `B-`, `B`, `B+`, `A-`, `A`, `A+`, `S-`, `S`, `S+`, `S++`.')],
      });
    }

    // ── 4. Target must be a valid guild member ───────────────────────────────
    if (!target) {
      return interaction.editReply({
        embeds: [errorEmbed('That user could not be found in this server.')],
      });
    }

    // ── 5. Anti-abuse: staff cooldown (only for staff ranking others) ────────
    if (isStaff && !isSelfRanking) {
      const staffRemaining = checkStaffCooldown(staff.id);
      if (staffRemaining !== null) {
        const spamCount = trackSpamAttempt(staff.id);
        if (spamCount >= 3) {
          console.warn(`[SPAM] Staff ${staff.id} (${staff.user.tag}) hit spam threshold.`);
        }
        const secs = (staffRemaining / 1000).toFixed(1);
        return interaction.editReply({
          embeds: [errorEmbed(`You're using commands too fast. Please wait **${secs}s** before trying again.`)],
        });
      }
    }

    // ── 6. Anti-abuse: target cooldown (skip for self-ranking) ───────────────
    if (!isSelfRanking) {
      const targetRemaining = checkTargetCooldown(target.id);
      if (targetRemaining !== null) {
        const secs = (targetRemaining / 1000).toFixed(1);
        return interaction.editReply({
          embeds: [errorEmbed(
            `<@${target.id}> was ranked very recently. Please wait **${secs}s** before ranking them again.`
          )],
        });
      }
    }

    // ── 7. Bot permission check ──────────────────────────────────────────────
    if (!botCanManageRoles(interaction.guild)) {
      return interaction.editReply({
        embeds: [errorEmbed('I need the **Manage Roles** permission to assign ranks.')],
      });
    }

    // ── 8. Apply rank ────────────────────────────────────────────────────────
    try {
      // Get previous rank if it exists
      const previousRanks = getUserRanks(target.id);
      const previousRank = previousRanks.find(r => r.gamemode === rawMode)?.rank || null;

      await applyRank(interaction.client, {
        guild:    interaction.guild,
        target,
        staff,
        gamemode: rawMode,
        rank,
      });

      stampCooldowns(staff.id, target.id);

      // Get opponent and scores
      const opponent = interaction.options.getMember('opponent')?.user;
      const opponentScore = interaction.options.getInteger('opponent_score');
      const playerScore = interaction.options.getInteger('player_score');

      // Determine result type (promotion/demotion/failed)
      let resultType = 'promotion'; // default
      if (previousRank) {
        const rankValues = Object.keys(config.ranks);
        const previousIndex = rankValues.indexOf(previousRank);
        const currentIndex = rankValues.indexOf(rank);
        
        if (currentIndex < previousIndex) {
          resultType = 'demotion';
        }
        // If same rank or no previous rank, it's a promotion
      }

      // Generate message using Hypixel-style template
      let msg;
      const messageData = {
        player: `<@${target.id}>`,
        opponent: opponent ? `<@${opponent.id}>` : 'Unknown Opponent',
        scorePlayer: playerScore !== null ? playerScore : '?',
        scoreOpponent: opponentScore !== null ? opponentScore : '?',
        rank,
        gamemode: rawMode,
      };

      if (resultType === 'demotion') {
        msg = createDemotionMessage(messageData);
      } else {
        msg = createPromotionMessage(messageData);
      }

      // Send to results channel
      try {
        const resultsChannel = await interaction.client.channels.fetch(config.resultsChannelId);
        if (resultsChannel && resultsChannel.isSendable()) {
          await resultsChannel.send(msg);
        }
      } catch (channelErr) {
        console.warn(`[Results] Could not send to channel ${config.resultsChannelId}:`, channelErr.message);
      }

      // Send DM to player
      try {
        const displayMode = rawMode.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        const dmMessage = resultType === 'demotion' 
          ? `⚠️ **Rank Adjustment**\n\nYour rank in **${displayMode}** has been adjusted to **${rank}**.\n\nFocus on improving your mechanics, consistency, and game sense. You've got this! 💪`
          : `🎉 **Rank Update**\n\nCongratulations! You've been promoted to **${rank} Rank** in **${displayMode}**!\n\nGreat performance! GGs! 🏆`;
        await target.user.send(dmMessage);
      } catch (dmErr) {
        console.warn(`[DM] Could not send DM to ${target.user.tag}:`, dmErr.message);
      }

      return interaction.editReply({
        content: promotionMsg,
      });
    } catch (err) {
      console.error('[/tier set] Error:', err);
      return interaction.editReply({
        embeds: [errorEmbed('An error occurred while applying the rank. Check my role hierarchy and permissions.')],
      });
    }
  },
};
