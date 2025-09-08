import { mat4, vec2, vec3 } from 'gl-matrix';

export class Transform {
    private _position: vec2;
    private _rotation: number; // Rotation in radians
    private _scale: vec2;
    private _matrix: mat4;
    private _isDirty: boolean = true;

    constructor(x: number = 0, y: number = 0, rotation: number = 0, scaleX: number = 1, scaleY: number = 1) {
        this._position = vec2.fromValues(x, y);
        this._rotation = rotation;
        this._scale = vec2.fromValues(scaleX, scaleY);
        this._matrix = mat4.create();
    }

    // Position getters/setters
    public get position(): vec2 {
        return this._position;
    }

    public set position(value: vec2) {
        vec2.copy(this._position, value);
        this._isDirty = true;
    }

    public get x(): number {
        return this._position[0];
    }

    public set x(value: number) {
        this._position[0] = value;
        this._isDirty = true;
    }

    public get y(): number {
        return this._position[1];
    }

    public set y(value: number) {
        this._position[1] = value;
        this._isDirty = true;
    }

    // Rotation getters/setters
    public get rotation(): number {
        return this._rotation;
    }

    public set rotation(value: number) {
        this._rotation = value;
        this._isDirty = true;
    }

    public get rotationDegrees(): number {
        return this._rotation * (180 / Math.PI);
    }

    public set rotationDegrees(value: number) {
        this._rotation = value * (Math.PI / 180);
        this._isDirty = true;
    }

    // Scale getters/setters
    public get scale(): vec2 {
        return this._scale;
    }

    public set scale(value: vec2) {
        vec2.copy(this._scale, value);
        this._isDirty = true;
    }

    public get scaleX(): number {
        return this._scale[0];
    }

    public set scaleX(value: number) {
        this._scale[0] = value;
        this._isDirty = true;
    }

    public get scaleY(): number {
        return this._scale[1];
    }

    public set scaleY(value: number) {
        this._scale[1] = value;
        this._isDirty = true;
    }

    // Transform methods
    public translate(x: number, y: number): void {
        this._position[0] += x;
        this._position[1] += y;
        this._isDirty = true;
    }

    public rotate(radians: number): void {
        this._rotation += radians;
        this._isDirty = true;
    }

    public setPosition(x: number, y: number): void {
        this._position[0] = x;
        this._position[1] = y;
        this._isDirty = true;
    }

    // Matrix operations
    public getMatrix(): mat4 {
        if (this._isDirty) {
            this.updateMatrix();
            this._isDirty = false;
        }
        return this._matrix;
    }

    private updateMatrix(): void {
        // Reset to identity
        mat4.identity(this._matrix);
        
        // Apply transformations in order: Scale -> Rotate -> Translate
        // Note: OpenGL matrices are column-major, transformations appear in reverse order
        
        // Translate
        mat4.translate(this._matrix, this._matrix, vec3.fromValues(this._position[0], this._position[1], 0));
        
        // Rotate around Z-axis
        if (this._rotation !== 0) {
            mat4.rotateZ(this._matrix, this._matrix, this._rotation);
        }
        
        // Scale
        if (this._scale[0] !== 1 || this._scale[1] !== 1) {
            mat4.scale(this._matrix, this._matrix, vec3.fromValues(this._scale[0], this._scale[1], 1));
        }
    }

    // Utility methods
    public clone(): Transform {
        return new Transform(this.x, this.y, this.rotation, this.scaleX, this.scaleY);
    }

    public copy(other: Transform): void {
        this.setPosition(other.x, other.y);
        this.rotation = other.rotation;
        this.scaleX = other.scaleX;
        this.scaleY = other.scaleY;
    }

    public reset(): void {
        this.setPosition(0, 0);
        this.rotation = 0;
        this.scaleX = 1;
        this.scaleY = 1;
    }
}