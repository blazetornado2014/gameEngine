# Game Environment Configuration

## Canvas & World Settings
```yaml
Canvas:
  Width: 800
  Height: 600
  Background: "#1a1a1a" (dark gray)
  
Coordinate System:
  Origin: Top-left (0, 0)
  X-Axis: Left to right (0 to 800)
  Y-Axis: Top to bottom (0 to 600)
  Center: (400, 300)
```

## Player Configuration
```yaml
Player:
  Size: 50x50 pixels
  Color: [0, 1, 0, 1] (green RGBA)
  Starting Position: (400, 300) (canvas center)
  
Movement:
  Speed: 300 pixels/second
  Friction: 0.9 (higher = more responsive)
  Controls: WASD + Arrow Keys
  
Physics:
  Velocity-based movement with delta time
  Boundary collision (stays within canvas)
  Smooth acceleration/deceleration
```

## Enemy Configuration (Phase 2)
```yaml
Enemy:
  Size: 40x40 pixels
  Color: [1, 0, 0, 1] (red RGBA)
  Spawn Rate: 1 enemy per 3 seconds
  Spawn Location: Random edge of canvas
  
Movement:
  Speed: 150 pixels/second (slower than player)
  AI Behavior: Chase player directly
  
Collision:
  Player-Enemy: Game over (lose condition)
  Enemy-Enemy: No collision (pass through each other)
```

## Collectibles Configuration (Phase 3)
```yaml
Collectible:
  Size: 30x30 pixels
  Color: [0, 0, 1, 1] (blue RGBA)
  Spawn Count: 5 items at game start
  Spawn Location: Random positions on canvas
  
Collision:
  Player-Collectible: +10 points, item disappears
  Win Condition: Collect all items
```

## Game Rules (Phase 3)
```yaml
Scoring:
  Collectible: +10 points each
  Survival Time: +1 point per second
  Starting Score: 0
  
Win Conditions:
  - Collect all collectibles, OR
  - Survive for 60 seconds
  
Lose Conditions:
  - Player touches any enemy
  
Game States:
  - Playing: Normal gameplay
  - Game Over: Show final score + restart button
  - Victory: Show victory message + restart button
```

## Visual Settings
```yaml
Colors:
  Player: [0, 1, 0, 1]     # Green
  Enemy: [1, 0, 0, 1]      # Red  
  Collectible: [0, 0, 1, 1] # Blue
  Wall: [0.5, 0.5, 0.5, 1] # Gray (Phase 4)
  
Text Display:
  Font: "Courier New", monospace
  Score Color: #ffffff (white)
  Score Position: Top-left (10, 30)
  
UI Colors:
  Background: #1a1a1a
  Text: #ffffff
  Button Hover: #005a9e
```

## Performance Settings
```yaml
Game Loop:
  Target FPS: 60
  Max Delta Time: 1/30 seconds (30fps minimum)
  
Rendering:
  WebGL 2.0 required
  Alpha blending enabled
  Viewport: Full canvas (800x600)
```

## Development Constants
```yaml
Debug:
  Show Console Logs: true (Phase 1)
  Position Logging: Every 1 second
  Input Logging: When keys pressed
  
Canvas Element:
  ID: "gameCanvas"
  HTML Width: 800
  HTML Height: 600
```

## Phase-Specific Additions

### Phase 1: Player Only
- Canvas + Player configuration active
- All other game elements disabled

### Phase 2: Player + Enemies  
- Canvas + Player + Enemy configuration active
- Collectibles and game rules disabled

### Phase 3: Complete Game
- All configurations active
- Full win/lose conditions enabled

### Phase 4: Polish & Features
- Additional wall/obstacle objects
- Power-ups and special effects
- Enhanced visual feedback