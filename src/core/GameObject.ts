import { Transform } from './Transform';
import { vec2 } from 'gl-matrix';

export class GameObject {
    public transform: Transform;
    public velocity: vec2;
    public active: boolean = true;
    public name: string;
    
    // Physics properties
    public speed: number = 200; // pixels per second
    public friction: number = 0.8; // damping factor

    constructor(name: string = 'GameObject', x: number = 0, y: number = 0) {
        this.name = name;
        this.transform = new Transform(x, y);
        this.velocity = vec2.fromValues(0, 0);
    }

    public update(deltaTime: number): void {
        if (!this.active) return;

        // Apply velocity to position
        const displacement = vec2.create();
        vec2.scale(displacement, this.velocity, deltaTime);
        this.transform.translate(displacement[0], displacement[1]);

        // Apply friction (optional - makes movement feel less slippery)
        vec2.scale(this.velocity, this.velocity, this.friction);
    }

    // Movement methods
    public addForce(x: number, y: number): void {
        this.velocity[0] += x;
        this.velocity[1] += y;
    }

    public setVelocity(x: number, y: number): void {
        this.velocity[0] = x;
        this.velocity[1] = y;
    }

    public moveTowards(targetX: number, targetY: number, speed: number): void {
        const direction = vec2.fromValues(
            targetX - this.transform.x,
            targetY - this.transform.y
        );
        
        const distance = vec2.length(direction);
        if (distance > 0) {
            vec2.normalize(direction, direction);
            vec2.scale(direction, direction, speed);
            this.addForce(direction[0], direction[1]);
        }
    }

    // Boundary checking
    public keepInBounds(minX: number, minY: number, maxX: number, maxY: number, objectWidth: number = 0, objectHeight: number = 0): void {
        const halfWidth = objectWidth / 2;
        const halfHeight = objectHeight / 2;

        // Check X bounds
        if (this.transform.x - halfWidth < minX) {
            this.transform.x = minX + halfWidth;
            this.velocity[0] = 0; // Stop horizontal movement
        } else if (this.transform.x + halfWidth > maxX) {
            this.transform.x = maxX - halfWidth;
            this.velocity[0] = 0;
        }

        // Check Y bounds  
        if (this.transform.y - halfHeight < minY) {
            this.transform.y = minY + halfHeight;
            this.velocity[1] = 0; // Stop vertical movement
        } else if (this.transform.y + halfHeight > maxY) {
            this.transform.y = maxY - halfHeight;
            this.velocity[1] = 0;
        }
    }

    // Utility methods
    public getPosition(): vec2 {
        return this.transform.position;
    }

    public setPosition(x: number, y: number): void {
        this.transform.setPosition(x, y);
    }

    public getDistance(other: GameObject): number {
        const dx = this.transform.x - other.transform.x;
        const dy = this.transform.y - other.transform.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    public destroy(): void {
        this.active = false;
    }
}

// Specialized player-controlled game object
export class Player extends GameObject {
    constructor(x: number = 0, y: number = 0) {
        super('Player', x, y);
        this.speed = 300; // Slightly faster than default
        this.friction = 0.9; // Less friction for more responsive controls
    }

    public handleInput(input: { x: number; y: number }, deltaTime: number): void {
        // Apply input as force
        const force = vec2.fromValues(input.x * this.speed, input.y * this.speed);
        this.addForce(force[0] * deltaTime, force[1] * deltaTime);
    }
}