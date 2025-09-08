# Phase 1: Player Implementation

## Overview
Phase 1 creates a controllable player character on a 2D canvas. The player is represented as a green square that moves smoothly with WASD/arrow key input and stays within screen boundaries.

## Prerequisites
- Reference `environment.md` for all constants and configuration values
- WebGL 2.0 capable browser
- Basic TypeScript/JavaScript environment with Vite build system

## Expected Result
A green 50x50 pixel square at the center of an 800x600 black canvas that:
- Responds to WASD and arrow key input
- Moves at 300 pixels/second with smooth acceleration
- Stays within canvas boundaries
- Runs at 60fps with proper delta time

## Step-by-Step Implementation

### Step 1: WebGL Context Setup
Create the core rendering system:

```typescript
// WebGLRenderer.ts - Initialize WebGL2 context
class WebGLRenderer {
    constructor(canvas: HTMLCanvasElement) {
        const gl = canvas.getContext('webgl2');
        gl.viewport(0, 0, 800, 600); // From environment.md
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(0.1, 0.1, 0.1, 1.0); // Dark background
    }
    
    clear() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }
}
```

### Step 2: Shader System
Create vertex and fragment shaders for 2D rendering:

```typescript
// Vertex shader - transforms 2D positions
const VERTEX_SHADER = `#version 300 es
in vec2 a_position;
in vec4 a_color;
uniform vec2 u_resolution;
uniform mat4 u_transform;
out vec4 v_color;

void main() {
    vec4 transformedPos = u_transform * vec4(a_position, 0.0, 1.0);
    vec2 clipSpace = ((transformedPos.xy / u_resolution) * 2.0) - 1.0;
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    v_color = a_color;
}`;

// Fragment shader - solid colors
const FRAGMENT_SHADER = `#version 300 es
precision mediump float;
in vec4 v_color;
out vec4 outColor;
void main() {
    outColor = v_color;
}`;
```

### Step 3: Geometry System
Create the player's visual representation:

```typescript
// QuadGeometry.ts - 50x50 green square from environment.md
class QuadGeometry {
    constructor(gl: WebGL2RenderingContext) {
        // Vertex data: position (x, y) + color (r, g, b, a)
        const vertices = new Float32Array([
            -25, 25,   0, 1, 0, 1,  // Top-left - green [0,1,0,1]
            25,  25,   0, 1, 0, 1,  // Top-right
            25, -25,   0, 1, 0, 1,  // Bottom-right  
            -25,-25,   0, 1, 0, 1,  // Bottom-left
        ]);
        
        const indices = new Uint16Array([0, 1, 2, 2, 3, 0]);
        // Set up VAO, VBO, and attributes...
    }
}
```

### Step 4: Transform System
Handle positioning and matrix calculations:

```typescript
// Transform.ts - Position, rotation, scale with matrices
class Transform {
    constructor(x = 400, y = 300) { // Canvas center from environment.md
        this.position = [x, y];
        this.rotation = 0;
        this.scale = [1, 1];
    }
    
    getMatrix(): Float32Array {
        // Create 4x4 transformation matrix
        // Translate -> Rotate -> Scale order
        const matrix = mat4.create();
        mat4.translate(matrix, matrix, [this.position[0], this.position[1], 0]);
        if (this.rotation !== 0) {
            mat4.rotateZ(matrix, matrix, this.rotation);
        }
        mat4.scale(matrix, matrix, [this.scale[0], this.scale[1], 1]);
        return matrix;
    }
}
```

### Step 5: Input System
Handle keyboard input for player movement:

```typescript
// InputManager.ts - WASD and arrow key handling
class InputManager {
    private keysPressed = new Set<string>();
    
    constructor() {
        document.addEventListener('keydown', (e) => {
            this.keysPressed.add(e.code);
        });
        document.addEventListener('keyup', (e) => {
            this.keysPressed.delete(e.code);
        });
    }
    
    getMovementInput(): { x: number, y: number } {
        let x = 0, y = 0;
        if (this.keysPressed.has('KeyA') || this.keysPressed.has('ArrowLeft')) x -= 1;
        if (this.keysPressed.has('KeyD') || this.keysPressed.has('ArrowRight')) x += 1;
        if (this.keysPressed.has('KeyW') || this.keysPressed.has('ArrowUp')) y -= 1;
        if (this.keysPressed.has('KeyS') || this.keysPressed.has('ArrowDown')) y += 1;
        return { x, y };
    }
}
```

### Step 6: Player GameObject
Combine transform, physics, and input handling:

```typescript
// Player.ts - Controllable game object
class Player {
    transform: Transform;
    velocity = [0, 0];
    speed = 300; // From environment.md
    friction = 0.9; // From environment.md
    
    constructor(x = 400, y = 300) { // Canvas center
        this.transform = new Transform(x, y);
    }
    
    handleInput(input: {x: number, y: number}, deltaTime: number) {
        const force = [input.x * this.speed * deltaTime, input.y * this.speed * deltaTime];
        this.velocity[0] += force[0];
        this.velocity[1] += force[1];
    }
    
    update(deltaTime: number) {
        // Apply velocity to position
        this.transform.position[0] += this.velocity[0] * deltaTime;
        this.transform.position[1] += this.velocity[1] * deltaTime;
        
        // Apply friction
        this.velocity[0] *= this.friction;
        this.velocity[1] *= this.friction;
        
        // Boundary collision - keep within 800x600 canvas
        const halfSize = 25; // 50px square / 2
        this.transform.position[0] = Math.max(halfSize, Math.min(800 - halfSize, this.transform.position[0]));
        this.transform.position[1] = Math.max(halfSize, Math.min(600 - halfSize, this.transform.position[1]));
    }
}
```

### Step 7: Game Loop Integration
Put everything together in the main game loop:

```typescript
// main.ts - Complete Phase 1 implementation
class GameEngine {
    private renderer: WebGLRenderer;
    private shader: Shader;
    private quad: QuadGeometry;
    private inputManager: InputManager;
    private player: Player;
    private lastTime = 0;

    constructor() {
        const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.renderer = new WebGLRenderer(canvas);
        this.shader = new Shader(gl, VERTEX_SHADER, FRAGMENT_SHADER);
        this.quad = new QuadGeometry(gl);
        this.inputManager = new InputManager();
        this.player = new Player(); // Starts at center (400, 300)
        
        this.gameLoop();
    }

    gameLoop() {
        const currentTime = performance.now();
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 1/30);
        this.lastTime = currentTime;

        // Update
        const input = this.inputManager.getMovementInput();
        this.player.handleInput(input, deltaTime);
        this.player.update(deltaTime);

        // Render
        this.renderer.clear();
        this.shader.use();
        this.shader.setUniform2f('u_resolution', 800, 600);
        this.shader.setUniformMatrix4fv('u_transform', this.player.transform.getMatrix());
        this.quad.draw();

        requestAnimationFrame(() => this.gameLoop());
    }
}

new GameEngine();
```

## Verification Steps

After implementation, verify the following works correctly:

### Visual Verification
1. **Canvas appears**: 800x600 dark gray background
2. **Green square visible**: 50x50 pixel square at canvas center
3. **Smooth rendering**: No flickering or visual artifacts at 60fps

### Input Verification  
1. **WASD movement**: W=up, A=left, S=down, D=right
2. **Arrow key movement**: Same behavior as WASD
3. **Diagonal movement**: Multiple keys pressed simultaneously
4. **Responsive controls**: Immediate response to key press/release

### Physics Verification
1. **Smooth acceleration**: Square accelerates when key pressed
2. **Smooth deceleration**: Square slows down when key released (friction)
3. **Consistent speed**: Movement speed matches 300px/sec from environment.md
4. **Delta time independence**: Same movement speed regardless of framerate

### Boundary Verification
1. **Top boundary**: Square stops at Y=25 (half of 50px height)
2. **Bottom boundary**: Square stops at Y=575 (600 - 25)
3. **Left boundary**: Square stops at X=25 (half of 50px width)  
4. **Right boundary**: Square stops at X=775 (800 - 25)
5. **Corner collision**: Works correctly at canvas corners

### Console Verification (Debug Mode)
1. **Input logging**: Console shows input when WASD pressed
2. **Position logging**: Console shows player position updates
3. **No errors**: No WebGL or JavaScript errors in console

## Common Issues & Solutions

### Green square not visible
- Check canvas element ID matches "gameCanvas"  
- Verify WebGL2 context initialization
- Ensure shader compilation succeeded
- Check if square is positioned off-screen

### Movement not working
- Verify event listeners attached to document
- Check input key codes (KeyW, KeyA, KeyS, KeyD)
- Ensure input is properly passed to player.handleInput()
- Check if delta time is calculated correctly

### Square goes off-screen
- Verify boundary collision math (halfSize = 25)
- Check canvas dimensions (800x600)
- Ensure keepInBounds is called every frame

### Jerky movement
- Check delta time calculation (should be in seconds, not milliseconds)
- Verify requestAnimationFrame is used correctly
- Ensure friction value is between 0-1

## Success Criteria

Phase 1 is complete when:
✅ Green 50x50 square renders at canvas center  
✅ WASD and arrow keys control movement smoothly
✅ Square stays within 800x600 canvas boundaries
✅ Movement speed matches 300px/sec specification
✅ Game runs at stable 60fps with proper delta time
✅ No console errors or visual artifacts

**Ready for Phase 2**: With Phase 1 working, you now have the foundation to add enemies, collision detection, and game mechanics.