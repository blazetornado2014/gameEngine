import { WebGLRenderer } from './graphics/WebGLRenderer';
import { Shader, BASIC_VERTEX_SHADER, BASIC_FRAGMENT_SHADER } from './graphics/Shader';
import { InputManager } from './input/InputManager';
import { Player } from './core/GameObject';
import { Enemy } from './core/Enemy';
import { EnemySpawner } from './core/EnemySpawner';
import { GameObjectManager } from './core/GameObjectManager';

class GameEngine {
    private renderer: WebGLRenderer;
    private canvas: HTMLCanvasElement;
    private shader: Shader;
    private gl: WebGL2RenderingContext;
    private inputManager: InputManager;
    private player: Player;
    private enemySpawner: EnemySpawner;
    private gameObjectManager: GameObjectManager;
    
    // Game loop timing
    private lastTime: number = 0;
    private targetFPS: number = 60;
    private frameTime: number = 1000 / this.targetFPS;
    
    // Game state
    private gameOver: boolean = false;

    constructor() {
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        if (!this.canvas) {
            throw new Error('Canvas element not found');
        }

        this.renderer = new WebGLRenderer(this.canvas);
        this.gl = this.renderer.getContext();
        
        // Initialize rendering components
        this.shader = new Shader(this.gl, BASIC_VERTEX_SHADER, BASIC_FRAGMENT_SHADER);
        
        // Initialize game systems
        this.inputManager = InputManager.getInstance();
        this.player = new Player(this.canvas.width / 2, this.canvas.height / 2); // Start in center
        
        // Initialize Phase 2 systems
        this.gameObjectManager = new GameObjectManager(this.player, this.renderer, this.shader, this.gl);
        this.enemySpawner = new EnemySpawner(this.canvas.width, this.canvas.height, this.player);
        
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
        console.log('Game engine started - Phase 2');
        console.log('Use WASD or arrow keys to move the green square');
        console.log('Avoid the red enemy squares!');
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
        if (this.gameOver) {
            // Handle game over state - could add restart logic here
            return;
        }

        // Update input manager
        this.inputManager.update();
        
        // Handle player input
        const input = this.inputManager.getMovementInput();
        this.player.handleInput(input, deltaTime);
        
        // Keep player within canvas bounds
        this.player.keepInBounds(0, 0, this.canvas.width, this.canvas.height, 50, 50);
        
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
            this.gameOver = true;
            console.log('Game Over! You were caught by an enemy.');
            console.log('Enemies defeated:', this.gameObjectManager.getEnemyCount());
        }
    }

    private render(): void {
        // Use GameObjectManager to render all objects
        this.gameObjectManager.renderAll(this.canvas.width, this.canvas.height);
        
        // Display game over message if needed
        if (this.gameOver) {
            // Simple game over display - could be enhanced with proper UI
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

new GameEngine();