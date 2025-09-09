import { GameState, GameStateType } from '../core/GameState';

export class GameUI {
    private uiCanvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private gameState: GameState;

    // UI styling constants from environment.md
    private readonly UI_FONT = 'Courier New, monospace';
    private readonly UI_COLOR = '#ffffff';
    private readonly UI_BACKGROUND = 'rgba(0, 0, 0, 0.8)';
    private readonly UI_ACCENT = '#007acc';

    constructor(uiCanvas: HTMLCanvasElement, gameState: GameState) {
        this.uiCanvas = uiCanvas;
        this.gameState = gameState;
        
        // Get 2D context for UI rendering from dedicated UI canvas
        const ctx = uiCanvas.getContext('2d');
        if (!ctx) {
            throw new Error('Failed to get 2D context for UI rendering from UI canvas');
        }
        this.ctx = ctx;
    }

    public render(): void {
        // Clear the UI canvas first
        this.ctx.clearRect(0, 0, this.uiCanvas.width, this.uiCanvas.height);
        
        const state = this.gameState.getCurrentState();
        
        switch (state) {
            case GameStateType.PLAYING:
                this.renderGameplayUI();
                break;
            case GameStateType.PAUSED:
                this.renderGameplayUI();
                this.renderPauseOverlay();
                break;
            case GameStateType.GAME_OVER:
                this.renderGameOverScreen();
                break;
            case GameStateType.VICTORY:
                this.renderVictoryScreen();
                break;
        }
    }

    private renderGameplayUI(): void {
        const ctx = this.ctx;
        const score = this.gameState.getScore();
        const remainingTime = this.gameState.getFormattedRemainingTime();
        
        // Score display (top-left)
        ctx.fillStyle = this.UI_COLOR;
        ctx.font = '24px ' + this.UI_FONT;
        ctx.textAlign = 'left';
        ctx.fillText(`Score: ${score}`, 20, 40);
        
        // Timer display (top-right)
        ctx.textAlign = 'right';
        ctx.fillText(`Time: ${remainingTime}`, this.uiCanvas.width - 20, 40);
        
        // Progress bar (top-center)
        this.renderProgressBar();
    }

    private renderProgressBar(): void {
        const ctx = this.ctx;
        const progress = this.gameState.getProgressPercent();
        const barWidth = 200;
        const barHeight = 8;
        const x = (this.uiCanvas.width - barWidth) / 2;
        const y = 20;
        
        // Background bar
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Progress fill
        ctx.fillStyle = this.UI_ACCENT;
        ctx.fillRect(x, y, (barWidth * progress) / 100, barHeight);
        
        // Border
        ctx.strokeStyle = this.UI_COLOR;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, barWidth, barHeight);
    }

    private renderPauseOverlay(): void {
        const ctx = this.ctx;
        
        // Semi-transparent overlay
        ctx.fillStyle = this.UI_BACKGROUND;
        ctx.fillRect(0, 0, this.uiCanvas.width, this.uiCanvas.height);
        
        // Pause text
        ctx.fillStyle = this.UI_COLOR;
        ctx.font = '48px ' + this.UI_FONT;
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', this.uiCanvas.width / 2, this.uiCanvas.height / 2);
        
        ctx.font = '24px ' + this.UI_FONT;
        ctx.fillText('Press SPACE to resume', this.uiCanvas.width / 2, this.uiCanvas.height / 2 + 50);
    }

    private renderGameOverScreen(): void {
        const ctx = this.ctx;
        const stats = this.gameState.getGameStats();
        
        // Background overlay
        ctx.fillStyle = this.UI_BACKGROUND;
        ctx.fillRect(0, 0, this.uiCanvas.width, this.uiCanvas.height);
        
        // Game Over title
        ctx.fillStyle = '#ff4444';
        ctx.font = '48px ' + this.UI_FONT;
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', this.uiCanvas.width / 2, this.uiCanvas.height / 2 - 80);
        
        // Stats
        ctx.fillStyle = this.UI_COLOR;
        ctx.font = '24px ' + this.UI_FONT;
        ctx.fillText(`Final Score: ${stats.score}`, this.uiCanvas.width / 2, this.uiCanvas.height / 2 - 20);
        ctx.fillText(`Time Survived: ${stats.timeSurvived}`, this.uiCanvas.width / 2, this.uiCanvas.height / 2 + 10);
        
        // Restart instruction
        ctx.font = '20px ' + this.UI_FONT;
        ctx.fillStyle = this.UI_ACCENT;
        ctx.fillText('Press R to restart', this.uiCanvas.width / 2, this.uiCanvas.height / 2 + 60);
    }

    private renderVictoryScreen(): void {
        const ctx = this.ctx;
        const stats = this.gameState.getGameStats();
        
        // Background overlay
        ctx.fillStyle = this.UI_BACKGROUND;
        ctx.fillRect(0, 0, this.uiCanvas.width, this.uiCanvas.height);
        
        // Victory title
        ctx.fillStyle = '#44ff44';
        ctx.font = '48px ' + this.UI_FONT;
        ctx.textAlign = 'center';
        ctx.fillText('VICTORY!', this.uiCanvas.width / 2, this.uiCanvas.height / 2 - 80);
        
        // Congratulations
        ctx.fillStyle = this.UI_COLOR;
        ctx.font = '24px ' + this.UI_FONT;
        ctx.fillText('You survived the enemies!', this.uiCanvas.width / 2, this.uiCanvas.height / 2 - 40);
        
        // Stats
        ctx.fillText(`Final Score: ${stats.score}`, this.uiCanvas.width / 2, this.uiCanvas.height / 2 - 10);
        ctx.fillText(`Survival Time: ${stats.timeSurvived}`, this.uiCanvas.width / 2, this.uiCanvas.height / 2 + 20);
        
        // Restart instruction
        ctx.font = '20px ' + this.UI_FONT;
        ctx.fillStyle = this.UI_ACCENT;
        ctx.fillText('Press R to play again', this.uiCanvas.width / 2, this.uiCanvas.height / 2 + 70);
    }

    public renderCustomMessage(message: string, subMessage?: string): void {
        const ctx = this.ctx;
        
        // Background overlay
        ctx.fillStyle = this.UI_BACKGROUND;
        ctx.fillRect(0, 0, this.uiCanvas.width, this.uiCanvas.height);
        
        // Main message
        ctx.fillStyle = this.UI_COLOR;
        ctx.font = '36px ' + this.UI_FONT;
        ctx.textAlign = 'center';
        ctx.fillText(message, this.uiCanvas.width / 2, this.uiCanvas.height / 2);
        
        // Sub message if provided
        if (subMessage) {
            ctx.font = '20px ' + this.UI_FONT;
            ctx.fillText(subMessage, this.uiCanvas.width / 2, this.uiCanvas.height / 2 + 40);
        }
    }

    // Utility methods for UI interaction
    public isPointInRestartArea(x: number, y: number): boolean {
        // Simple check if click is in the lower half of screen (where restart text appears)
        return y > this.uiCanvas.height / 2 + 40;
    }

    public destroy(): void {
        // Cleanup if needed
    }
}