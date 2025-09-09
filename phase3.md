# Phase 3: Game Rules & State Management

## Overview
Phase 3 transforms the survival game into a complete game experience with win conditions, scoring system, proper game state management, and restart functionality. Players now have clear objectives, real-time feedback, and multiple ways to interact with the game.

## Prerequisites
- Phase 1 completed (controllable green player)
- Phase 2 completed (red enemy spawning and collision)
- Reference `environment.md` for all constants and configuration values

## Expected Result
Building on Phases 1 & 2, you'll now see:
- **Real-time UI**: Score display, countdown timer, progress bar
- **Win condition**: Survive 60 seconds to achieve victory
- **Lose condition**: Touch enemy for game over (from Phase 2)
- **Game states**: Playing, Paused, Victory, Game Over with appropriate screens
- **Controls**: P to pause, R to restart, SPACE to resume from pause
- **Restart functionality**: No browser refresh needed

## Step-by-Step Implementation

### Step 1: Game State System
Create a comprehensive state management system:

```typescript
// src/core/GameState.ts - Complete game state management
export enum GameStateType {
    PLAYING = 'playing',
    GAME_OVER = 'game_over', 
    VICTORY = 'victory',
    PAUSED = 'paused'
}

export class GameState {
    private currentState: GameStateType = GameStateType.PLAYING;
    private score: number = 0;
    private startTime: number = 0;
    private gameTime: number = 0;
    private winTime: number = 60; // Win after 60 seconds from environment.md
    private survivalPoints: number = 1; // Points per second survived
    
    constructor(winTimeSeconds: number = 60) {
        this.winTime = winTimeSeconds;
        this.reset();
    }
    
    public update(currentTime: number): void {
        if (this.currentState === GameStateType.PLAYING) {
            // Calculate elapsed time
            this.gameTime = (currentTime - this.startTime) / 1000;
            
            // Award survival points (1 point per second)
            this.score = Math.floor(this.gameTime * this.survivalPoints);
            
            // Check for win condition
            if (this.gameTime >= this.winTime) {
                this.victory();
            }
        }
    }
    
    // State transition methods
    public startGame(): void {
        this.currentState = GameStateType.PLAYING;
        this.startTime = performance.now();
    }
    
    public pauseGame(): void {
        if (this.currentState === GameStateType.PLAYING) {
            this.currentState = GameStateType.PAUSED;
        }
    }
    
    public resumeGame(): void {
        if (this.currentState === GameStateType.PAUSED) {
            this.currentState = GameStateType.PLAYING;
            // Adjust start time to account for pause duration
            this.startTime = performance.now() - (this.gameTime * 1000);
        }
    }
    
    public gameOver(): void {
        this.currentState = GameStateType.GAME_OVER;
    }
    
    public victory(): void {
        this.currentState = GameStateType.VICTORY;
    }
    
    public reset(): void {
        this.currentState = GameStateType.PLAYING;
        this.score = 0;
        this.startTime = performance.now();
        this.gameTime = 0;
    }
    
    // Utility methods for UI
    public getFormattedRemainingTime(): string {
        const remaining = Math.max(0, this.winTime - this.gameTime);
        const minutes = Math.floor(remaining / 60);
        const seconds = Math.floor(remaining % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    public getProgressPercent(): number {
        return Math.min(100, (this.gameTime / this.winTime) * 100);
    }
    
    // State checks
    public isPlaying(): boolean { return this.currentState === GameStateType.PLAYING; }
    public isGameOver(): boolean { return this.currentState === GameStateType.GAME_OVER; }
    public isVictory(): boolean { return this.currentState === GameStateType.VICTORY; }
    public isPaused(): boolean { return this.currentState === GameStateType.PAUSED; }
}
```

### Step 2: UI System for Real-time Display
Create a comprehensive UI system for all game states:

```typescript
// src/ui/GameUI.ts - Real-time UI with 2D canvas overlay
import { GameState, GameStateType } from '../core/GameState';

export class GameUI {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private gameState: GameState;
    
    // UI styling constants from environment.md
    private readonly UI_FONT = 'Courier New, monospace';
    private readonly UI_COLOR = '#ffffff';
    private readonly UI_BACKGROUND = 'rgba(0, 0, 0, 0.8)';
    private readonly UI_ACCENT = '#007acc';
    
    constructor(canvas: HTMLCanvasElement, gameState: GameState) {
        this.canvas = canvas;
        this.gameState = gameState;
        this.ctx = canvas.getContext('2d')!;
    }
    
    public render(): void {
        const state = this.gameState.getCurrentState();
        
        switch (state) {
            case GameStateType.PLAYING:
                this.renderGameplayUI();
                break;
            case GameStateType.PAUSED:
                this.renderGameplayUI();
                this.renderPauseOverlay();
                break;
            case GameStateType.GAME_OVER:
                this.renderGameOverScreen();
                break;
            case GameStateType.VICTORY:
                this.renderVictoryScreen();
                break;
        }
    }
    
    private renderGameplayUI(): void {
        const ctx = this.ctx;
        const score = this.gameState.getScore();
        const remainingTime = this.gameState.getFormattedRemainingTime();
        
        // Score display (top-left)
        ctx.fillStyle = this.UI_COLOR;
        ctx.font = '24px ' + this.UI_FONT;
        ctx.textAlign = 'left';
        ctx.fillText(`Score: ${score}`, 20, 40);
        
        // Timer display (top-right)
        ctx.textAlign = 'right';
        ctx.fillText(`Time: ${remainingTime}`, this.canvas.width - 20, 40);
        
        // Progress bar (top-center)
        this.renderProgressBar();
    }
    
    private renderProgressBar(): void {
        const ctx = this.ctx;
        const progress = this.gameState.getProgressPercent();
        const barWidth = 200;
        const barHeight = 8;
        const x = (this.canvas.width - barWidth) / 2;
        const y = 20;
        
        // Background bar
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Progress fill
        ctx.fillStyle = this.UI_ACCENT;
        ctx.fillRect(x, y, (barWidth * progress) / 100, barHeight);
        
        // Border
        ctx.strokeStyle = this.UI_COLOR;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, barWidth, barHeight);
    }
    
    private renderPauseOverlay(): void {
        const ctx = this.ctx;
        
        // Semi-transparent overlay
        ctx.fillStyle = this.UI_BACKGROUND;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Pause text
        ctx.fillStyle = this.UI_COLOR;
        ctx.font = '48px ' + this.UI_FONT;
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        
        ctx.font = '24px ' + this.UI_FONT;
        ctx.fillText('Press SPACE to resume', this.canvas.width / 2, this.canvas.height / 2 + 50);
    }
    
    private renderGameOverScreen(): void {
        const ctx = this.ctx;
        const stats = this.gameState.getGameStats();
        
        // Background overlay
        ctx.fillStyle = this.UI_BACKGROUND;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Game Over title
        ctx.fillStyle = '#ff4444';
        ctx.font = '48px ' + this.UI_FONT;
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 80);
        
        // Stats
        ctx.fillStyle = this.UI_COLOR;
        ctx.font = '24px ' + this.UI_FONT;
        ctx.fillText(`Final Score: ${stats.score}`, this.canvas.width / 2, this.canvas.height / 2 - 20);
        ctx.fillText(`Time Survived: ${stats.timeSurvived}`, this.canvas.width / 2, this.canvas.height / 2 + 10);
        
        // Restart instruction
        ctx.font = '20px ' + this.UI_FONT;
        ctx.fillStyle = this.UI_ACCENT;
        ctx.fillText('Press R to restart', this.canvas.width / 2, this.canvas.height / 2 + 60);
    }
    
    private renderVictoryScreen(): void {
        const ctx = this.ctx;
        const stats = this.gameState.getGameStats();
        
        // Background overlay
        ctx.fillStyle = this.UI_BACKGROUND;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Victory title
        ctx.fillStyle = '#44ff44';
        ctx.font = '48px ' + this.UI_FONT;
        ctx.textAlign = 'center';
        ctx.fillText('VICTORY!', this.canvas.width / 2, this.canvas.height / 2 - 80);
        
        // Congratulations
        ctx.fillStyle = this.UI_COLOR;
        ctx.font = '24px ' + this.UI_FONT;
        ctx.fillText('You survived the enemies!', this.canvas.width / 2, this.canvas.height / 2 - 40);
        
        // Stats
        ctx.fillText(`Final Score: ${stats.score}`, this.canvas.width / 2, this.canvas.height / 2 - 10);
        ctx.fillText(`Survival Time: ${stats.timeSurvived}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
        
        // Restart instruction
        ctx.font = '20px ' + this.UI_FONT;
        ctx.fillStyle = this.UI_ACCENT;
        ctx.fillText('Press R to play again', this.canvas.width / 2, this.canvas.height / 2 + 70);
    }
}
```

### Step 3: Enhanced Input System
Add restart and pause controls:

```typescript
// src/input/InputManager.ts - Add restart and pause keys
export enum Key {
    // ... existing keys ...
    R = 'KeyR',      // Restart
    P = 'KeyP'       // Pause
}
```

### Step 4: Updated Main Game Loop
Integrate all Phase 3 systems:

```typescript
// src/main.ts - Complete Phase 3 integration
import { GameState, GameStateType } from './core/GameState';
import { GameUI } from './ui/GameUI';
import { Key } from './input/InputManager';

class GameEngine {
    // Add Phase 3 properties
    private gameState: GameState;
    private gameUI: GameUI;
    
    constructor() {
        // ... existing Phase 1 & 2 initialization ...
        
        // Initialize Phase 3 systems
        this.gameState = new GameState(60); // Win after 60 seconds from environment.md
        this.gameUI = new GameUI(this.canvas, this.gameState);
    }
    
    private update(deltaTime: number): void {
        // Update input manager
        this.inputManager.update();
        
        // Handle game state input (pause, restart)
        this.handleGameStateInput();
        
        // Update game state (timer, score, win conditions)
        this.gameState.update(performance.now());
        
        // Only update game objects if playing
        if (this.gameState.isPlaying()) {
            // All Phase 1 & 2 update logic here
            // Player movement, enemy spawning, collision detection
            
            // Check for player-enemy collisions
            if (this.gameObjectManager.checkPlayerEnemyCollisions()) {
                this.gameState.gameOver();
                console.log('Game Over! Final score:', this.gameState.getScore());
            }
        }
    }
    
    private handleGameStateInput(): void {
        // Pause/Resume with P key
        if (this.inputManager.isKeyJustPressed(Key.P)) {
            if (this.gameState.isPlaying()) {
                this.gameState.pauseGame();
            } else if (this.gameState.isPaused()) {
                this.gameState.resumeGame();
            }
        }
        
        // Restart with R key (only when game is over or victory)
        if (this.inputManager.isKeyJustPressed(Key.R)) {
            if (this.gameState.isGameOver() || this.gameState.isVictory()) {
                this.restartGame();
            }
        }
        
        // Resume from pause with SPACE
        if (this.inputManager.isKeyJustPressed(Key.SPACE)) {
            if (this.gameState.isPaused()) {
                this.gameState.resumeGame();
            }
        }
    }
    
    private restartGame(): void {
        // Reset game state
        this.gameState.reset();
        
        // Reset player position and velocity
        this.player.setPosition(this.canvas.width / 2, this.canvas.height / 2);
        this.player.setVelocity(0, 0);
        
        // Clear all enemies
        this.gameObjectManager.clearAllEnemies();
        
        // Restart enemy spawner
        this.enemySpawner = new EnemySpawner(this.canvas.width, this.canvas.height, this.player);
        
        console.log('Game restarted!');
    }
    
    private render(): void {
        // Render game objects (WebGL)
        this.gameObjectManager.renderAll(this.canvas.width, this.canvas.height);
        
        // Render UI overlay (2D Canvas)
        this.gameUI.render();
    }
}
```

## Verification Steps

After implementation, verify Phase 3 works correctly:

### UI Verification
1. **Score display**: Real-time score in top-left (increases every second)
2. **Timer display**: Countdown timer in top-right (shows remaining time)
3. **Progress bar**: Visual progress indicator in top-center
4. **Game states**: Proper screens for playing, paused, victory, game over

### Win Condition Verification
1. **Survive 60 seconds**: Game shows victory screen when timer reaches 0:00
2. **Victory screen**: Displays congratulations, final score, and restart option
3. **Score calculation**: 1 point per second survived (60 points for full victory)

### Game State Verification
1. **Pause functionality**: P key pauses game, shows pause overlay
2. **Resume functionality**: P key or SPACE resumes from pause
3. **Restart functionality**: R key restarts game from victory/game over screens
4. **State transitions**: Smooth transitions between all game states

### Control Verification
1. **P key**: Toggles pause/resume during gameplay
2. **SPACE key**: Resumes game from pause state
3. **R key**: Restarts game (only available in victory/game over states)
4. **Movement**: WASD/arrows still work during gameplay (not during pause)

### Performance Verification
1. **60fps rendering**: UI overlay doesn't impact game performance
2. **State updates**: Timer and score update smoothly every frame
3. **Memory management**: Game restarts don't cause memory leaks
4. **Mixed rendering**: WebGL objects and 2D UI render correctly together

## Common Issues & Solutions

### UI not displaying
- Check that canvas.getContext('2d') is available for UI rendering
- Verify GameUI is created after canvas element exists
- Ensure UI rendering happens after WebGL rendering (overlay)
- Check that font styles and colors are valid CSS values

### Timer not working
- Verify performance.now() is used for consistent timing
- Check that gameState.update() is called every frame
- Ensure startTime is set when game begins
- Verify time calculations use milliseconds correctly

### Win condition not triggering
- Check that gameTime calculation matches winTime (both in seconds)
- Verify victory() method is called when time >= winTime
- Ensure game state updates continue even when paused
- Check console for victory logs

### Restart not working
- Verify R key is only active in game over/victory states
- Check that all game objects are properly reset
- Ensure enemy spawner is recreated on restart
- Verify game state transitions to PLAYING after restart

### Pause functionality issues
- Check that game object updates stop when paused
- Verify timer calculations account for pause duration
- Ensure UI still renders during pause state
- Check that enemies don't move while paused

## Success Criteria

Phase 3 is complete when:
✅ Real-time score display shows points for survival time  
✅ Countdown timer shows remaining time to win (60 seconds)
✅ Progress bar visually indicates survival progress
✅ Win condition triggers victory screen after 60 seconds
✅ Pause functionality works (P key, SPACE to resume)
✅ Restart functionality works without browser refresh (R key)
✅ All game states (playing, paused, victory, game over) display correctly
✅ Mixed WebGL/2D Canvas rendering works without conflicts
✅ Game provides clear feedback and instructions to player

**Ready for Phase 4**: With Phase 3 complete, you now have a full-featured 2D top-down survival game with win conditions, scoring, and proper state management - ready for AI to generate variations and additional features!