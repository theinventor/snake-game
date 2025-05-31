import { GameConfig } from '../config/GameConfig.js';

export class MultiplayerSystem {
    constructor(scene) {
        this.scene = scene;
        this.socket = null;
        this.playerId = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = GameConfig.MULTIPLAYER.RECONNECT_ATTEMPTS;
        this.otherPlayers = new Map();
        
        this.initializeConnection();
        console.log('MultiplayerSystem initialized');
    }
    
    initializeConnection() {
        try {
            // Initialize Socket.IO connection
            this.socket = io(GameConfig.MULTIPLAYER.SERVER_URL, {
                autoConnect: true,
                reconnection: true,
                reconnectionAttempts: this.maxReconnectAttempts,
                reconnectionDelay: 1000
            });
            
            this.setupEventHandlers();
            console.log('Attempting to connect to multiplayer server...');
        } catch (error) {
            console.error('Failed to initialize multiplayer connection:', error);
        }
    }
    
    setupEventHandlers() {
        // Connection events
        this.socket.on('connect', () => {
            this.isConnected = true;
            this.reconnectAttempts = 0;
            console.log('Connected to multiplayer server');
            
            // Join game room
            this.socket.emit('join-game', {
                gameType: 'snake'
            });
        });
        
        this.socket.on('disconnect', (reason) => {
            this.isConnected = false;
            console.log('Disconnected from multiplayer server:', reason);
            
            // Show disconnect message to user
            this.showConnectionStatus('Disconnected from server');
        });
        
        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            this.reconnectAttempts++;
            
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                this.showConnectionStatus('Failed to connect to multiplayer server');
            }
        });
        
        // Game events
        this.socket.on('player-joined', (data) => {
            this.playerId = data.playerId;
            console.log('Joined game with player ID:', this.playerId);
        });
        
        this.socket.on('player-update', (data) => {
            this.handlePlayerUpdate(data);
        });
        
        this.socket.on('player-left', (data) => {
            this.handlePlayerLeft(data);
        });
        
        this.socket.on('game-state', (data) => {
            this.handleGameStateUpdate(data);
        });
        
        // Input synchronization
        this.socket.on('input-update', (data) => {
            this.handleInputUpdate(data);
        });
    }
    
    sendInput(direction) {
        if (!this.isConnected || !this.socket) {
            console.warn('Cannot send input: not connected to server');
            return;
        }
        
        this.socket.emit('player-input', {
            playerId: this.playerId,
            direction: direction,
            timestamp: Date.now()
        });
    }
    
    sendGameState(gameState) {
        if (!this.isConnected || !this.socket) {
            return;
        }
        
        this.socket.emit('game-state-update', {
            playerId: this.playerId,
            gameState: gameState,
            timestamp: Date.now()
        });
    }
    
    handlePlayerUpdate(data) {
        const { playerId, position, score } = data;
        
        if (playerId === this.playerId) {
            return; // Don't update our own player
        }
        
        // Update or create other player
        if (!this.otherPlayers.has(playerId)) {
            this.createOtherPlayer(playerId, data);
        } else {
            this.updateOtherPlayer(playerId, data);
        }
    }
    
    createOtherPlayer(playerId, data) {
        console.log('Creating other player:', playerId);
        
        // Create visual representation of other player
        const playerGraphics = this.scene.add.graphics();
        
        const otherPlayer = {
            id: playerId,
            graphics: playerGraphics,
            position: data.position || { x: 0, y: 0 },
            score: data.score || 0,
            snake: data.snake || []
        };
        
        this.otherPlayers.set(playerId, otherPlayer);
        this.updateOtherPlayerDisplay(otherPlayer);
    }
    
    updateOtherPlayer(playerId, data) {
        const player = this.otherPlayers.get(playerId);
        if (!player) return;
        
        // Update player data
        if (data.position) player.position = data.position;
        if (data.score !== undefined) player.score = data.score;
        if (data.snake) player.snake = data.snake;
        
        this.updateOtherPlayerDisplay(player);
    }
    
    updateOtherPlayerDisplay(player) {
        player.graphics.clear();
        
        // Draw other player's snake with different color
        player.snake.forEach((segment, index) => {
            const x = segment.x * GameConfig.GRID_SIZE;
            const y = segment.y * GameConfig.GRID_SIZE;
            
            if (index === 0) {
                // Head - blue color for other players
                player.graphics.fillStyle(0x2196F3);
            } else {
                // Body - lighter blue
                player.graphics.fillStyle(0x64B5F6);
            }
            
            player.graphics.fillRect(x, y, GameConfig.GRID_SIZE, GameConfig.GRID_SIZE);
            
            // Add border
            player.graphics.lineStyle(1, 0x000000, 0.3);
            player.graphics.strokeRect(x, y, GameConfig.GRID_SIZE, GameConfig.GRID_SIZE);
        });
    }
    
    handlePlayerLeft(data) {
        const { playerId } = data;
        console.log('Player left:', playerId);
        
        const player = this.otherPlayers.get(playerId);
        if (player) {
            player.graphics.destroy();
            this.otherPlayers.delete(playerId);
        }
    }
    
    handleGameStateUpdate(data) {
        // Handle global game state updates
        console.log('Game state update received:', data);
    }
    
    handleInputUpdate(data) {
        // Handle synchronized input from other players
        console.log('Input update received:', data);
    }
    
    showConnectionStatus(message) {
        // Create temporary text to show connection status
        const statusText = this.scene.add.text(
            GameConfig.GAME_WIDTH / 2,
            50,
            message,
            {
                fontSize: '16px',
                fill: '#FFD700',
                fontFamily: 'Arial',
                backgroundColor: '#000000',
                padding: { x: 10, y: 5 }
            }
        ).setOrigin(0.5);
        
        // Remove after 3 seconds
        this.scene.time.delayedCall(3000, () => {
            statusText.destroy();
        });
    }
    
    update(time, delta) {
        // Send periodic updates if connected
        if (this.isConnected && this.scene.gameManager) {
            // Send game state every 100ms
            if (time % 100 < delta) {
                const gameState = {
                    snake: this.scene.gameManager.snake ? this.scene.gameManager.snake.getBody() : [],
                    score: this.scene.gameManager.getScore(),
                    isAlive: !this.scene.gameManager.isGameOver()
                };
                
                this.sendGameState(gameState);
            }
        }
    }
    
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.isConnected = false;
            console.log('Disconnected from multiplayer server');
        }
        
        // Clean up other players
        this.otherPlayers.forEach(player => {
            player.graphics.destroy();
        });
        this.otherPlayers.clear();
    }
    
    destroy() {
        this.disconnect();
        console.log('MultiplayerSystem destroyed');
    }
}
