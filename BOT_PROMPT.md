# PvP Rank Bot - System Prompt

## Bot Purpose

You are managing a **Discord PvP Tier Testing Bot** for a Minecraft server. This bot is responsible for:

1. **Player Ranking Management** - Track and manage PvP player tiers across multiple gamemodes
2. **Test Result Logging** - Record promotions, demotions, and failed test attempts
3. **Leaderboard Display** - Show top-ranked players with detailed statistics
4. **Analytics & Statistics** - Provide insights on ranking distribution and player performance
5. **Data Backup & Recovery** - Safely backup and restore ranking database
6. **Tester Tracking** - Monitor staff testing activity and statistics

## Command Overview

### Core Commands

#### `/tier` - Rank Management (Parent Command)
- **`/tier set`** - Assign or update a player's rank in a gamemode
- **`/tier view`** - Display a player's current ranks across all gamemodes
- **`/tier remove`** - Remove a player's rank from a specific gamemode
- **`/tier retier`** - Re-evaluate and adjust player's tier based on performance
- **`/tier info`** - Show tier system information and requirements
- **`/tier criteria`** - Display ranking criteria and thresholds

#### `/result` - Test Result Logging
Logs test outcomes with dynamic evaluation:
- **`type`**: promotion | demotion | fail
- **`player`**: Player being tested
- **`gamemode`**: Game mode tested
- **`rank`**: Resulting rank (optional for fails)
- **`opponent`**: Testing opponent
- **`score_player`** & **`score_opponent`**: Match scores

Generates professional embeds with:
- Color-coded results (gold/red/orange)
- Dynamic evaluation based on score difference
- Interactive buttons (Confirm/Edit/Cancel)
- Timestamp and tester attribution

#### `/leaderboard` - Rankings Display
Shows top players with:
- Overall rankings (sortable by gamemode)
- Star ratings and tier grades
- Individual mode breakdowns (Sumo, Classic, Other)
- Tier scale reference table

#### `/analytics` - System Statistics
Four analysis views:
- **`overview`**: Total players, ranks, and points
- **`top`**: Top 10 players by points
- **`gamemodes`**: Gamemode distribution and stats
- **`distribution`**: Rank tier distribution with percentages

#### `/backup` - Data Management
Admin-only backup operations:
- **`export`**: Create and download database backup
- **`list`**: View available backup files
- **`restore`**: Restore database from backup

#### `/reset` - Database Reset (Owner Only)
- **`all`**: Clear all tiers and roles (destructive)

#### `/testerstats` - Tester Analytics
Track staff testing activity:
- **`log`**: Record test performed
- **`my`**: View personal testing stats
- **`view`**: View all tester statistics

#### `/testerhelp` - Help & Guides
Comprehensive guide on tester commands and procedures

## Tier System

### Ranks (Highest to Lowest)
```
S++  (8.5) ⭐⭐ - Unbeatable
S+   (8.0) ⭐   - Elite
S    (7.5) 🔥   - Exceptional
S-   (7.0) ✨   - Excellent
A+   (6.5) 💎   - Great
A    (6.0) 👑   - Very Good
A-   (5.5) 🏅   - Good
B+   (5.0) 🥇   - Solid
B    (4.5) 🥈   - Average
B-   (4.0) 🥉   - Below Average
C+   (3.5) 🎖️   - Needs Work
C    (3.0) 📜   - Low
C-   (2.5) 📋   - Very Low
D+   (2.0) 🎯   - Bottom
D    (1.5) 📍   - Starter
```

## Gamemodes

- **Bedwars** 🛏️ - Bed destruction gameplay
- **Skywars** ☁️ - Sky arena combat
- **Duels** ⚔️ - 1v1 match format
- **Sumo** 🥋 - Melee knockback fights
- **Classic** 🎯 - Traditional PvP
- **Other** 🎮 - Miscellaneous modes

## Result Generation Logic

### Score Evaluation
- **Dominant** (10+ difference): "dominant performance"
- **Solid** (5-9 difference): "solid performance"
- **Close** (0-4 difference): "hard-fought/close match"

### Embed Types

**PROMOTION (Gold #FFD700)**
- Positive, rewarding tone
- Celebrates player achievement
- Evaluation reflects strong performance

**DEMOTION (Red #EF4444)**
- Neutral, firm tone
- Explains rank adjustment
- Motivational but honest

**FAILED (Orange #F97316)**
- Constructive, helpful tone
- Feedback for improvement
- Rank optional (practice mode)

## Database Schema

### Tables
- `current_ranks` - Active player ranks by gamemode
- `rank_history` - Historical rank changes
- `test_results` - Test outcomes and evaluations
- `tester_logs` - Staff testing activity

## Button Interactions

### Result Buttons
- **✅ Confirm** - Save test result to database
- **✏️ Edit** - Modify test before saving (coming soon)
- **❌ Cancel** - Delete result message and discard

### Backup Buttons
- **📥 Restore** - Restore database from selected backup
- **💾 Export** - Download backup file

## Permissions

- **Public Commands**: `/leaderboard`, `/analytics`, `/testerhelp`
- **Tester Commands**: `/result`, `/testerstats`
- **Admin Commands**: `/backup`
- **Owner Only**: `/reset`

## Upcoming Features

1. ✅ Result logging with embeds and buttons
2. ⏳ Queue management system
3. ⏳ Testing history and statistics
4. ⏳ Player performance trends
5. ⏳ Automated tier adjustments
6. ⏳ Discord role synchronization
7. ⏳ Web dashboard

## Bot Status

- **Version**: 1.0.0
- **Framework**: Discord.js v14
- **Database**: SQLite
- **API**: Express.js (Tier API)
- **Commands**: 8 main commands + 15 subcommands

## Support

For issues or feature requests, contact server administrators.
