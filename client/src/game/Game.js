import { GameConfig } from './config/GameConfig.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';

export class Game {
    constructor() {
        this.config = {
            type: Phaser.AUTO,
            width: GameConfig.GAME_WIDTH,
            height: GameConfig.GAME_HEIGHT,
            parent: 'game-container',
            backgroundColor: GameConfig.COLORS.BACKGROUND,
            scene: [MenuScene, GameScene, GameOverScene],
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 },
                    debug: false
                }
            },
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                min: {
                    width: 400,
                    height: 300
                },
                max: {
                    width: 1200,
                    height: 900
                }
            }
        };
        
        this.phaserGame = new Phaser.Game(this.config);
        this.setupEventListeners();
        
        console.log('Phaser game created with config:', this.config);
    }
    
    setupEventListeners() {
        // Handle game events
        this.phaserGame.events.on('ready', () => {
            console.log('Game is ready!');
        });
        
        // Handle scene transitions
        this.phaserGame.events.on('scene-transition', (data) => {
            console.log('Scene transition:', data);
        });
    }
    
    handleResize() {
        // Phaser handles resize automatically with our scale config
        console.log('Game resize handled by Phaser scale manager');
    }
    
    destroy() {
        if (this.phaserGame) {
            this.phaserGame.destroy(true);
            this.phaserGame = null;
        }
    }
}
