# 🏆 PvP Rank Bot — Setup Guide

A premium Discord PvP rank testing bot with MySQL, leaderboards, staff protection, and anti-abuse systems.

---

## 📁 File Structure

```
pvp-rank-bot/
├── commands/
│   ├── tier/
│   │   ├── set.js        ← /tier set logic
│   │   ├── view.js       ← /tier view logic
│   │   └── remove.js     ← /tier remove logic
│   ├── tier.js           ← /tier parent command (router)
│   └── leaderboard.js    ← /leaderboard command
├── events/
│   ├── ready.js          ← Bot ready event
│   └── interactionCreate.js ← Slash command handler
├── utils/
│   ├── cooldowns.js      ← Staff & target cooldown system
│   ├── embeds.js         ← All embed builders
│   └── roleManager.js    ← Role create/assign/remove
├── database/
│   ├── connection.js     ← MySQL connection pool
│   └── queries.js        ← All SQL queries
├── services/
│   ├── rankService.js    ← Core rank apply/remove logic
│   └── logService.js     ← Staff log channel sender
├── config.js             ← Centralised config (reads .env)
├── index.js              ← Bot entry point
├── deploy-commands.js    ← Slash command registration
├── schema.sql            ← MySQL table definitions
├── package.json
└── .env.example
```

---

## ⚙️ Setup Instructions

### 1. Clone / download and install dependencies

```bash
npm install
```

### 2. Create your Discord bot

1. Go to [discord.com/developers/applications](https://discord.com/developers/applications)
2. Click **New Application** → give it a name
3. Go to **Bot** tab → click **Add Bot**
4. Enable these **Privileged Gateway Intents**:
   - ✅ Server Members Intent
5. Go to **OAuth2 → URL Generator**:
   - Scopes: `bot`, `applications.commands`
   - Bot Permissions: `Manage Roles`, `Send Messages`, `Embed Links`
6. Use the generated URL to invite the bot to your server
7. Copy your **Bot Token** and **Application ID** (Client ID)

### 3. Set up MySQL

```bash
mysql -u root -p < schema.sql
```

This creates the `pvp_ranks` database and both tables automatically.

### 4. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
BOT_TOKEN=your_bot_token_here
CLIENT_ID=your_application_id_here
GUILD_ID=your_server_id_here

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=pvp_ranks

STAFF_ROLE_ID=id_of_your_staff_role
LOG_CHANNEL_ID=id_of_your_log_channel
```

> **How to get IDs:** In Discord, enable Developer Mode (User Settings → Advanced), then right-click any role/channel/server and click "Copy ID".

### 5. Register slash commands

```bash
# Deploy to your guild instantly (recommended for testing)
npm run deploy

# Deploy globally (takes up to 1 hour to propagate)
npm run deploy:global
```

### 6. Start the bot

```bash
npm start

# Or with auto-restart on file changes (Node 18+):
npm run dev
```

---

## 🤖 Commands

| Command | Description | Staff Only |
|---|---|---|
| `/tier set gamemode rank user` | Assign a rank to a player | ✅ |
| `/tier view user` | View a player's current ranks | ❌ |
| `/tier remove user gamemode` | Remove a player's rank | ✅ |
| `/leaderboard` | Show top 10 players by points | ❌ |

### Rank Point Values
| Rank | Points |
|---|---|
| S | 4 |
| A | 3 |
| B | 2 |
| C | 1 |

---

## 🛡️ Anti-Abuse System

- **Staff cooldown:** 10 seconds between any `/tier set` uses per staff member
- **Target cooldown:** 30 seconds before the same player can be re-ranked
- **Spam logging:** 3+ blocked attempts within a minute are logged to console

Cooldown values can be adjusted in `config.js`:
```js
cooldowns: {
  staff: 10_000,        // ms
  targetPlayer: 30_000, // ms
}
```

---

## 🗄️ Database Tables

**`rank_history`** — Full audit log of every rank ever assigned  
**`current_ranks`** — Current active rank per user per gamemode

---

## 🔧 Customisation

**Add new gamemodes** — edit the `gamemodes` array in `config.js`:
```js
gamemodes: ['bedfight', 'boxing', 'nodebuff', 'skywars'],
```

**Change role colours** — edit the `colors` object in `utils/roleManager.js`

**Change rank point values** — edit the `ranks` object in `config.js`:
```js
ranks: { S: 4, A: 3, B: 2, C: 1 },
```

---

## ⚠️ Important Notes

- The bot's role in the Discord server **must be above** the A/B/C/S Rank roles in the role hierarchy, otherwise it cannot assign them
- The `STAFF_ROLE_ID` must be set or all rank commands will be blocked
- The `LOG_CHANNEL_ID` is optional — if missing, logging silently skips
