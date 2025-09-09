import { Enemy } from './Enemy';
import { GameObject } from './GameObject';

export class EnemySpawner {
    private lastSpawnTime: number = 0;
    private spawnInterval: number = 3000; // 3 seconds from environment.md
    private maxEnemies: number = 10; // Prevent too many enemies
    private canvasWidth: number;
    private canvasHeight: number;
    private target: GameObject;

    constructor(canvasWidth: number, canvasHeight: number, target: GameObject) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.target = target;
    }

    public update(currentTime: number, enemies: Enemy[]): Enemy | null {
        // Check if it's time to spawn and we haven't reached max enemies
        if (currentTime - this.lastSpawnTime >= this.spawnInterval && enemies.length < this.maxEnemies) {
            this.lastSpawnTime = currentTime;
            return this.spawnEnemy();
        }

        return null;
    }

    private spawnEnemy(): Enemy {
        // Create enemy at random edge
        const enemy = Enemy.spawnAtRandomEdge(this.canvasWidth, this.canvasHeight);
        
        // Set the enemy's target (usually the player)
        enemy.setTarget(this.target);
        
        return enemy;
    }

    public setSpawnRate(intervalMs: number): void {
        this.spawnInterval = intervalMs;
    }

    public setMaxEnemies(max: number): void {
        this.maxEnemies = max;
    }

    public setTarget(target: GameObject): void {
        this.target = target;
    }

    // Clean up off-screen enemies
    public cleanupEnemies(enemies: Enemy[]): Enemy[] {
        return enemies.filter(enemy => {
            if (enemy.isOffScreen(this.canvasWidth, this.canvasHeight)) {
                enemy.destroy();
                return false;
            }
            return enemy.active;
        });
    }
}