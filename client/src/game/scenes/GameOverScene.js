import { GameConfig } from '../config/GameConfig.js';

export class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
        this.finalScore = 0;
        this.finalLevel = 1;
        this.gameMode = 'singleplayer';
    }
    
    init(data) {
        this.finalScore = data.score || 0;
        this.finalLevel = data.level || 1;
        this.gameMode = data.mode || 'singleplayer';
    }
    
    create() {
        console.log('GameOverScene: Game over with score:', this.finalScore);
        
        // Game Over title
        this.add.text(
            GameConfig.GAME_WIDTH / 2,
            GameConfig.GAME_HEIGHT / 4,
            'GAME OVER',
            {
                fontSize: '48px',
                fill: '#FF5722',
                fontFamily: 'Arial',
                stroke: '#000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);
        
        // Score display
        this.add.text(
            GameConfig.GAME_WIDTH / 2,
            GameConfig.GAME_HEIGHT / 2 - 40,
            `Final Score: ${this.finalScore}`,
            {
                fontSize: '32px',
                fill: GameConfig.COLORS.UI_TEXT,
                fontFamily: 'Arial',
                stroke: '#000',
                strokeThickness: 2
            }
        ).setOrigin(0.5);
        
        // Level display
        this.add.text(
            GameConfig.GAME_WIDTH / 2,
            GameConfig.GAME_HEIGHT / 2,
            `Level Reached: ${this.finalLevel}`,
            {
                fontSize: '24px',
                fill: GameConfig.COLORS.UI_TEXT,
                fontFamily: 'Arial',
                stroke: '#000',
                strokeThickness: 2
            }
        ).setOrigin(0.5);
        
        // High score check
        this.checkHighScore();
        
        // Controls
        const controls = [
            'Press SPACE to play again',
            'Press M to return to menu',
            'Press ESC to exit'
        ];
        
        controls.forEach((text, index) => {
            this.add.text(
                GameConfig.GAME_WIDTH / 2,
                GameConfig.GAME_HEIGHT / 2 + 80 + (index * 30),
                text,
                {
                    fontSize: '18px',
                    fill: GameConfig.COLORS.UI_TEXT,
                    fontFamily: 'Arial'
                }
            ).setOrigin(0.5);
        });
        
        // Input handling
        this.input.keyboard.on('keydown-SPACE', () => {
            this.playAgain();
        });
        
        this.input.keyboard.on('keydown-M', () => {
            this.returnToMenu();
        });
        
        this.input.keyboard.on('keydown-ESC', () => {
            this.exitGame();
        });
    }
    
    checkHighScore() {
        // Get stored high score
        const storedHighScore = localStorage.getItem('snake-high-score') || 0;
        const highScore = Math.max(parseInt(storedHighScore), this.finalScore);
        
        // If new high score, save it
        if (this.finalScore > parseInt(storedHighScore)) {
            localStorage.setItem('snake-high-score', this.finalScore.toString());
            
            // Display new high score message
            this.add.text(
                GameConfig.GAME_WIDTH / 2,
                GameConfig.GAME_HEIGHT / 2 + 40,
                'NEW HIGH SCORE!',
                {
                    fontSize: '24px',
                    fill: '#FFD700',
                    fontFamily: 'Arial',
                    stroke: '#000',
                    strokeThickness: 2
                }
            ).setOrigin(0.5);
        } else {
            // Display current high score
            this.add.text(
                GameConfig.GAME_WIDTH / 2,
                GameConfig.GAME_HEIGHT / 2 + 40,
                `High Score: ${highScore}`,
                {
                    fontSize: '20px',
                    fill: '#FFD700',
                    fontFamily: 'Arial',
                    stroke: '#000',
                    strokeThickness: 2
                }
            ).setOrigin(0.5);
        }
    }
    
    playAgain() {
        console.log('Playing again...');
        this.scene.start('GameScene', { mode: this.gameMode });
    }
    
    returnToMenu() {
        console.log('Returning to menu...');
        this.scene.start('MenuScene');
    }
    
    exitGame() {
        console.log('Exiting game...');
        // In a web environment, we can't actually close the window
        // So we'll just return to menu
        this.returnToMenu();
    }
}
