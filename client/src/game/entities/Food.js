import { GameConfig } from '../config/GameConfig.js';

export class Food {
    constructor(scene, x, y) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.graphics = scene.add.graphics();
        this.animationTime = 0;
        
        this.updateDisplay();
        console.log('Food created at position:', x, y);
    }
    
    updateDisplay() {
        this.graphics.clear();
        
        const pixelX = this.x * GameConfig.GRID_SIZE;
        const pixelY = this.y * GameConfig.GRID_SIZE;
        const size = GameConfig.GRID_SIZE;
        
        // Draw food as a circle with pulsing animation
        const pulseScale = 0.8 + Math.sin(this.animationTime * 0.1) * 0.2;
        const radius = (size / 2) * pulseScale;
        
        this.graphics.fillStyle(parseInt(GameConfig.COLORS.FOOD.replace('#', '0x')));
        this.graphics.fillCircle(
            pixelX + size / 2,
            pixelY + size / 2,
            radius
        );
        
        // Add highlight for better visibility
        this.graphics.fillStyle(0xFFFFFF, 0.3);
        this.graphics.fillCircle(
            pixelX + size / 2 - radius * 0.3,
            pixelY + size / 2 - radius * 0.3,
            radius * 0.3
        );
        
        this.animationTime++;
    }
    
    update() {
        this.updateDisplay();
    }
    
    getPosition() {
        return { x: this.x, y: this.y };
    }
    
    destroy() {
        if (this.graphics) {
            this.graphics.destroy();
        }
    }
}
