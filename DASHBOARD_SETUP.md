# 🎨 Dashboard Setup Guide

## Step 1: Get Discord OAuth2 Secret

1. **Go to Discord Developer Portal:**
   - Visit: https://discord.com/developers/applications/1492587916881297611/oauth2
   
2. **Generate OAuth2 Secret:**
   - Click the **"New Secret"** button
   - Copy the generated secret
   
3. **Set Redirect URL:**
   - Add this redirect URI under "Valid OAuth2 Redirect URIs":
   ```
   http://localhost:3001/auth/callback
   ```

4. **Add to .env:**
   - Open `.env` and replace:
   ```env
   OAUTH_CLIENT_SECRET=YOUR_SECRET_HERE
   ```

## Step 2: Install Dependencies

Run this in the project root:

```bash
cd "c:\Users\notsu\Documents\tierbot\pvp-rank-bot\pvp-rank-bot"
npm install
```

This will install:
- `axios` - HTTP client
- `express-session` - Session management  
- `socket.io` - Real-time updates
- Other required packages

## Step 3: Run Both Services

### Terminal 1: Discord Bot
```bash
"C:\Program Files\nodejs\node.exe" index.js
```

You should see:
```
✅ Ready as @YourBotName
```

### Terminal 2: Dashboard Server
```bash
"C:\Program Files\nodejs\node.exe" dashboard.js
```

You should see:
```
🎨 PvP Tier Dashboard Running
📍 Dashboard: http://localhost:3001/
```

## Step 4: Access Dashboard

1. Open: **http://localhost:3001/**
2. Click **"🔐 Login with Discord"**
3. Authorize with your Discord account
4. ✅ Make sure you have the **Staff** role in your Discord server!

## Features

✨ **Real-time Leaderboard**
- See top 10 players with live updates
- Points calculated from rank values

🎯 **One-Click Rank Management**
- Click a player on leaderboard
- Select gamemode + rank to update instantly
- No page refresh needed (WebSocket powered)

🔐 **Staff-Only Access**
- Only players with the **Staff** role can log in
- Discord OAuth verification required
- Rank updates logged automatically

## Troubleshooting

**❌ "You must have the Staff role"**
- Make sure you have the Staff role (ID: 1490690065175810068) in your Discord server
- Ask a server admin to assign it to you

**❌ Dashboard won't connect**
- Make sure `.env` has correct `OAUTH_CLIENT_SECRET`
- Check that port 3001 is not blocked by firewall
- Verify both bot and dashboard are running

**❌ "Invalid OAuth redirect URI"**
- Make sure you added the exact URI to Discord Developer Portal:
  ```
  http://localhost:3001/auth/callback
  ```

## Architecture

```
Browser (Client)
    ↓
Dashboard Server (Express + OAuth2)
    ↓
Bot API (Query database)
    ↓
SQLite Database (pvp_ranks.db)

Real-time: WebSocket (Socket.io) for instant leaderboard updates
```

Happy ranking! 🎮
