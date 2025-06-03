import { GameConfig } from '../config/GameConfig.js';

export class Snake {
    constructor(scene, startX, startY) {
        this.scene = scene;
        this.body = [];
        this.direction = 'RIGHT';
        this.nextDirection = 'RIGHT';
        this.graphics = scene.add.graphics();
        
        // Initialize snake body
        for (let i = 0; i < GameConfig.INITIAL_SNAKE_LENGTH; i++) {
            this.body.push({
                x: startX - i,
                y: startY
            });
        }
        
        this.updateDisplay();
        console.log('Snake created at position:', startX, startY);
    }
    
    move() {
        // Update direction
        this.direction = this.nextDirection;
        
        // Calculate new head position
        const head = { ...this.body[0] };
        
        switch (this.direction) {
            case 'UP':
                head.y -= 1;
                break;
            case 'DOWN':
                head.y += 1;
                break;
            case 'LEFT':
                head.x -= 1;
                break;
            case 'RIGHT':
                head.x += 1;
                break;
        }
        
        // Add new head
        this.body.unshift(head);
        
        // Remove tail (unless growing)
        if (!this.shouldGrow) {
            this.body.pop();
        } else {
            this.shouldGrow = false;
        }
    }
    
    changeDirection(newDirection) {
        // Prevent reverse movement only if snake has more than 1 segment
        const opposites = {
            'UP': 'DOWN',
            'DOWN': 'UP',
            'LEFT': 'RIGHT',
            'RIGHT': 'LEFT'
        };
        
        // Allow any direction if snake is only head, or if not reverse direction
        if (this.body.length === 1 || opposites[this.direction] !== newDirection) {
            this.nextDirection = newDirection;
            console.log('Snake direction queued:', newDirection);
        } else {
            console.log('Reverse movement blocked:', newDirection);
        }
    }
    
    grow() {
        this.shouldGrow = true;
        console.log('Snake will grow on next move');
    }
    
    updateDisplay() {
        this.graphics.clear();
        
        // Draw snake body
        this.body.forEach((segment, index) => {
            const x = segment.x * GameConfig.GRID_SIZE;
            const y = segment.y * GameConfig.GRID_SIZE;
            
            if (index === 0) {
                // Head
                this.graphics.fillStyle(parseInt(GameConfig.COLORS.SNAKE_HEAD.replace('#', '0x')));
            } else {
                // Body
                this.graphics.fillStyle(parseInt(GameConfig.COLORS.SNAKE_BODY.replace('#', '0x')));
            }
            
            this.graphics.fillRect(x, y, GameConfig.GRID_SIZE, GameConfig.GRID_SIZE);
            
            // Add border for better visibility
            this.graphics.lineStyle(1, 0x000000, 0.3);
            this.graphics.strokeRect(x, y, GameConfig.GRID_SIZE, GameConfig.GRID_SIZE);
        });
    }
    
    getHead() {
        return this.body[0];
    }
    
    getBody() {
        return this.body.slice();
    }
    
    isPositionOccupied(position) {
        return this.body.some(segment => 
            segment.x === position.x && segment.y === position.y
        );
    }
    
    getLength() {
        return this.body.length;
    }
    
    destroy() {
        if (this.graphics) {
            this.graphics.destroy();
        }
    }
}
