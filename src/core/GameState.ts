export enum GameStateType {
    PLAYING = 'playing',
    GAME_OVER = 'game_over', 
    VICTORY = 'victory',
    PAUSED = 'paused'
}

export class GameState {
    private currentState: GameStateType = GameStateType.PLAYING;
    private score: number = 0;
    private startTime: number = 0;
    private gameTime: number = 0; // Current game time in seconds
    private winTime: number = 60; // Win after 60 seconds from environment.md
    private survivalPoints: number = 1; // Points per second survived
    
    // Event listeners for state changes
    private onStateChangeCallbacks: ((state: GameStateType) => void)[] = [];

    constructor(winTimeSeconds: number = 60) {
        this.winTime = winTimeSeconds;
        this.reset();
    }

    public startGame(): void {
        this.currentState = GameStateType.PLAYING;
        this.startTime = performance.now();
        this.notifyStateChange();
    }

    public pauseGame(): void {
        if (this.currentState === GameStateType.PLAYING) {
            this.currentState = GameStateType.PAUSED;
            this.notifyStateChange();
        }
    }

    public resumeGame(): void {
        if (this.currentState === GameStateType.PAUSED) {
            this.currentState = GameStateType.PLAYING;
            // Adjust start time to account for pause duration
            this.startTime = performance.now() - (this.gameTime * 1000);
            this.notifyStateChange();
        }
    }

    public gameOver(): void {
        this.currentState = GameStateType.GAME_OVER;
        this.notifyStateChange();
    }

    public victory(): void {
        this.currentState = GameStateType.VICTORY;
        this.notifyStateChange();
    }

    public reset(): void {
        this.currentState = GameStateType.PLAYING;
        this.score = 0;
        this.startTime = performance.now();
        this.gameTime = 0;
        this.notifyStateChange();
    }

    public update(currentTime: number): void {
        if (this.currentState === GameStateType.PLAYING) {
            // Calculate elapsed time
            this.gameTime = (currentTime - this.startTime) / 1000;
            
            // Award survival points (1 point per second)
            this.score = Math.floor(this.gameTime * this.survivalPoints);
            
            // Check for win condition
            if (this.gameTime >= this.winTime) {
                this.victory();
            }
        }
    }

    public addScore(points: number): void {
        this.score += points;
    }

    // Getters
    public getCurrentState(): GameStateType {
        return this.currentState;
    }

    public getScore(): number {
        return this.score;
    }

    public getGameTime(): number {
        return this.gameTime;
    }

    public getRemainingTime(): number {
        return Math.max(0, this.winTime - this.gameTime);
    }

    public getWinTime(): number {
        return this.winTime;
    }

    public getProgressPercent(): number {
        return Math.min(100, (this.gameTime / this.winTime) * 100);
    }

    // State checks
    public isPlaying(): boolean {
        return this.currentState === GameStateType.PLAYING;
    }

    public isGameOver(): boolean {
        return this.currentState === GameStateType.GAME_OVER;
    }

    public isVictory(): boolean {
        return this.currentState === GameStateType.VICTORY;
    }

    public isPaused(): boolean {
        return this.currentState === GameStateType.PAUSED;
    }

    public isGameActive(): boolean {
        return this.currentState === GameStateType.PLAYING || this.currentState === GameStateType.PAUSED;
    }

    // Event system
    public onStateChange(callback: (state: GameStateType) => void): void {
        this.onStateChangeCallbacks.push(callback);
    }

    private notifyStateChange(): void {
        this.onStateChangeCallbacks.forEach(callback => callback(this.currentState));
    }

    // Utility methods
    public getFormattedTime(): string {
        const minutes = Math.floor(this.gameTime / 60);
        const seconds = Math.floor(this.gameTime % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    public getFormattedRemainingTime(): string {
        const remaining = this.getRemainingTime();
        const minutes = Math.floor(remaining / 60);
        const seconds = Math.floor(remaining % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    public getGameStats(): {
        score: number;
        timeElapsed: number;
        timeSurvived: string;
        state: GameStateType;
    } {
        return {
            score: this.score,
            timeElapsed: this.gameTime,
            timeSurvived: this.getFormattedTime(),
            state: this.currentState
        };
    }
}