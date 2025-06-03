export class InputManager {
    constructor(scene) {
        this.scene = scene;
        this.lastInputTime = 0;
        this.inputBuffer = [];
        this.inputDelay = 0; // No delay for rapid inputs
        this.maxBufferSize = 2; // Allow buffering 2 moves ahead
        
        console.log('InputManager initialized');
    }
    
    handleInput(direction) {
        // Validate direction
        if (!this.isValidDirection(direction)) {
            console.warn('Invalid direction:', direction);
            return;
        }
        
        // Try to apply direction immediately - let Snake class handle validation
        if (this.scene.gameManager) {
            this.scene.gameManager.changeDirection(direction);
            console.log('Direction input received:', direction);
        }
        
        // For rapid inputs that might be blocked, also buffer them
        this.bufferInput(direction);
        
        // Send to multiplayer system if in multiplayer mode
        if (this.scene.multiplayerSystem) {
            this.scene.multiplayerSystem.sendInput(direction);
        }
    }
    
    isValidDirection(direction) {
        const validDirections = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
        return validDirections.includes(direction);
    }
    
    // Buffer input for smooth gameplay
    bufferInput(direction) {
        // Clear buffer if it has the same direction to avoid duplicates
        this.inputBuffer = this.inputBuffer.filter(buffered => buffered !== direction);
        
        if (this.inputBuffer.length < this.maxBufferSize) {
            this.inputBuffer.push(direction);
            console.log('Input buffered:', direction);
        }
    }
    
    getNextBufferedInput() {
        return this.inputBuffer.shift();
    }
    
    clearInputBuffer() {
        this.inputBuffer = [];
    }
    
    // Get opposite direction (for preventing reverse movement)
    getOppositeDirection(direction) {
        const opposites = {
            'UP': 'DOWN',
            'DOWN': 'UP',
            'LEFT': 'RIGHT',
            'RIGHT': 'LEFT'
        };
        return opposites[direction];
    }
    
    // Check if direction change is valid (not opposite to current)
    isValidDirectionChange(newDirection, currentDirection) {
        if (!currentDirection) return true;
        return this.getOppositeDirection(currentDirection) !== newDirection;
    }
}
