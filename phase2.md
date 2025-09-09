# Phase 2: Enemies Implementation

## Overview
Phase 2 adds red enemy squares that spawn from canvas edges, chase the player using basic AI, and end the game when they touch the player. This transforms the simple movement demo into an actual survival game.

## Prerequisites
- Phase 1 completed (controllable green player square)
- Reference `environment.md` for all constants and configuration values
- All Phase 1 classes and systems must be working

## Expected Result
Building on Phase 1, you'll now see:
- **Green player square** (50x50) controllable with WASD/arrows
- **Red enemy squares** (40x40) that spawn every 3 seconds from canvas edges
- **Enemy AI** that makes red squares chase the green player
- **Collision detection** that ends the game when player touches any enemy
- **Game over screen** when collision occurs

## Step-by-Step Implementation

### Step 1: Enemy GameObject Class
Create an enemy that can chase a target:

```typescript
// src/core/Enemy.ts - AI-controlled enemy game object
import { GameObject } from './GameObject';
import { vec2 } from 'gl-matrix';

export class Enemy extends GameObject {
    public target: GameObject | null = null;
    private chaseSpeed: number = 150; // From environment.md - slower than player
    
    constructor(x: number = 0, y: number = 0) {
        super('Enemy', x, y);
        this.speed = this.chaseSpeed;
        this.friction = 0.95; // Slightly less friction for smoother chasing
    }
    
    public update(deltaTime: number): void {
        if (!this.active) return;
        
        // AI behavior: chase the target (player)
        if (this.target) {
            this.chaseTarget(deltaTime);
        }
        
        // Apply parent update (velocity, position, friction)
        super.update(deltaTime);
    }
    
    private chaseTarget(deltaTime: number): void {
        if (!this.target) return;
        
        // Calculate direction vector from enemy to target
        const direction = vec2.fromValues(
            this.target.transform.x - this.transform.x,
            this.target.transform.y - this.transform.y
        );
        
        const distance = vec2.length(direction);
        
        // Only move if not already at target
        if (distance > 1) {
            // Normalize direction vector
            vec2.normalize(direction, direction);
            
            // Apply chase force
            const force = vec2.create();
            vec2.scale(force, direction, this.chaseSpeed * deltaTime);
            
            this.addForce(force[0], force[1]);
        }
    }
    
    public setTarget(target: GameObject): void {
        this.target = target;
    }
    
    // Static factory method for edge spawning
    public static spawnAtRandomEdge(canvasWidth: number, canvasHeight: number): Enemy {
        const edge = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
        let x: number, y: number;
        
        switch (edge) {
            case 0: // Top edge - spawn above canvas
                x = Math.random() * canvasWidth;
                y = -20;
                break;
            case 1: // Right edge - spawn right of canvas
                x = canvasWidth + 20;
                y = Math.random() * canvasHeight;
                break;
            case 2: // Bottom edge - spawn below canvas
                x = Math.random() * canvasWidth;
                y = canvasHeight + 20;
                break;
            case 3: // Left edge - spawn left of canvas
                x = -20;
                y = Math.random() * canvasHeight;
                break;
            default:
                x = 0;
                y = 0;
        }
        
        return new Enemy(x, y);
    }
}
```

### Step 2: Enemy Spawning System
Create a system to spawn enemies periodically:

```typescript
// src/core/EnemySpawner.ts - Handles enemy spawning and cleanup
import { Enemy } from './Enemy';
import { GameObject } from './GameObject';

export class EnemySpawner {
    private lastSpawnTime: number = 0;
    private spawnInterval: number = 3000; // 3 seconds from environment.md
    private maxEnemies: number = 10; // Prevent too many enemies
    private canvasWidth: number;
    private canvasHeight: number;
    private target: GameObject;
    
    constructor(canvasWidth: number, canvasHeight: number, target: GameObject) {
        this.canvasWidth = canvasWidth; // 800 from environment.md
        this.canvasHeight = canvasHeight; // 600 from environment.md
        this.target = target; // Usually the player
    }
    
    public update(currentTime: number, enemies: Enemy[]): Enemy | null {
        // Check if it's time to spawn and we haven't reached max enemies
        if (currentTime - this.lastSpawnTime >= this.spawnInterval && enemies.length < this.maxEnemies) {
            this.lastSpawnTime = currentTime;
            return this.spawnEnemy();
        }
        
        return null;
    }
    
    private spawnEnemy(): Enemy {
        // Create enemy at random edge
        const enemy = Enemy.spawnAtRandomEdge(this.canvasWidth, this.canvasHeight);
        
        // Set the enemy's target (usually the player)
        enemy.setTarget(this.target);
        
        return enemy;
    }
    
    // Clean up off-screen enemies to prevent memory leaks
    public cleanupEnemies(enemies: Enemy[]): Enemy[] {
        return enemies.filter(enemy => {
            if (enemy.isOffScreen(this.canvasWidth, this.canvasHeight)) {
                enemy.destroy();
                return false;
            }
            return enemy.active;
        });
    }
}
```

### Step 3: GameObjectManager for Multiple Objects
Create a system to manage and render all game objects:

```typescript
// src/core/GameObjectManager.ts - Manages all game objects and rendering
import { GameObject, Player } from './GameObject';
import { Enemy } from './Enemy';
import { WebGLRenderer } from '../graphics/WebGLRenderer';
import { Shader } from '../graphics/Shader';
import { QuadGeometry } from '../graphics/Geometry';

export class GameObjectManager {
    private player: Player;
    private enemies: Enemy[] = [];
    
    // Rendering components
    private renderer: WebGLRenderer;
    private shader: Shader;
    private playerQuad: QuadGeometry;
    private enemyQuad: QuadGeometry;
    private gl: WebGL2RenderingContext;
    
    constructor(player: Player, renderer: WebGLRenderer, shader: Shader, gl: WebGL2RenderingContext) {
        this.player = player;
        this.renderer = renderer;
        this.shader = shader;
        this.gl = gl;
        
        // Create geometry for different object types
        // Player: Green 50x50 square from environment.md
        this.playerQuad = new QuadGeometry(gl, 50, 50, [0, 1, 0, 1]);
        
        // Enemy: Red 40x40 square from environment.md
        this.enemyQuad = new QuadGeometry(gl, 40, 40, [1, 0, 0, 1]);
    }
    
    public updateAll(deltaTime: number): void {
        // Update player
        this.player.update(deltaTime);
        
        // Update all enemies
        this.enemies.forEach(enemy => {
            enemy.update(deltaTime);
        });
        
        // Remove inactive enemies
        this.enemies = this.enemies.filter(enemy => enemy.active);
    }
    
    public renderAll(canvasWidth: number, canvasHeight: number): void {
        this.renderer.clear();
        this.shader.use();
        this.shader.setUniform2f('u_resolution', canvasWidth, canvasHeight);
        
        // Render player
        this.shader.setUniformMatrix4fv('u_transform', this.player.transform.getMatrix());
        this.playerQuad.draw();
        
        // Render all enemies
        this.enemies.forEach(enemy => {
            this.shader.setUniformMatrix4fv('u_transform', enemy.transform.getMatrix());
            this.enemyQuad.draw();
        });
    }
    
    public checkPlayerEnemyCollisions(): boolean {
        const playerSize = 50; // From environment.md
        const enemySize = 40;   // From environment.md
        
        for (const enemy of this.enemies) {
            if (this.checkAABBCollision(
                this.player.transform.x, this.player.transform.y, playerSize,
                enemy.transform.x, enemy.transform.y, enemySize
            )) {
                return true; // Collision detected
            }
        }
        
        return false; // No collisions
    }
    
    private checkAABBCollision(
        x1: number, y1: number, size1: number,
        x2: number, y2: number, size2: number
    ): boolean {
        const halfSize1 = size1 / 2;
        const halfSize2 = size2 / 2;
        
        return (
            x1 - halfSize1 < x2 + halfSize2 &&
            x1 + halfSize1 > x2 - halfSize2 &&
            y1 - halfSize1 < y2 + halfSize2 &&
            y1 + halfSize1 > y2 - halfSize2
        );
    }
    
    public addEnemy(enemy: Enemy): void {
        this.enemies.push(enemy);
    }
    
    public getEnemies(): Enemy[] {
        return this.enemies;
    }
}
```

### Step 4: Update Main Game Loop
Integrate all Phase 2 systems into the main game:

```typescript
// src/main.ts - Updated for Phase 2
import { Enemy } from './core/Enemy';
import { EnemySpawner } from './core/EnemySpawner';
import { GameObjectManager } from './core/GameObjectManager';

class GameEngine {
    // Add new Phase 2 properties
    private enemySpawner: EnemySpawner;
    private gameObjectManager: GameObjectManager;
    private gameOver: boolean = false;
    
    constructor() {
        // ... existing Phase 1 initialization ...
        
        // Initialize Phase 2 systems
        this.gameObjectManager = new GameObjectManager(this.player, this.renderer, this.shader, this.gl);
        this.enemySpawner = new EnemySpawner(this.canvas.width, this.canvas.height, this.player);
    }
    
    private update(deltaTime: number): void {
        if (this.gameOver) {
            return; // Stop updating when game is over
        }
        
        // Phase 1 player update
        const input = this.inputManager.getMovementInput();
        this.player.handleInput(input, deltaTime);
        this.player.keepInBounds(0, 0, this.canvas.width, this.canvas.height, 50, 50);
        
        // Phase 2 updates
        this.gameObjectManager.updateAll(deltaTime);
        
        // Handle enemy spawning
        const newEnemy = this.enemySpawner.update(performance.now(), this.gameObjectManager.getEnemies());
        if (newEnemy) {
            this.gameObjectManager.addEnemy(newEnemy);
        }
        
        // Check for collisions
        if (this.gameObjectManager.checkPlayerEnemyCollisions()) {
            this.gameOver = true;
            console.log('Game Over! You were caught by an enemy.');
        }
    }
    
    private render(): void {
        // Use GameObjectManager to render all objects
        this.gameObjectManager.renderAll(this.canvas.width, this.canvas.height);
        
        // Display game over message if needed
        if (this.gameOver) {
            const ctx = this.canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
                ctx.fillStyle = 'white';
                ctx.font = '48px Courier New';
                ctx.textAlign = 'center';
                ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
                
                ctx.font = '24px Courier New';
                ctx.fillText('Refresh to play again', this.canvas.width / 2, this.canvas.height / 2 + 50);
            }
        }
    }
}
```

## Verification Steps

After implementation, verify Phase 2 works correctly:

### Visual Verification
1. **Phase 1 still works**: Green 50x50 player square moves with WASD
2. **Red enemies appear**: 40x40 red squares spawn from canvas edges every 3 seconds
3. **Enemy AI works**: Red squares move toward green player square
4. **Multiple enemies**: Can have up to 10 enemies on screen simultaneously

### Gameplay Verification
1. **Enemy chasing**: Red squares always move toward player position
2. **Enemy spawning**: New enemies appear every 3 seconds from random edges
3. **Collision detection**: Game ends when player touches any enemy
4. **Game over screen**: "GAME OVER" message appears with restart instruction

### Performance Verification
1. **Smooth rendering**: All objects render at 60fps without stuttering
2. **Memory management**: Off-screen enemies are cleaned up properly
3. **Collision accuracy**: Collision detection matches visual contact
4. **No crashes**: Game runs continuously without JavaScript errors

### AI Verification
1. **Enemies chase player**: Red squares move toward green square from any direction
2. **Edge spawning works**: Enemies appear from top, right, bottom, and left edges randomly
3. **Pathfinding basic**: Enemies move in straight line toward player (no obstacle avoidance yet)

## Common Issues & Solutions

### Enemies not appearing
- Check enemy spawning timer (3000ms interval)
- Verify EnemySpawner is being updated in game loop
- Ensure enemy quad geometry is created with red color [1, 0, 0, 1]
- Check if enemies are spawning off-screen correctly

### Enemies not chasing player
- Verify enemy.setTarget(player) is called when spawning
- Check that enemy update() method calls chaseTarget()
- Ensure vec2 (gl-matrix) is imported and working
- Verify player position is updating correctly

### Collision not working
- Check AABB collision math (half sizes calculated correctly)
- Verify player size (50) and enemy size (40) match geometry
- Ensure checkPlayerEnemyCollisions() is called every frame
- Test collision detection by placing enemy directly on player

### Game over screen not showing
- Check that gameOver boolean is set to true on collision
- Verify render method checks gameOver state
- Ensure canvas 2D context is available for text rendering
- Check that game loop stops updating when gameOver is true

### Performance issues
- Verify enemy cleanup removes off-screen enemies
- Check maxEnemies limit (should be 10 or reasonable number)
- Ensure inactive enemies are filtered out of arrays
- Monitor browser console for memory leaks

## Success Criteria

Phase 2 is complete when:
✅ Green player square moves with WASD (Phase 1 functionality preserved)  
✅ Red enemy squares spawn every 3 seconds from canvas edges
✅ Enemies chase the player using basic AI pathfinding
✅ Game ends when player collides with any enemy
✅ Game over screen displays with restart instructions
✅ Up to 10 enemies can be active simultaneously
✅ Off-screen enemies are cleaned up properly
✅ Game runs smoothly at 60fps with multiple objects

**Ready for Phase 3**: With Phase 2 working, you now have a playable survival game ready for win conditions, scoring, and game state management.