# @timer-app/business-logic

Shared business logic package for the Timer App. This package contains the core business logic that can be shared between the mobile app and web app (future).

## Features

- **Type Definitions**: Shared TypeScript types for User, Room, Timer, etc.
- **API Service**: HTTP client for REST API communication
- **WebSocket Service**: Real-time communication via WebSocket

## Usage

### API Service

```typescript
import { ApiService } from '@timer-app/business-logic';

const apiService = new ApiService({
  baseUrl: 'http://localhost:8080'
});

// Create a room
const room = await apiService.createRoom('My Room', userId, userEmail, userName);

// List rooms
const rooms = await apiService.listRooms();

// Get user profile
const profile = await apiService.getUserProfile(userId);
```

### WebSocket Service

```typescript
import { WebSocketService } from '@timer-app/business-logic';

const wsService = new WebSocketService({
  wsUrl: 'ws://localhost:8080',
  maxReconnectAttempts: 5,
  reconnectDelay: 1000
});

// Connect to WebSocket
wsService.connect();

// Listen for events
wsService.on('timer_updated', (data) => {
  console.log('Timer updated:', data);
});

// Send messages
wsService.send({
  type: 'join_room',
  room_id: 'room-123'
});
```

## Development

```bash
# Install dependencies
npm install

# Lint
npm run lint

# Build
npm run build
```
