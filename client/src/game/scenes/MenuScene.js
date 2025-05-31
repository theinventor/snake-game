import { GameConfig } from '../config/GameConfig.js';
import { AudioSystem } from '../systems/AudioSystem.js';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
        this.audioSystem = null;
    }
    
    preload() {
        // Load audio files
        this.load.audio('background', '/sounds/background.mp3');
        this.load.audio('hit', '/sounds/hit.mp3');
        this.load.audio('success', '/sounds/success.mp3');
        
        console.log('MenuScene: Loading assets...');
    }
    
    create() {
        console.log('MenuScene: Creating menu...');
        
        // Initialize audio system
        this.audioSystem = new AudioSystem(this);
        
        // Add title
        this.add.text(
            GameConfig.GAME_WIDTH / 2,
            GameConfig.GAME_HEIGHT / 3,
            'SNAKE GAME',
            {
                fontSize: '48px',
                fill: GameConfig.COLORS.UI_TEXT,
                fontFamily: 'Arial',
                stroke: '#000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);
        
        // Add instructions
        const instructions = [
            'Use WASD or Arrow Keys to move',
            'Eat food to grow and score points',
            'Avoid hitting walls or yourself',
            '',
            'Press SPACE to start',
            'Press P to pause during game'
        ];
        
        instructions.forEach((text, index) => {
            this.add.text(
                GameConfig.GAME_WIDTH / 2,
                GameConfig.GAME_HEIGHT / 2 + (index * 25),
                text,
                {
                    fontSize: '18px',
                    fill: GameConfig.COLORS.UI_TEXT,
                    fontFamily: 'Arial'
                }
            ).setOrigin(0.5);
        });
        
        // Add multiplayer option
        this.add.text(
            GameConfig.GAME_WIDTH / 2,
            GameConfig.GAME_HEIGHT - 100,
            'Press M for Multiplayer Mode',
            {
                fontSize: '16px',
                fill: '#FFD700',
                fontFamily: 'Arial'
            }
        ).setOrigin(0.5);
        
        // Input handling
        this.input.keyboard.on('keydown-SPACE', () => {
            this.startSinglePlayer();
        });
        
        this.input.keyboard.on('keydown-M', () => {
            this.startMultiplayer();
        });
        
        // Start background music
        this.audioSystem.playBackgroundMusic();
    }
    
    startSinglePlayer() {
        console.log('Starting single player game...');
        this.audioSystem.playSound('success');
        this.scene.start('GameScene', { mode: 'singleplayer' });
    }
    
    startMultiplayer() {
        console.log('Starting multiplayer game...');
        this.audioSystem.playSound('success');
        this.scene.start('GameScene', { mode: 'multiplayer' });
    }
}
