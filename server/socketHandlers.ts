import type { Socket } from 'socket.io';
import { GameServer } from './gameServer.js';

export class SocketHandlers {
  private gameServer: GameServer;
  
  constructor(gameServer: GameServer) {
    this.gameServer = gameServer;
  }
  
  // Handle specific game events
  static setupGameHandlers(socket: Socket, gameServer: GameServer) {
    // Room management
    socket.on('create-room', (data) => {
      console.log(`Player ${socket.id} wants to create room with settings:`, data);
      // Custom room creation logic can go here
    });
    
    socket.on('join-room', (data) => {
      console.log(`Player ${socket.id} wants to join room:`, data.roomId);
      // Custom room joining logic can go here
    });
    
    // Chat messages
    socket.on('chat-message', (data) => {
      console.log(`Chat message from ${socket.id}:`, data.message);
      
      // Broadcast chat message to room
      socket.to(data.roomId || 'general').emit('chat-message', {
        playerId: socket.id,
        message: data.message,
        timestamp: Date.now()
      });
    });
    
    // Game control events
    socket.on('start-game', (data) => {
      console.log(`Player ${socket.id} wants to start game`);
      // Game start logic
    });
    
    socket.on('pause-game', (data) => {
      console.log(`Player ${socket.id} wants to pause game`);
      // Game pause logic
    });
    
    socket.on('reset-game', (data) => {
      console.log(`Player ${socket.id} wants to reset game`);
      // Game reset logic
    });
    
    // Player status updates
    socket.on('player-ready', (data) => {
      console.log(`Player ${socket.id} is ready`);
      socket.to(data.roomId).emit('player-ready', {
        playerId: socket.id,
        ready: data.ready
      });
    });
    
    // Spectator mode
    socket.on('spectate', (data) => {
      console.log(`Player ${socket.id} wants to spectate room:`, data.roomId);
      // Spectator logic
    });
    
    // Game statistics
    socket.on('get-stats', () => {
      const stats = gameServer.getStats();
      socket.emit('stats', stats);
    });
    
    // Ping/latency testing
    socket.on('ping', (data) => {
      socket.emit('pong', {
        timestamp: data.timestamp,
        serverTime: Date.now()
      });
    });
    
    // Error handling
    socket.on('error', (error) => {
      console.error(`Socket error from ${socket.id}:`, error);
    });
    
    // Custom snake game events
    socket.on('snake-collision', (data) => {
      console.log(`Snake collision from ${socket.id}:`, data);
      // Handle snake collision in multiplayer context
    });
    
    socket.on('food-eaten', (data) => {
      console.log(`Food eaten by ${socket.id}:`, data);
      // Handle food consumption in multiplayer context
    });
    
    socket.on('game-over', (data) => {
      console.log(`Game over for ${socket.id}:`, data);
      // Handle game over in multiplayer context
      socket.to(data.roomId).emit('player-game-over', {
        playerId: socket.id,
        score: data.score,
        cause: data.cause
      });
    });
  }
  
  // Utility functions for common operations
  static broadcastToRoom(socket: Socket, roomId: string, event: string, data: any) {
    socket.to(roomId).emit(event, {
      ...data,
      playerId: socket.id,
      timestamp: Date.now()
    });
  }
  
  static sendToPlayer(socket: Socket, event: string, data: any) {
    socket.emit(event, {
      ...data,
      timestamp: Date.now()
    });
  }
  
  // Rate limiting helper
  private static rateLimits = new Map<string, number>();
  
  static checkRateLimit(socketId: string, action: string, limitMs: number = 100): boolean {
    const key = `${socketId}:${action}`;
    const now = Date.now();
    const lastAction = this.rateLimits.get(key) || 0;
    
    if (now - lastAction < limitMs) {
      return false; // Rate limited
    }
    
    this.rateLimits.set(key, now);
    return true;
  }
  
  // Clean up old rate limit entries
  static cleanupRateLimits() {
    const now = Date.now();
    const maxAge = 60000; // 1 minute
    
    for (const [key, timestamp] of this.rateLimits.entries()) {
      if (now - timestamp > maxAge) {
        this.rateLimits.delete(key);
      }
    }
  }
}

// Clean up rate limits every 5 minutes
setInterval(() => {
  SocketHandlers.cleanupRateLimits();
}, 300000);
