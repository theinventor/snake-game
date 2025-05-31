import { GameConfig } from '../config/GameConfig.js';

export class CollisionDetection {
    
    // Check if position is outside game boundaries
    static checkWallCollision(position) {
        return (
            position.x < 0 ||
            position.x >= GameConfig.GRID_WIDTH ||
            position.y < 0 ||
            position.y >= GameConfig.GRID_HEIGHT
        );
    }
    
    // Check if snake collides with itself
    static checkSelfCollision(snake) {
        const head = snake.getHead();
        const body = snake.getBody();
        
        // Check if head collides with any body segment (excluding head itself)
        for (let i = 1; i < body.length; i++) {
            if (head.x === body[i].x && head.y === body[i].y) {
                console.log('Self collision detected at:', head);
                return true;
            }
        }
        
        return false;
    }
    
    // Check if snake collides with level walls
    static checkLevelWallCollision(position, walls) {
        return walls.some(wall => 
            wall.x === position.x && wall.y === position.y
        );
    }
    
    // Check if snake head collides with food
    static checkFoodCollision(snakeHead, foodPosition) {
        return (
            snakeHead.x === foodPosition.x &&
            snakeHead.y === foodPosition.y
        );
    }
    
    // Check collision between two rectangular areas
    static checkRectCollision(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }
    
    // Check collision between two circular areas
    static checkCircleCollision(circle1, circle2) {
        const dx = circle1.x - circle2.x;
        const dy = circle1.y - circle2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < (circle1.radius + circle2.radius);
    }
    
    // Check if point is within a rectangular area
    static isPointInRect(point, rect) {
        return (
            point.x >= rect.x &&
            point.x <= rect.x + rect.width &&
            point.y >= rect.y &&
            point.y <= rect.y + rect.height
        );
    }
    
    // Check collision between snake and other snake (for multiplayer)
    static checkSnakeCollision(snake1, snake2) {
        const head1 = snake1.getHead();
        const body2 = snake2.getBody();
        
        return body2.some(segment => 
            head1.x === segment.x && head1.y === segment.y
        );
    }
    
    // Get all valid positions around a point (for AI or pathfinding)
    static getValidAdjacentPositions(position, obstacles = []) {
        const directions = [
            { x: 0, y: -1 }, // UP
            { x: 0, y: 1 },  // DOWN
            { x: -1, y: 0 }, // LEFT
            { x: 1, y: 0 }   // RIGHT
        ];
        
        const validPositions = [];
        
        directions.forEach(dir => {
            const newPos = {
                x: position.x + dir.x,
                y: position.y + dir.y
            };
            
            // Check if position is within bounds
            if (!this.checkWallCollision(newPos)) {
                // Check if position is not in obstacles
                const isObstacle = obstacles.some(obstacle => 
                    obstacle.x === newPos.x && obstacle.y === newPos.y
                );
                
                if (!isObstacle) {
                    validPositions.push(newPos);
                }
            }
        });
        
        return validPositions;
    }
    
    // Calculate distance between two points
    static getDistance(point1, point2) {
        const dx = point1.x - point2.x;
        const dy = point1.y - point2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // Calculate Manhattan distance (grid-based distance)
    static getManhattanDistance(point1, point2) {
        return Math.abs(point1.x - point2.x) + Math.abs(point1.y - point2.y);
    }
}
