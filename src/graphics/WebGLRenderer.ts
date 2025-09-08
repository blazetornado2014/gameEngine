export class WebGLRenderer {
    private gl: WebGL2RenderingContext;
    private canvas: HTMLCanvasElement;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        
        const gl = canvas.getContext('webgl2');
        if (!gl) {
            throw new Error('WebGL2 not supported');
        }
        
        this.gl = gl;
        this.initialize();
    }

    private initialize(): void {
        const gl = this.gl;
        
        // Set viewport
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        
        // Enable alpha blending
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        
        // Set clear color (dark background)
        gl.clearColor(0.1, 0.1, 0.1, 1.0);
        
        console.log('WebGL2 Renderer initialized');
        console.log('GL Version:', gl.getParameter(gl.VERSION));
    }

    public clear(): void {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    public getContext(): WebGL2RenderingContext {
        return this.gl;
    }

    public getCanvas(): HTMLCanvasElement {
        return this.canvas;
    }

    public resize(width: number, height: number): void {
        this.canvas.width = width;
        this.canvas.height = height;
        this.gl.viewport(0, 0, width, height);
    }
}