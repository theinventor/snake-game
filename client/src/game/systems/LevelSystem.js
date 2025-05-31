import { GameConfig } from '../config/GameConfig.js';

export class LevelSystem {
    constructor(scene) {
        this.scene = scene;
        this.currentLevel = 1;
        this.walls = [];
        this.wallGraphics = scene.add.graphics();
        
        console.log('LevelSystem initialized');
    }
    
    createLevel() {
        this.clearWalls();
        
        switch (this.currentLevel) {
            case 1:
                this.createLevel1();
                break;
            case 2:
                this.createLevel2();
                break;
            case 3:
                this.createLevel3();
                break;
            default:
                this.createRandomLevel();
                break;
        }
        
        this.drawWalls();
        console.log(`Level ${this.currentLevel} created with ${this.walls.length} walls`);
    }
    
    createLevel1() {
        // Basic level - just outer walls (handled by collision detection)
        // No internal walls for level 1
    }
    
    createLevel2() {
        // Add some simple obstacles
        const centerX = Math.floor(GameConfig.GRID_WIDTH / 2);
        const centerY = Math.floor(GameConfig.GRID_HEIGHT / 2);
        
        // Horizontal wall in center
        for (let x = centerX - 5; x <= centerX + 5; x++) {
            this.walls.push({ x, y: centerY });
        }
    }
    
    createLevel3() {
        // More complex obstacles
        const centerX = Math.floor(GameConfig.GRID_WIDTH / 2);
        const centerY = Math.floor(GameConfig.GRID_HEIGHT / 2);
        
        // Cross pattern
        for (let x = centerX - 3; x <= centerX + 3; x++) {
            this.walls.push({ x, y: centerY });
        }
        for (let y = centerY - 3; y <= centerY + 3; y++) {
            this.walls.push({ x: centerX, y });
        }
        
        // Corner blocks
        this.addCornerBlocks();
    }
    
    createRandomLevel() {
        // Generate random obstacles for higher levels
        const numObstacles = Math.min(this.currentLevel - 1, 10);
        
        for (let i = 0; i < numObstacles; i++) {
            this.addRandomObstacle();
        }
    }
    
    addCornerBlocks() {
        const margin = 3;
        const blockSize = 2;
        
        // Top-left
        for (let x = margin; x < margin + blockSize; x++) {
            for (let y = margin; y < margin + blockSize; y++) {
                this.walls.push({ x, y });
            }
        }
        
        // Top-right
        for (let x = GameConfig.GRID_WIDTH - margin - blockSize; x < GameConfig.GRID_WIDTH - margin; x++) {
            for (let y = margin; y < margin + blockSize; y++) {
                this.walls.push({ x, y });
            }
        }
        
        // Bottom-left
        for (let x = margin; x < margin + blockSize; x++) {
            for (let y = GameConfig.GRID_HEIGHT - margin - blockSize; y < GameConfig.GRID_HEIGHT - margin; y++) {
                this.walls.push({ x, y });
            }
        }
        
        // Bottom-right
        for (let x = GameConfig.GRID_WIDTH - margin - blockSize; x < GameConfig.GRID_WIDTH - margin; x++) {
            for (let y = GameConfig.GRID_HEIGHT - margin - blockSize; y < GameConfig.GRID_HEIGHT - margin; y++) {
                this.walls.push({ x, y });
            }
        }
    }
    
    addRandomObstacle() {
        const length = Math.floor(Math.random() * 5) + 3;
        const horizontal = Math.random() > 0.5;
        
        let startX, startY;
        
        if (horizontal) {
            startX = Math.floor(Math.random() * (GameConfig.GRID_WIDTH - length));
            startY = Math.floor(Math.random() * GameConfig.GRID_HEIGHT);
            
            for (let i = 0; i < length; i++) {
                this.walls.push({ x: startX + i, y: startY });
            }
        } else {
            startX = Math.floor(Math.random() * GameConfig.GRID_WIDTH);
            startY = Math.floor(Math.random() * (GameConfig.GRID_HEIGHT - length));
            
            for (let i = 0; i < length; i++) {
                this.walls.push({ x: startX, y: startY + i });
            }
        }
    }
    
    drawWalls() {
        this.wallGraphics.clear();
        this.wallGraphics.fillStyle(parseInt(GameConfig.COLORS.WALL.replace('#', '0x')));
        
        this.walls.forEach(wall => {
            const x = wall.x * GameConfig.GRID_SIZE;
            const y = wall.y * GameConfig.GRID_SIZE;
            
            this.wallGraphics.fillRect(x, y, GameConfig.GRID_SIZE, GameConfig.GRID_SIZE);
            
            // Add border
            this.wallGraphics.lineStyle(1, 0x000000, 0.5);
            this.wallGraphics.strokeRect(x, y, GameConfig.GRID_SIZE, GameConfig.GRID_SIZE);
        });
    }
    
    clearWalls() {
        this.walls = [];
        this.wallGraphics.clear();
    }
    
    nextLevel() {
        this.currentLevel++;
        this.createLevel();
    }
    
    getCurrentLevel() {
        return this.currentLevel;
    }
    
    getWalls() {
        return this.walls.slice();
    }
    
    isPositionOccupied(position) {
        return this.walls.some(wall => 
            wall.x === position.x && wall.y === position.y
        );
    }
}
