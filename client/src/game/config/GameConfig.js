export const GameConfig = {
    // Game dimensions
    GAME_WIDTH: 800,
    GAME_HEIGHT: 600,
    
    // Grid settings
    GRID_SIZE: 20,
    GRID_WIDTH: 40, // 800 / 20
    GRID_HEIGHT: 30, // 600 / 20
    
    // Snake settings
    SNAKE_SPEED: 150, // milliseconds between moves
    INITIAL_SNAKE_LENGTH: 3,
    
    // Colors
    COLORS: {
        BACKGROUND: '#1a1a2e',
        SNAKE_HEAD: '#4CAF50',
        SNAKE_BODY: '#2E7D32',
        FOOD: '#FF5722',
        UI_TEXT: '#FFFFFF',
        GRID_LINE: '#333333',
        WALL: '#8B4513'
    },
    
    // Audio settings
    AUDIO: {
        MASTER_VOLUME: 0.7,
        SFX_VOLUME: 0.5,
        MUSIC_VOLUME: 0.3
    },
    
    // Controls
    CONTROLS: {
        UP: ['W', 'UP'],
        DOWN: ['S', 'DOWN'],
        LEFT: ['A', 'LEFT'],
        RIGHT: ['D', 'RIGHT'],
        PAUSE: ['P', 'SPACE'],
        RESTART: ['R']
    },
    
    // Scoring
    SCORING: {
        FOOD_POINTS: 10,
        SPEED_BONUS_MULTIPLIER: 1.1
    },
    
    // Multiplayer settings
    MULTIPLAYER: {
        SERVER_URL: window.location.origin,
        RECONNECT_ATTEMPTS: 3,
        HEARTBEAT_INTERVAL: 30000
    }
};
