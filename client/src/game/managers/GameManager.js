import { GameConfig } from '../config/GameConfig.js';
import { Snake } from '../entities/Snake.js';
import { Food } from '../entities/Food.js';
import { CollisionDetection } from '../utils/CollisionDetection.js';

export class GameManager {
    constructor(scene) {
        this.scene = scene;
        this.snake = null;
        this.food = null;
        this.score = 0;
        this.gameStarted = false;
        this.gameOver = false;
        this.lastMoveTime = 0;
        
        console.log('GameManager initialized');
    }
    
    startGame() {
        console.log('Starting game...');
        
        // Create snake at center of grid
        const startX = Math.floor(GameConfig.GRID_WIDTH / 2);
        const startY = Math.floor(GameConfig.GRID_HEIGHT / 2);
        this.snake = new Snake(this.scene, startX, startY);
        
        // Create first food
        this.spawnFood();
        
        // Reset game state
        this.score = 0;
        this.gameStarted = true;
        this.gameOver = false;
        this.lastMoveTime = 0;
        
        // Update UI
        this.scene.updateScore(this.score);
        
        console.log('Game started successfully');
    }
    
    update(time, delta) {
        if (!this.gameStarted || this.gameOver) {
            return;
        }
        
        // Move snake at specified speed
        if (time - this.lastMoveTime > GameConfig.SNAKE_SPEED) {
            this.moveSnake();
            this.lastMoveTime = time;
        }
    }
    
    moveSnake() {
        if (!this.snake) return;
        
        // Process any buffered inputs before moving
        if (this.scene.inputManager) {
            const bufferedInput = this.scene.inputManager.getNextBufferedInput();
            if (bufferedInput) {
                this.snake.changeDirection(bufferedInput);
                console.log('Applied buffered direction:', bufferedInput);
            }
        }
        
        // Move snake
        this.snake.move();
        
        // Check collisions
        this.checkCollisions();
        
        // Update snake display
        this.snake.updateDisplay();
    }
    
    checkCollisions() {
        const head = this.snake.getHead();
        
        // Check wall collision
        if (CollisionDetection.checkWallCollision(head)) {
            this.endGame();
            return;
        }
        
        // Check self collision
        if (CollisionDetection.checkSelfCollision(this.snake)) {
            this.endGame();
            return;
        }
        
        // Check level wall collision
        if (this.scene.levelSystem && CollisionDetection.checkLevelWallCollision(head, this.scene.levelSystem.getWalls())) {
            this.endGame();
            return;
        }
        
        // Check food collision
        if (this.food && CollisionDetection.checkFoodCollision(head, this.food.getPosition())) {
            this.eatFood();
        }
    }
    
    eatFood() {
        console.log('Food eaten!');
        
        // Play sound
        this.scene.audioSystem.playSound('success');
        
        // Grow snake
        this.snake.grow();
        
        // Update score
        this.score += GameConfig.SCORING.FOOD_POINTS;
        this.scene.updateScore(this.score);
        
        // Remove current food
        this.food.destroy();
        
        // Spawn new food
        this.spawnFood();
        
        // Check for level progression
        this.checkLevelProgression();
    }
    
    spawnFood() {
        let attempts = 0;
        let foodPosition;
        
        // Find valid position for food (not on snake or walls)
        do {
            foodPosition = {
                x: Math.floor(Math.random() * GameConfig.GRID_WIDTH),
                y: Math.floor(Math.random() * GameConfig.GRID_HEIGHT)
            };
            attempts++;
        } while (this.isPositionOccupied(foodPosition) && attempts < 100);
        
        if (attempts >= 100) {
            console.warn('Could not find valid position for food!');
            // Place food in top-left corner as fallback
            foodPosition = { x: 0, y: 0 };
        }
        
        this.food = new Food(this.scene, foodPosition.x, foodPosition.y);
        console.log('Food spawned at:', foodPosition);
    }
    
    isPositionOccupied(position) {
        // Check if position is occupied by snake
        if (this.snake && this.snake.isPositionOccupied(position)) {
            return true;
        }
        
        // Check if position is occupied by level walls
        if (this.scene.levelSystem && this.scene.levelSystem.isPositionOccupied(position)) {
            return true;
        }
        
        return false;
    }
    
    checkLevelProgression() {
        const currentLevel = this.scene.levelSystem.getCurrentLevel();
        const requiredScore = currentLevel * 100; // Level up every 100 points
        
        if (this.score >= requiredScore) {
            this.scene.levelSystem.nextLevel();
            this.scene.updateLevel(this.scene.levelSystem.getCurrentLevel());
            console.log(`Level up! Now on level ${this.scene.levelSystem.getCurrentLevel()}`);
        }
    }
    
    changeDirection(direction) {
        if (this.snake && this.gameStarted && !this.gameOver) {
            this.snake.changeDirection(direction);
        }
    }
    
    endGame() {
        if (this.gameOver) return;
        
        console.log('Game ending...');
        this.gameOver = true;
        this.gameStarted = false;
        
        // Play game over sound
        this.scene.audioSystem.playSound('hit');
        
        // Transition to game over scene
        this.scene.time.delayedCall(1000, () => {
            this.scene.gameOver(this.score);
        });
    }
    
    getScore() {
        return this.score;
    }
    
    isGameOver() {
        return this.gameOver;
    }
}
