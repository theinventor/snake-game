import { Game } from './game/Game.js';

// Initialize the game when the page loads
window.addEventListener('load', () => {
    console.log('Initializing Snake Game...');
    
    // Remove loading text
    const loadingDiv = document.querySelector('.loading');
    if (loadingDiv) {
        loadingDiv.remove();
    }
    
    // Create and start the game
    const game = new Game();
    window.game = game; // Make it globally accessible for debugging
    
    console.log('Snake Game initialized successfully!');
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.game) {
        window.game.handleResize();
    }
});
