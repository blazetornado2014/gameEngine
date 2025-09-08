export class Shader {
    private gl: WebGL2RenderingContext;
    private program: WebGLProgram;
    private uniformLocations: Map<string, WebGLUniformLocation>;

    constructor(gl: WebGL2RenderingContext, vertexSource: string, fragmentSource: string) {
        this.gl = gl;
        this.uniformLocations = new Map();
        this.program = this.createProgram(vertexSource, fragmentSource);
    }

    private createProgram(vertexSource: string, fragmentSource: string): WebGLProgram {
        const gl = this.gl;
        
        const vertexShader = this.compileShader(gl.VERTEX_SHADER, vertexSource);
        const fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, fragmentSource);
        
        const program = gl.createProgram();
        if (!program) {
            throw new Error('Failed to create shader program');
        }
        
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const info = gl.getProgramInfoLog(program);
            gl.deleteProgram(program);
            throw new Error('Shader program linking failed: ' + info);
        }
        
        // Clean up shaders
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        
        return program;
    }

    private compileShader(type: number, source: string): WebGLShader {
        const gl = this.gl;
        
        const shader = gl.createShader(type);
        if (!shader) {
            throw new Error('Failed to create shader');
        }
        
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const info = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error('Shader compilation failed: ' + info);
        }
        
        return shader;
    }

    public use(): void {
        this.gl.useProgram(this.program);
    }

    public getAttribLocation(name: string): number {
        return this.gl.getAttribLocation(this.program, name);
    }

    public getUniformLocation(name: string): WebGLUniformLocation {
        if (!this.uniformLocations.has(name)) {
            const location = this.gl.getUniformLocation(this.program, name);
            if (!location) {
                throw new Error(`Uniform ${name} not found`);
            }
            this.uniformLocations.set(name, location);
        }
        return this.uniformLocations.get(name)!;
    }

    public setUniform2f(name: string, x: number, y: number): void {
        const location = this.getUniformLocation(name);
        this.gl.uniform2f(location, x, y);
    }

    public setUniform3f(name: string, x: number, y: number, z: number): void {
        const location = this.getUniformLocation(name);
        this.gl.uniform3f(location, x, y, z);
    }

    public setUniform4f(name: string, x: number, y: number, z: number, w: number): void {
        const location = this.getUniformLocation(name);
        this.gl.uniform4f(location, x, y, z, w);
    }

    public setUniformMatrix4fv(name: string, matrix: Float32Array): void {
        const location = this.getUniformLocation(name);
        this.gl.uniformMatrix4fv(location, false, matrix);
    }

    public destroy(): void {
        this.gl.deleteProgram(this.program);
    }
}

// Basic 2D vertex shader
export const BASIC_VERTEX_SHADER = `#version 300 es
in vec2 a_position;
in vec4 a_color;

uniform vec2 u_resolution;
uniform mat4 u_transform;

out vec4 v_color;

void main() {
    // Convert from pixels to clip space
    vec2 clipSpace = ((a_position / u_resolution) * 2.0) - 1.0;
    
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    v_color = a_color;
}
`;

// Basic fragment shader
export const BASIC_FRAGMENT_SHADER = `#version 300 es
precision mediump float;

in vec4 v_color;
out vec4 outColor;

void main() {
    outColor = v_color;
}
`;