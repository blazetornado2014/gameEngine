import { GameObject } from './GameObject';
import { Player } from './GameObject';
import { Enemy } from './Enemy';
import { WebGLRenderer } from '../graphics/WebGLRenderer';
import { Shader } from '../graphics/Shader';
import { QuadGeometry } from '../graphics/Geometry';

export class GameObjectManager {
    private player: Player;
    private enemies: Enemy[] = [];
    
    // Rendering components
    private renderer: WebGLRenderer;
    private shader: Shader;
    private playerQuad: QuadGeometry;
    private enemyQuad: QuadGeometry;
    private gl: WebGL2RenderingContext;

    constructor(player: Player, renderer: WebGLRenderer, shader: Shader, gl: WebGL2RenderingContext) {
        this.player = player;
        this.renderer = renderer;
        this.shader = shader;
        this.gl = gl;

        // Create geometry for different object types
        // Player: Green 50x50 square from environment.md
        this.playerQuad = new QuadGeometry(gl, 50, 50, [0, 1, 0, 1]);
        
        // Enemy: Red 40x40 square from environment.md
        this.enemyQuad = new QuadGeometry(gl, 40, 40, [1, 0, 0, 1]);
    }

    public addEnemy(enemy: Enemy): void {
        this.enemies.push(enemy);
    }

    public removeEnemy(enemy: Enemy): void {
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
        }
    }

    public getEnemies(): Enemy[] {
        return this.enemies;
    }

    public getPlayer(): Player {
        return this.player;
    }

    public updateAll(deltaTime: number): void {
        // Update player
        this.player.update(deltaTime);

        // Update all enemies
        this.enemies.forEach(enemy => {
            enemy.update(deltaTime);
        });

        // Remove inactive enemies
        this.enemies = this.enemies.filter(enemy => enemy.active);
    }

    public renderAll(canvasWidth: number, canvasHeight: number): void {
        this.renderer.clear();
        this.shader.use();
        this.shader.setUniform2f('u_resolution', canvasWidth, canvasHeight);

        // Render player
        this.shader.setUniformMatrix4fv('u_transform', this.player.transform.getMatrix());
        this.playerQuad.draw();

        // Render all enemies
        this.enemies.forEach(enemy => {
            this.shader.setUniformMatrix4fv('u_transform', enemy.transform.getMatrix());
            this.enemyQuad.draw();
        });
    }

    public checkPlayerEnemyCollisions(): boolean {
        const playerSize = 50; // From environment.md
        const enemySize = 40;   // From environment.md

        for (const enemy of this.enemies) {
            if (this.checkAABBCollision(
                this.player.transform.x, this.player.transform.y, playerSize,
                enemy.transform.x, enemy.transform.y, enemySize
            )) {
                return true; // Collision detected
            }
        }

        return false; // No collisions
    }

    private checkAABBCollision(
        x1: number, y1: number, size1: number,
        x2: number, y2: number, size2: number
    ): boolean {
        const halfSize1 = size1 / 2;
        const halfSize2 = size2 / 2;

        return (
            x1 - halfSize1 < x2 + halfSize2 &&
            x1 + halfSize1 > x2 - halfSize2 &&
            y1 - halfSize1 < y2 + halfSize2 &&
            y1 + halfSize1 > y2 - halfSize2
        );
    }

    public getEnemyCount(): number {
        return this.enemies.length;
    }

    public clearAllEnemies(): void {
        this.enemies.forEach(enemy => enemy.destroy());
        this.enemies = [];
    }

    public destroy(): void {
        this.clearAllEnemies();
        this.playerQuad.destroy();
        this.enemyQuad.destroy();
    }
}