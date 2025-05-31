import { Server as SocketIOServer } from 'socket.io';
import type { Server } from 'http';

export interface Player {
  id: string;
  socket: any;
  gameState: {
    snake: Array<{x: number, y: number}>;
    score: number;
    isAlive: boolean;
    direction: string;
  };
  lastUpdate: number;
}

export interface GameRoom {
  id: string;
  players: Map<string, Player>;
  gameState: {
    isActive: boolean;
    startTime: number;
    food: {x: number, y: number} | null;
  };
  maxPlayers: number;
}

export class GameServer {
  private io: SocketIOServer;
  private gameRooms: Map<string, GameRoom> = new Map();
  private playerToRoom: Map<string, string> = new Map();
  
  constructor(httpServer: Server) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    
    this.setupEventHandlers();
    this.startGameLoop();
    
    console.log('Game server initialized');
  }
  
  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Player connected: ${socket.id}`);
      
      // Handle join game
      socket.on('join-game', (data) => {
        this.handleJoinGame(socket, data);
      });
      
      // Handle player input
      socket.on('player-input', (data) => {
        this.handlePlayerInput(socket, data);
      });
      
      // Handle game state updates
      socket.on('game-state-update', (data) => {
        this.handleGameStateUpdate(socket, data);
      });
      
      // Handle disconnect
      socket.on('disconnect', () => {
        this.handlePlayerDisconnect(socket);
      });
      
      // Send initial connection acknowledgment
      socket.emit('connected', { playerId: socket.id });
    });
  }
  
  private handleJoinGame(socket: any, data: any) {
    const playerId = socket.id;
    const gameType = data.gameType || 'snake';
    
    // Find or create a game room
    let roomId = this.findAvailableRoom();
    if (!roomId) {
      roomId = this.createGameRoom();
    }
    
    const room = this.gameRooms.get(roomId);
    if (!room) {
      socket.emit('error', { message: 'Failed to join game room' });
      return;
    }
    
    // Create player
    const player: Player = {
      id: playerId,
      socket: socket,
      gameState: {
        snake: [
          { x: Math.floor(Math.random() * 30) + 5, y: Math.floor(Math.random() * 20) + 5 }
        ],
        score: 0,
        isAlive: true,
        direction: 'RIGHT'
      },
      lastUpdate: Date.now()
    };
    
    // Add player to room
    room.players.set(playerId, player);
    this.playerToRoom.set(playerId, roomId);
    
    // Join socket room
    socket.join(roomId);
    
    // Notify player they joined
    socket.emit('player-joined', {
      playerId: playerId,
      roomId: roomId,
      playerCount: room.players.size
    });
    
    // Notify other players
    socket.to(roomId).emit('player-joined', {
      playerId: playerId,
      playerCount: room.players.size
    });
    
    // Send current game state
    this.sendGameStateToPlayer(socket, room);
    
    console.log(`Player ${playerId} joined room ${roomId} (${room.players.size}/${room.maxPlayers})`);
  }
  
  private handlePlayerInput(socket: any, data: any) {
    const playerId = socket.id;
    const roomId = this.playerToRoom.get(playerId);
    
    if (!roomId) return;
    
    const room = this.gameRooms.get(roomId);
    const player = room?.players.get(playerId);
    
    if (!player || !player.gameState.isAlive) return;
    
    // Validate and update player direction
    const validDirections = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
    if (validDirections.includes(data.direction)) {
      // Prevent reverse movement
      const opposites: {[key: string]: string} = {
        'UP': 'DOWN', 'DOWN': 'UP', 'LEFT': 'RIGHT', 'RIGHT': 'LEFT'
      };
      
      if (opposites[player.gameState.direction] !== data.direction) {
        player.gameState.direction = data.direction;
        
        // Broadcast input to other players in room
        socket.to(roomId).emit('input-update', {
          playerId: playerId,
          direction: data.direction,
          timestamp: data.timestamp
        });
      }
    }
  }
  
  private handleGameStateUpdate(socket: any, data: any) {
    const playerId = socket.id;
    const roomId = this.playerToRoom.get(playerId);
    
    if (!roomId) return;
    
    const room = this.gameRooms.get(roomId);
    const player = room?.players.get(playerId);
    
    if (!player) return;
    
    // Update player game state
    if (data.gameState) {
      player.gameState = {
        ...player.gameState,
        ...data.gameState
      };
      player.lastUpdate = Date.now();
      
      // Broadcast to other players
      socket.to(roomId).emit('player-update', {
        playerId: playerId,
        gameState: player.gameState,
        timestamp: data.timestamp
      });
    }
  }
  
  private handlePlayerDisconnect(socket: any) {
    const playerId = socket.id;
    const roomId = this.playerToRoom.get(playerId);
    
    if (roomId) {
      const room = this.gameRooms.get(roomId);
      if (room) {
        room.players.delete(playerId);
        
        // Notify other players
        socket.to(roomId).emit('player-left', {
          playerId: playerId,
          playerCount: room.players.size
        });
        
        // Remove empty rooms
        if (room.players.size === 0) {
          this.gameRooms.delete(roomId);
          console.log(`Removed empty room: ${roomId}`);
        }
      }
      
      this.playerToRoom.delete(playerId);
    }
    
    console.log(`Player disconnected: ${playerId}`);
  }
  
  private findAvailableRoom(): string | null {
    for (const [roomId, room] of this.gameRooms) {
      if (room.players.size < room.maxPlayers) {
        return roomId;
      }
    }
    return null;
  }
  
  private createGameRoom(): string {
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const room: GameRoom = {
      id: roomId,
      players: new Map(),
      gameState: {
        isActive: false,
        startTime: 0,
        food: this.generateFoodPosition()
      },
      maxPlayers: 4
    };
    
    this.gameRooms.set(roomId, room);
    console.log(`Created new game room: ${roomId}`);
    
    return roomId;
  }
  
  private generateFoodPosition(): {x: number, y: number} {
    return {
      x: Math.floor(Math.random() * 40),
      y: Math.floor(Math.random() * 30)
    };
  }
  
  private sendGameStateToPlayer(socket: any, room: GameRoom) {
    const gameState = {
      room: {
        id: room.id,
        playerCount: room.players.size,
        maxPlayers: room.maxPlayers
      },
      players: Array.from(room.players.values()).map(player => ({
        id: player.id,
        gameState: player.gameState
      })),
      food: room.gameState.food
    };
    
    socket.emit('game-state', gameState);
  }
  
  private startGameLoop() {
    // Game update loop - runs every 100ms
    setInterval(() => {
      this.updateAllRooms();
    }, 100);
    
    // Heartbeat - runs every 30 seconds
    setInterval(() => {
      this.sendHeartbeat();
    }, 30000);
  }
  
  private updateAllRooms() {
    for (const [roomId, room] of this.gameRooms) {
      if (room.players.size === 0) continue;
      
      // Update game logic for each room
      this.updateRoomGameState(room);
      
      // Send updates to all players in room
      this.broadcastRoomUpdate(roomId, room);
    }
  }
  
  private updateRoomGameState(room: GameRoom) {
    // Update food position if needed
    if (!room.gameState.food) {
      room.gameState.food = this.generateFoodPosition();
    }
    
    // Check for collisions, scoring, etc.
    // This is where game-specific logic would go
  }
  
  private broadcastRoomUpdate(roomId: string, room: GameRoom) {
    const updateData = {
      food: room.gameState.food,
      players: Array.from(room.players.values()).map(player => ({
        id: player.id,
        gameState: player.gameState
      })),
      timestamp: Date.now()
    };
    
    this.io.to(roomId).emit('room-update', updateData);
  }
  
  private sendHeartbeat() {
    this.io.emit('heartbeat', { timestamp: Date.now() });
  }
  
  public getStats() {
    return {
      totalRooms: this.gameRooms.size,
      totalPlayers: this.playerToRoom.size,
      rooms: Array.from(this.gameRooms.values()).map(room => ({
        id: room.id,
        playerCount: room.players.size,
        maxPlayers: room.maxPlayers,
        isActive: room.gameState.isActive
      }))
    };
  }
}
