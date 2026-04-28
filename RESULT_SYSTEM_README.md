# PvP Result System Documentation

## Overview

The `/result` command is a complete Discord bot system for logging PvP test results (promotions, demotions, and failed attempts) for a Minecraft PvP tier testing server.

## Quick Start

### 1. Deploy Commands
```bash
node deploy-commands.js
```

### 2. Use the Command
```
/result type: [promotion|demotion|fail]
        player: [player_name]
        gamemode: [gamemode]
        rank: [rank] (optional for fails)
        opponent: [opponent_name]
        score_player: [0+]
        score_opponent: [0+]
```

### 3. interact with Buttons
- **✅ Confirm** - Logs the result (saves to database - TODO)
- **✏️ Edit** - Returns to editing flow (coming soon)
- **❌ Cancel** - Deletes the result message

## Features

### Dynamic Embed Generation
- **Color coding**: Gold (promotion), Red (demotion), Orange (fail)
- **Smart evaluation text**: Changes based on score difference
  - Dominant performance: 10+ point difference
  - Solid performance: 5-9 point difference
  - Close match: 0-4 point difference
- **Professional formatting**: Includes footer with tester name and timestamp

### Result Types

#### Promotion 🏆
- **Color**: Gold (#FFD700)
- **Tone**: Positive and rewarding
- **Evaluation**: Reflects player's strong performance

#### Demotion 📉
- **Color**: Red (#EF4444)
- **Tone**: Neutral but firm
- **Evaluation**: Explains the transition neutrally

#### Failed ❌
- **Color**: Orange (#F97316)
- **Tone**: Constructive feedback
- **Note**: Rank is optional

### Gamemodes
- Bedwars
- Skywars
- Duels
- Sumo
- Classic
- Other

### Rank System
- S++, S+, S, S-
- A+, A, A-
- B+, B, B-
- C+, C, C-
- D+, D

## File Structure

```
commands/
  └── result.js                 # Main slash command

utils/
  ├── embedGenerator.js         # Dynamic embed creation
  └── buttonRow.js              # Button component builder

events/
  └── interactionCreate.js      # Updated with result button handlers

resultConfig.js                 # Configuration & constants
```

## Code Details

### Commands: result.js
- Slash command builder with all options
- Input validation and error handling
- Deferred reply for smooth UX
- Integrates embedGenerator and buttonRow

### Utils: embedGenerator.js
- `generateEmbed()`: Main function creating embeds
- `getEvaluationText()`: Dynamic feedback based on type & scores
- `getColor()`: Color selection by result type
- `getTitleInfo()`: Emoji + title for each result type

### Utils: buttonRow.js
- `createButtonRow()`: Creates the three-button component row
- Uses modern ButtonBuilder from discord.js v14

### Events: interactionCreate.js
- New result button handlers (confirm, edit, cancel)
- Integrates with existing backup restore handlers

## TODO Features

1. **Database Integration**: Save results to `test_results` table
2. **Edit Flow**: Allow users to modify test results before confirmation
3. **History**: Track result history per player
4. **Notifications**: Send alerts to testing channel
5. **Queue System**: Manage testing queue
6. **Analytics**: Generate testing statistics

## Usage Example

```
User: /result type:promotion player:JohnDoe gamemode:bedwars rank:A+ opponent:Jane score_player:50 score_opponent:35

Bot Response:
🏆 PROMOTION
━━━━━━━━━━━━━━━━━━━━━

👤 Player: `JohnDoe`
🎮 Gamemode: `Bedwars`
🏅 Rank: `A+`
⚔️ Match Result: `Jane 35 ┃ 50 JohnDoe`
📝 Evaluation: Showcased a **dominant performance** with an impressive 50-35 victory. Your mechanical skill and game sense were on full display. Well deserved promotion!

[✅ Confirm] [✏️ Edit] [❌ Cancel]
```

## Error Handling

- ✅ Deferred replies prevent "interaction failed" messages
- ✅ Try-catch blocks for graceful error recovery
- ✅ Validation on all user inputs
- ✅ Ephemeral error messages for sensitive info

## Production Notes

- Command is self-documenting with Discord's built-in UI
- All strings are dynamically generated (easy localization)
- Separated concerns for easy maintenance
- Ready to scale with database integration
- Button handlers are extensible for future features

## Next Steps

1. Run `node deploy-commands.js` to register
2. Test command in Discord
3. Implement database saving in button handlers
4. Add edit flow functionality
5. Create testing dashboard/queue system
