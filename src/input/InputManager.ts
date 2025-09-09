export enum Key {
    W = 'KeyW',
    A = 'KeyA', 
    S = 'KeyS',
    D = 'KeyD',
    ARROW_UP = 'ArrowUp',
    ARROW_LEFT = 'ArrowLeft',
    ARROW_DOWN = 'ArrowDown',
    ARROW_RIGHT = 'ArrowRight',
    SPACE = 'Space',
    ENTER = 'Enter',
    ESCAPE = 'Escape',
    R = 'KeyR',
    P = 'KeyP'
}

export class InputManager {
    private static instance: InputManager;
    private keysPressed: Set<string> = new Set();
    private keysJustPressed: Set<string> = new Set();
    private keysJustReleased: Set<string> = new Set();
    private prevKeysPressed: Set<string> = new Set();

    private constructor() {
        this.setupEventListeners();
    }

    public static getInstance(): InputManager {
        if (!InputManager.instance) {
            InputManager.instance = new InputManager();
        }
        return InputManager.instance;
    }

    private setupEventListeners(): void {
        document.addEventListener('keydown', (event) => {
            event.preventDefault();
            this.keysPressed.add(event.code);
        });

        document.addEventListener('keyup', (event) => {
            event.preventDefault();
            this.keysPressed.delete(event.code);
        });

        // Ensure the window can receive key events
        window.focus();
    }

    public update(): void {
        // Update just pressed/released keys
        this.keysJustPressed.clear();
        this.keysJustReleased.clear();

        // Keys that are pressed now but weren't before = just pressed
        for (const key of this.keysPressed) {
            if (!this.prevKeysPressed.has(key)) {
                this.keysJustPressed.add(key);
            }
        }

        // Keys that were pressed before but aren't now = just released
        for (const key of this.prevKeysPressed) {
            if (!this.keysPressed.has(key)) {
                this.keysJustReleased.add(key);
            }
        }

        // Update previous frame state
        this.prevKeysPressed.clear();
        for (const key of this.keysPressed) {
            this.prevKeysPressed.add(key);
        }
    }

    public isKeyPressed(key: Key | string): boolean {
        return this.keysPressed.has(key);
    }

    public isKeyJustPressed(key: Key | string): boolean {
        return this.keysJustPressed.has(key);
    }

    public isKeyJustReleased(key: Key | string): boolean {
        return this.keysJustReleased.has(key);
    }

    // Convenience methods for common movement keys
    public getMovementInput(): { x: number; y: number } {
        let x = 0;
        let y = 0;

        // WASD or Arrow keys
        if (this.isKeyPressed(Key.A) || this.isKeyPressed(Key.ARROW_LEFT)) {
            x -= 1;
        }
        if (this.isKeyPressed(Key.D) || this.isKeyPressed(Key.ARROW_RIGHT)) {
            x += 1;
        }
        if (this.isKeyPressed(Key.W) || this.isKeyPressed(Key.ARROW_UP)) {
            y -= 1; // Changed: W/Up arrow moves up (negative Y)
        }
        if (this.isKeyPressed(Key.S) || this.isKeyPressed(Key.ARROW_DOWN)) {
            y += 1; // Changed: S/Down arrow moves down (positive Y)
        }

        return { x, y };
    }

    public destroy(): void {
        document.removeEventListener('keydown', () => {});
        document.removeEventListener('keyup', () => {});
    }
}