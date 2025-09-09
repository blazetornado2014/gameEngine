import { WebGLRenderer } from './graphics/WebGLRenderer';
import { Shader, BASIC_VERTEX_SHADER, BASIC_FRAGMENT_SHADER } from './graphics/Shader';
import { InputManager, Key } from './input/InputManager';
import { Player } from './core/GameObject';
import { Enemy } from './core/Enemy';
import { EnemySpawner } from './core/EnemySpawner';
import { GameObjectManager } from './core/GameObjectManager';
import { GameState, GameStateType } from './core/GameState';
import { GameUI } from './ui/GameUI';

class GameEngine {
    private renderer: WebGLRenderer;
    private gameCanvas: HTMLCanvasElement;
    private uiCanvas: HTMLCanvasElement;
    private shader: Shader;
    private gl: WebGL2RenderingContext;
    private inputManager: InputManager;
    private player: Player;
    private enemySpawner: EnemySpawner;
    private gameObjectManager: GameObjectManager;
    private gameState: GameState;
    private gameUI: GameUI;
    
    // Game loop timing
    private lastTime: number = 0;
    private targetFPS: number = 60;
    private frameTime: number = 1000 / this.targetFPS;

    constructor() {
        // Get both canvas elements
        this.gameCanvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        if (!this.gameCanvas) {
            throw new Error('Game canvas element not found');
        }
        
        this.uiCanvas = document.getElementById('uiCanvas') as HTMLCanvasElement;
        if (!this.uiCanvas) {
            throw new Error('UI canvas element not found');
        }

        this.renderer = new WebGLRenderer(this.gameCanvas);
        this.gl = this.renderer.getContext();
        
        // Initialize rendering components
        this.shader = new Shader(this.gl, BASIC_VERTEX_SHADER, BASIC_FRAGMENT_SHADER);
        
        // Initialize game systems
        this.inputManager = InputManager.getInstance();
        this.player = new Player(this.gameCanvas.width / 2, this.gameCanvas.height / 2); // Start in center
        
        // Initialize Phase 2 systems
        this.gameObjectManager = new GameObjectManager(this.player, this.renderer, this.shader, this.gl);
        this.enemySpawner = new EnemySpawner(this.gameCanvas.width, this.gameCanvas.height, this.player);
        
        // Initialize Phase 3 systems
        this.gameState = new GameState(60); // Win after 60 seconds from environment.md
        this.gameUI = new GameUI(this.uiCanvas, this.gameState); // Use separate UI canvas
        
        this.setupEventListeners();
        this.start();
    }

    private setupEventListeners(): void {
        const generateBtn = document.getElementById('generateBtn');
        const promptInput = document.getElementById('promptInput') as HTMLInputElement;

        generateBtn?.addEventListener('click', () => {
            const prompt = promptInput.value;
            console.log('Generate game:', prompt);
        });
    }

    private start(): void {
        console.log('Game engine started - Phase 3');
        console.log('Use WASD or arrow keys to move the green square');
        console.log('Avoid red enemies and survive for 60 seconds to win!');
        console.log('Press P to pause, R to restart');
        
        this.gameState.startGame();
        this.lastTime = performance.now();
        this.gameLoop();
    }

    private gameLoop(): void {
        const currentTime = performance.now();
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 1/30); // Cap at 30fps minimum
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }

    private update(deltaTime: number): void {
        // Update input manager
        this.inputManager.update();
        
        // Handle game state input
        this.handleGameStateInput();
        
        // Update game state (timer, score, win conditions)
        this.gameState.update(performance.now());
        
        // Only update game objects if playing
        if (this.gameState.isPlaying()) {
            // Handle player input
            const input = this.inputManager.getMovementInput();
            this.player.handleInput(input, deltaTime);
            
            // Keep player within canvas bounds
            this.player.keepInBounds(0, 0, this.gameCanvas.width, this.gameCanvas.height, 50, 50);
            
            // Update all game objects (player + enemies)
            this.gameObjectManager.updateAll(deltaTime);
            
            // Handle enemy spawning
            const newEnemy = this.enemySpawner.update(performance.now(), this.gameObjectManager.getEnemies());
            if (newEnemy) {
                this.gameObjectManager.addEnemy(newEnemy);
            }
            
            // Clean up off-screen enemies
            const cleanEnemies = this.enemySpawner.cleanupEnemies(this.gameObjectManager.getEnemies());
            if (cleanEnemies.length !== this.gameObjectManager.getEnemies().length) {
                // Update the manager's enemy list
                this.gameObjectManager.clearAllEnemies();
                cleanEnemies.forEach(enemy => this.gameObjectManager.addEnemy(enemy));
            }
            
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
        
        // Reset player position
        this.player.setPosition(this.gameCanvas.width / 2, this.gameCanvas.height / 2);
        this.player.setVelocity(0, 0);
        
        // Clear all enemies
        this.gameObjectManager.clearAllEnemies();
        
        // Restart enemy spawner
        this.enemySpawner = new EnemySpawner(this.gameCanvas.width, this.gameCanvas.height, this.player);
        
        console.log('Game restarted!');
    }

    private render(): void {
        // Render game objects (WebGL on game canvas)
        this.gameObjectManager.renderAll(this.gameCanvas.width, this.gameCanvas.height);
        
        // Render UI overlay (2D Canvas on UI canvas)
        this.gameUI.render();
    }
}

new GameEngine();