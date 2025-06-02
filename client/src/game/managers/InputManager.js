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
        const currentTime = Date.now();
        
        // Validate direction
        if (!this.isValidDirection(direction)) {
            console.warn('Invalid direction:', direction);
            return;
        }
        
        // For very rapid inputs, use buffering
        if (currentTime - this.lastInputTime < 50) {
            this.bufferInput(direction);
            return;
        }
        
        // Send to game manager immediately
        if (this.scene.gameManager) {
            this.scene.gameManager.changeDirection(direction);
            this.lastInputTime = currentTime;
            
            console.log('Direction changed to:', direction);
        }
        
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
        if (this.inputBuffer.length < this.maxBufferSize) {
            // Only buffer if it's a valid direction change
            const lastBuffered = this.inputBuffer[this.inputBuffer.length - 1];
            if (!lastBuffered || this.isValidDirectionChange(direction, lastBuffered)) {
                this.inputBuffer.push(direction);
                console.log('Input buffered:', direction);
            }
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
