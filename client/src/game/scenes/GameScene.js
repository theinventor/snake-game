import { GameConfig } from '../config/GameConfig.js';
import { GameManager } from '../managers/GameManager.js';
import { InputManager } from '../managers/InputManager.js';
import { LevelSystem } from '../systems/LevelSystem.js';
import { AudioSystem } from '../systems/AudioSystem.js';
import { MultiplayerSystem } from '../systems/MultiplayerSystem.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        
        // Game systems
        this.gameManager = null;
        this.inputManager = null;
        this.levelSystem = null;
        this.audioSystem = null;
        this.multiplayerSystem = null;
        
        // Game state
        this.gameMode = 'singleplayer';
        this.isPaused = false;
        
        // UI elements
        this.scoreText = null;
        this.levelText = null;
        this.pauseText = null;
    }
    
    init(data) {
        this.gameMode = data.mode || 'singleplayer';
        console.log(`GameScene initialized in ${this.gameMode} mode`);
    }
    
    create() {
        console.log('GameScene: Creating game...');
        
        // Initialize systems
        this.audioSystem = new AudioSystem(this);
        this.levelSystem = new LevelSystem(this);
        this.inputManager = new InputManager(this);
        this.gameManager = new GameManager(this);
        
        // Initialize multiplayer if needed
        if (this.gameMode === 'multiplayer') {
            this.multiplayerSystem = new MultiplayerSystem(this);
        }
        
        // Create game world
        this.createGameWorld();
        this.createUI();
        
        // Set up input handling
        this.setupInputHandling();
        
        // Start the game
        this.gameManager.startGame();
        
        console.log('GameScene created successfully');
    }
    
    createGameWorld() {
        // Draw grid background
        this.drawGrid();
        
        // Create walls based on current level
        this.levelSystem.createLevel();
    }
    
    drawGrid() {
        const graphics = this.add.graphics();
        graphics.lineStyle(1, parseInt(GameConfig.COLORS.GRID_LINE.replace('#', '0x')), 0.3);
        
        // Vertical lines
        for (let x = 0; x <= GameConfig.GAME_WIDTH; x += GameConfig.GRID_SIZE) {
            graphics.moveTo(x, 0);
            graphics.lineTo(x, GameConfig.GAME_HEIGHT);
        }
        
        // Horizontal lines
        for (let y = 0; y <= GameConfig.GAME_HEIGHT; y += GameConfig.GRID_SIZE) {
            graphics.moveTo(0, y);
            graphics.lineTo(GameConfig.GAME_WIDTH, y);
        }
        
        graphics.strokePath();
    }
    
    createUI() {
        // Score display
        this.scoreText = this.add.text(20, 20, 'Score: 0', {
            fontSize: '24px',
            fill: GameConfig.COLORS.UI_TEXT,
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 2
        });
        
        // Level display
        this.levelText = this.add.text(20, 50, 'Level: 1', {
            fontSize: '18px',
            fill: GameConfig.COLORS.UI_TEXT,
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 2
        });
        
        // Pause text (hidden initially)
        this.pauseText = this.add.text(
            GameConfig.GAME_WIDTH / 2,
            GameConfig.GAME_HEIGHT / 2,
            'PAUSED\nPress P to resume',
            {
                fontSize: '32px',
                fill: GameConfig.COLORS.UI_TEXT,
                fontFamily: 'Arial',
                align: 'center',
                stroke: '#000',
                strokeThickness: 4
            }
        ).setOrigin(0.5).setVisible(false);
        
        // Multiplayer UI
        if (this.gameMode === 'multiplayer') {
            this.add.text(GameConfig.GAME_WIDTH - 20, 20, 'Multiplayer', {
                fontSize: '18px',
                fill: '#FFD700',
                fontFamily: 'Arial'
            }).setOrigin(1, 0);
        }
    }
    
    setupInputHandling() {
        // Movement controls
        GameConfig.CONTROLS.UP.forEach(key => {
            this.input.keyboard.on(`keydown-${key}`, () => {
                this.inputManager.handleInput('UP');
            });
        });
        
        GameConfig.CONTROLS.DOWN.forEach(key => {
            this.input.keyboard.on(`keydown-${key}`, () => {
                this.inputManager.handleInput('DOWN');
            });
        });
        
        GameConfig.CONTROLS.LEFT.forEach(key => {
            this.input.keyboard.on(`keydown-${key}`, () => {
                this.inputManager.handleInput('LEFT');
            });
        });
        
        GameConfig.CONTROLS.RIGHT.forEach(key => {
            this.input.keyboard.on(`keydown-${key}`, () => {
                this.inputManager.handleInput('RIGHT');
            });
        });
        
        // Pause control
        GameConfig.CONTROLS.PAUSE.forEach(key => {
            this.input.keyboard.on(`keydown-${key}`, () => {
                this.togglePause();
            });
        });
        
        // Restart control
        GameConfig.CONTROLS.RESTART.forEach(key => {
            this.input.keyboard.on(`keydown-${key}`, () => {
                this.restartGame();
            });
        });
        
        // ESC to menu
        this.input.keyboard.on('keydown-ESC', () => {
            this.returnToMenu();
        });
    }
    
    update(time, delta) {
        if (!this.isPaused && this.gameManager) {
            this.gameManager.update(time, delta);
        }
        
        if (this.multiplayerSystem) {
            this.multiplayerSystem.update(time, delta);
        }
    }
    
    updateScore(score) {
        this.scoreText.setText(`Score: ${score}`);
    }
    
    updateLevel(level) {
        this.levelText.setText(`Level: ${level}`);
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        this.pauseText.setVisible(this.isPaused);
        
        if (this.isPaused) {
            this.audioSystem.pauseBackgroundMusic();
        } else {
            this.audioSystem.resumeBackgroundMusic();
        }
        
        console.log(`Game ${this.isPaused ? 'paused' : 'resumed'}`);
    }
    
    gameOver(finalScore) {
        console.log(`Game Over! Final Score: ${finalScore}`);
        this.audioSystem.playSound('hit');
        this.scene.start('GameOverScene', { 
            score: finalScore,
            level: this.levelSystem.getCurrentLevel(),
            mode: this.gameMode
        });
    }
    
    restartGame() {
        console.log('Restarting game...');
        this.scene.restart({ mode: this.gameMode });
    }
    
    returnToMenu() {
        console.log('Returning to menu...');
        this.scene.start('MenuScene');
    }
}
