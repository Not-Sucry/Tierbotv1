/**
 * 🎨 fakepixel tier test Dashboard Server
 * Staff portal with Discord OAuth, real-time leaderboard, and rank management
 */

const express = require('express');
const session = require('express-session');
const axios = require('axios');
const { createServer } = require('http');
const { Server: IOServer } = require('socket.io');
const path = require('path');
require('dotenv').config();

const config = require('./config');
const { getDb, testConnection } = require('./database/connection');
const { getUserRanks, getDetailedLeaderboard, upsertCurrentRank, removeRank } = require('./database/queries');

const app = express();
const httpServer = createServer(app);
const io = new IOServer(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const DASHBOARD_PORT = process.env.DASHBOARD_PORT || 3001;
const OAUTH_CLIENT_ID = process.env.CLIENT_ID;
const OAUTH_CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET;
const OAUTH_REDIRECT_URI = `http://localhost:${DASHBOARD_PORT}/auth/callback`;

// ────────────────────────────────────────────────────────────────────────────
// 🔐 MIDDLEWARE
// ────────────────────────────────────────────────────────────────────────────

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }
}));

// ────────────────────────────────────────────────────────────────────────────
// 🔐 OAUTH & AUTH
// ────────────────────────────────────────────────────────────────────────────

/**
 * Root landing page - serve new leaderboard
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'leaderboard.html'));
});

/**
 * Redirect user to Discord OAuth login
 */
app.get('/auth/login', (req, res) => {
  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${OAUTH_CLIENT_ID}&redirect_uri=${encodeURIComponent(OAUTH_REDIRECT_URI)}&response_type=code&scope=identify%20guilds.members.read`;
  res.redirect(discordAuthUrl);
});

/**
 * Handle OAuth callback
 */
app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('Missing authorization code');

  try {
    console.log('🔄 OAuth callback received, exchanging code for token...');
    
    // Exchange code for access token
    const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', {
      client_id: OAUTH_CLIENT_ID,
      client_secret: OAUTH_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: OAUTH_REDIRECT_URI,
      scope: 'identify guilds.members.read'
    });

    const { access_token } = tokenResponse.data;
    console.log('✅ Token exchange successful');

    // Fetch user info
    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const user = userResponse.data;
    console.log(`✅ User fetched: ${user.username} (${user.id})`);

    // Fetch guild member info to check roles
    console.log(`🔍 Checking roles for user ${user.id} in guild ${config.guildId}...`);
    const memberResponse = await axios.get(`https://discord.com/api/guilds/${config.guildId}/members/${user.id}`, {
      headers: { Authorization: `Bot ${process.env.BOT_TOKEN}` }
    });

    const member = memberResponse.data;
    console.log(`✅ Member roles: ${member.roles.join(', ')}`);
    console.log(`🔎 Looking for staff role: ${config.staffRoleId}`);
    
    const isStaff = member.roles.includes(config.staffRoleId);

    if (!isStaff) {
      console.warn(`❌ User ${user.username} lacks staff role`);
      return res.status(403).send('❌ You must have the Staff role to access this dashboard.');
    }

    // Store in session
    req.session.user = {
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      isStaff: true
    };

    console.log(`✅ Session created for ${user.username}`);
    res.redirect('/dashboard');
  } catch (err) {
    console.error('❌ OAuth Error:', err.response?.data || err.message);
    const errorMsg = err.response?.data?.error_description || err.message;
    res.status(500).send(`Authentication failed: ${errorMsg}`);
  }
});

/**
 * Logout
 */
app.get('/auth/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// ────────────────────────────────────────────────────────────────────────────
// 🔒 PROTECTED ROUTES
// ────────────────────────────────────────────────────────────────────────────

const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

/**
 * Serve protected dashboard
 */
app.get('/dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

/**
 * API: Get current user info
 */
app.get('/api/user', requireAuth, (req, res) => {
  res.json(req.session.user);
});

/**
 * API: Get leaderboard (PUBLIC)
 */
app.get('/api/leaderboard', (req, res) => {
  try {
    const leaderboard = getDetailedLeaderboard();
    res.json(leaderboard);
  } catch (err) {
    console.error('❌ Leaderboard Error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * API: Get player ranks
 */
app.get('/api/player/:userId/ranks', requireAuth, (req, res) => {
  try {
    const ranks = getUserRanks(req.params.userId);
    res.json(ranks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * API: Update player rank
 */
app.post('/api/rank/set', requireAuth, (req, res) => {
  const { userId, gamemode, rank } = req.body;

  if (!userId || !gamemode || !rank) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!config.gamemodes.includes(gamemode)) {
    return res.status(400).json({ error: 'Invalid gamemode' });
  }

  if (!config.ranks[rank]) {
    return res.status(400).json({ error: 'Invalid rank' });
  }

  try {
    upsertCurrentRank(userId, gamemode, rank);
    
    // Broadcast update to all connected clients
    io.emit('rankUpdated', { userId, gamemode, rank });

    res.json({ success: true, message: `Updated ${userId} to ${rank} ${gamemode}` });
  } catch (err) {
    console.error('❌ Rank Update Error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * API: Remove player rank
 */
app.post('/api/rank/remove', requireAuth, (req, res) => {
  const { userId, gamemode } = req.body;

  if (!userId || !gamemode) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    removeRank(userId, gamemode);
    
    // Broadcast update to all connected clients
    io.emit('rankRemoved', { userId, gamemode });

    res.json({ success: true, message: `Removed ${gamemode} tier from ${userId}` });
  } catch (err) {
    console.error('❌ Rank Removal Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// 🔌 WEBSOCKET EVENTS (Real-time Updates)
// ────────────────────────────────────────────────────────────────────────────

io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  // Send initial leaderboard
  try {
    const leaderboard = getDetailedLeaderboard();
    socket.emit('leaderboardUpdate', leaderboard);
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
  }

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// 🚀 START SERVER
// ────────────────────────────────────────────────────────────────────────────

(async () => {
  try {
    // Initialize database
    await testConnection();

    httpServer.listen(DASHBOARD_PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║         🎨 fakepixel tier test Dashboard Running           ║
║                                                            ║
║  📍 Dashboard:   http://localhost:${DASHBOARD_PORT}/                   ║
║  🔐 Login:       http://localhost:${DASHBOARD_PORT}/auth/login         ║
║                                                            ║
║  ⚙️  Make sure OAUTH_CLIENT_SECRET is set in .env         ║
╚════════════════════════════════════════════════════════════╝
  `);
    });
  } catch (err) {
    console.error('❌ Failed to start dashboard:', err.message);
    process.exit(1);
  }
})();

module.exports = { app, io };
