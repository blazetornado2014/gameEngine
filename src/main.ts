import { WebGLRenderer } from './graphics/WebGLRenderer';
import { Shader, BASIC_VERTEX_SHADER, BASIC_FRAGMENT_SHADER } from './graphics/Shader';
import { QuadGeometry } from './graphics/Geometry';

class GameEngine {
    private renderer: WebGLRenderer;
    private canvas: HTMLCanvasElement;
    private shader: Shader;
    private quad: QuadGeometry;
    private gl: WebGL2RenderingContext;

    constructor() {
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        if (!this.canvas) {
            throw new Error('Canvas element not found');
        }

        this.renderer = new WebGLRenderer(this.canvas);
        this.gl = this.renderer.getContext();
        
        // Initialize rendering components
        this.shader = new Shader(this.gl, BASIC_VERTEX_SHADER, BASIC_FRAGMENT_SHADER);
        this.quad = new QuadGeometry(this.gl, 100, 100, [1, 0, 0, 1]); // Red square, 100x100 pixels
        
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
        this.gameLoop();
    }

    private gameLoop(): void {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }

    private update(): void {
    }

    private render(): void {
        this.renderer.clear();
        
        // Use our shader and set uniforms
        this.shader.use();
        this.shader.setUniform2f('u_resolution', this.canvas.width, this.canvas.height);
        
        // Draw the red square in the center
        this.quad.draw();
    }
}

new GameEngine();