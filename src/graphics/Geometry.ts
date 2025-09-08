export class Geometry {
    private gl: WebGL2RenderingContext;
    private vao: WebGLVertexArrayObject;
    private vertexBuffer: WebGLBuffer;
    private indexBuffer: WebGLBuffer | null = null;
    private vertexCount: number = 0;
    private indexCount: number = 0;

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        
        const vao = gl.createVertexArray();
        if (!vao) {
            throw new Error('Failed to create VAO');
        }
        this.vao = vao;
        
        const buffer = gl.createBuffer();
        if (!buffer) {
            throw new Error('Failed to create vertex buffer');
        }
        this.vertexBuffer = buffer;
    }

    public setVertexData(vertices: Float32Array, attributes: VertexAttribute[]): void {
        const gl = this.gl;
        
        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        
        let stride = 0;
        attributes.forEach(attr => stride += attr.size * 4); // 4 bytes per float
        
        let offset = 0;
        attributes.forEach(attr => {
            gl.enableVertexAttribArray(attr.location);
            gl.vertexAttribPointer(
                attr.location,
                attr.size,
                gl.FLOAT,
                false,
                stride,
                offset
            );
            offset += attr.size * 4;
        });
        
        this.vertexCount = vertices.length / (stride / 4);
        
        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    public setIndexData(indices: Uint16Array): void {
        const gl = this.gl;
        
        if (!this.indexBuffer) {
            const buffer = gl.createBuffer();
            if (!buffer) {
                throw new Error('Failed to create index buffer');
            }
            this.indexBuffer = buffer;
        }
        
        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
        
        this.indexCount = indices.length;
        
        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }

    public draw(): void {
        const gl = this.gl;
        
        gl.bindVertexArray(this.vao);
        
        if (this.indexBuffer && this.indexCount > 0) {
            gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
        } else {
            gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount);
        }
        
        gl.bindVertexArray(null);
    }

    public destroy(): void {
        const gl = this.gl;
        
        gl.deleteVertexArray(this.vao);
        gl.deleteBuffer(this.vertexBuffer);
        if (this.indexBuffer) {
            gl.deleteBuffer(this.indexBuffer);
        }
    }
}

export interface VertexAttribute {
    location: number;
    size: number; // Number of components (1-4)
}

export class QuadGeometry extends Geometry {
    constructor(gl: WebGL2RenderingContext, width: number, height: number, color: [number, number, number, number] = [1, 0, 0, 1]) {
        super(gl);
        
        // Vertex data: position (x, y) + color (r, g, b, a)
        const vertices = new Float32Array([
            // Top-left
            -width/2, height/2,  color[0], color[1], color[2], color[3],
            // Top-right
            width/2,  height/2,  color[0], color[1], color[2], color[3],
            // Bottom-right
            width/2,  -height/2, color[0], color[1], color[2], color[3],
            // Bottom-left
            -width/2, -height/2, color[0], color[1], color[2], color[3],
        ]);
        
        const indices = new Uint16Array([
            0, 1, 2,  // First triangle
            2, 3, 0   // Second triangle
        ]);
        
        const attributes: VertexAttribute[] = [
            { location: 0, size: 2 }, // position
            { location: 1, size: 4 }  // color
        ];
        
        this.setVertexData(vertices, attributes);
        this.setIndexData(indices);
    }
}