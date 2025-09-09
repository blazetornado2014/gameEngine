import { GameObject } from './GameObject';
import { Transform } from './Transform';
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
            case 0: // Top edge
                x = Math.random() * canvasWidth;
                y = -20; // Start slightly off-screen
                break;
            case 1: // Right edge
                x = canvasWidth + 20;
                y = Math.random() * canvasHeight;
                break;
            case 2: // Bottom edge
                x = Math.random() * canvasWidth;
                y = canvasHeight + 20;
                break;
            case 3: // Left edge
                x = -20;
                y = Math.random() * canvasHeight;
                break;
            default:
                x = 0;
                y = 0;
        }

        return new Enemy(x, y);
    }

    // Check if enemy is far off-screen (for cleanup)
    public isOffScreen(canvasWidth: number, canvasHeight: number, margin: number = 100): boolean {
        return (
            this.transform.x < -margin ||
            this.transform.x > canvasWidth + margin ||
            this.transform.y < -margin ||
            this.transform.y > canvasHeight + margin
        );
    }
}