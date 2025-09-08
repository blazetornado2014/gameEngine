import { WebGLRenderer } from './graphics/WebGLRenderer';
import { Shader, BASIC_VERTEX_SHADER, BASIC_FRAGMENT_SHADER } from './graphics/Shader';
import { QuadGeometry } from './graphics/Geometry';
import { InputManager } from './input/InputManager';
import { Player } from './core/GameObject';

class GameEngine {
    private renderer: WebGLRenderer;
    private canvas: HTMLCanvasElement;
    private shader: Shader;
    private quad: QuadGeometry;
    private gl: WebGL2RenderingContext;
    private inputManager: InputManager;
    private player: Player;
    
    // Game loop timing
    private lastTime: number = 0;
    private targetFPS: number = 60;
    private frameTime: number = 1000 / this.targetFPS;

    constructor() {
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        if (!this.canvas) {
            throw new Error('Canvas element not found');
        }

        this.renderer = new WebGLRenderer(this.canvas);
        this.gl = this.renderer.getContext();
        
        // Initialize rendering components
        this.shader = new Shader(this.gl, BASIC_VERTEX_SHADER, BASIC_FRAGMENT_SHADER);
        this.quad = new QuadGeometry(this.gl, 50, 50, [0, 1, 0, 1]); // Green square, 50x50 pixels
        
        // Initialize game systems
        this.inputManager = InputManager.getInstance();
        this.player = new Player(this.canvas.width / 2, this.canvas.height / 2); // Start in center
        
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
        console.log('Game engine started');
        console.log('Use WASD or arrow keys to move the green square');
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
        
        // Handle player input
        const input = this.inputManager.getMovementInput();
        
        // Debug: Log input
        if (input.x !== 0 || input.y !== 0) {
            console.log('Input:', input);
        }
        
        this.player.handleInput(input, deltaTime);
        
        // Update player
        this.player.update(deltaTime);
        
        // Debug: Log player position every 60 frames
        if (Math.floor(performance.now() / 1000) % 1 < deltaTime) {
            console.log('Player position:', this.player.transform.x, this.player.transform.y);
            console.log('Transform matrix:', this.player.transform.getMatrix());
        }
        
        // Keep player within canvas bounds
        this.player.keepInBounds(0, 0, this.canvas.width, this.canvas.height, 50, 50);
    }

    private render(): void {
        this.renderer.clear();
        
        // Use our shader and set uniforms
        this.shader.use();
        this.shader.setUniform2f('u_resolution', this.canvas.width, this.canvas.height);
        
        // Use player's actual transform matrix
        this.shader.setUniformMatrix4fv('u_transform', this.player.transform.getMatrix());
        
        // Draw the player square
        this.quad.draw();
    }
}

new GameEngine();