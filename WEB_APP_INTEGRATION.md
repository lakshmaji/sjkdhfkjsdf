# Future Web App Integration

This document describes how a future web application can use the shared `@timer-app/business-logic` package.

## Overview

The business logic package has been extracted from the mobile app and made generic so it can be shared with any client application, including a future web app.

## Package Structure

```
packages/business-logic/
├── src/
│   ├── types.ts              # All shared TypeScript types
│   ├── ApiService.ts          # HTTP API client class
│   ├── WebSocketService.ts   # WebSocket client class
│   └── index.ts              # Package exports
├── package.json
└── README.md
```

## Usage Example for Web App

### 1. Add the Package as a Dependency

In your web app's `package.json`:

```json
{
  "dependencies": {
    "@timer-app/business-logic": "*"
  }
}
```

### 2. Initialize Services

```typescript
import { ApiService, WebSocketService } from '@timer-app/business-logic';

// Initialize API service
const apiService = new ApiService({
  baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:8080'
});

// Initialize WebSocket service
const wsService = new WebSocketService({
  wsUrl: process.env.REACT_APP_WS_URL || 'ws://localhost:8080',
  maxReconnectAttempts: 5,
  reconnectDelay: 1000
});
```

### 3. Use the Services in React Components

```typescript
import React, { useEffect, useState } from 'react';
import { Room } from '@timer-app/business-logic';

function RoomList({ apiService, userId, userEmail, userName }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      const roomsList = await apiService.listRooms();
      setRooms(roomsList);
    } catch (error) {
      console.error('Failed to load rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async (roomName: string) => {
    try {
      const newRoom = await apiService.createRoom(
        roomName,
        userId,
        userEmail,
        userName
      );
      setRooms([...rooms, newRoom]);
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  return (
    <div>
      <h1>Rooms</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {rooms.map(room => (
            <li key={room.id}>{room.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### 4. Use WebSocket for Real-time Updates

```typescript
import React, { useEffect } from 'react';
import { WSMessage } from '@timer-app/business-logic';

function TimerRoom({ wsService, roomId }) {
  useEffect(() => {
    // Connect to WebSocket
    wsService.connect();

    // Listen for timer updates
    const handleTimerUpdate = (message: WSMessage) => {
      console.log('Timer updated:', message);
      // Update your UI state here
    };

    wsService.on('timer_updated', handleTimerUpdate);

    // Join the room
    wsService.send({
      type: 'join_room',
      room_id: roomId
    });

    // Cleanup
    return () => {
      wsService.off('timer_updated', handleTimerUpdate);
      wsService.disconnect();
    };
  }, [roomId]);

  return (
    <div>
      <h2>Timer Room</h2>
      {/* Your timer UI here */}
    </div>
  );
}
```

## Benefits

1. **Code Reuse**: The same business logic works for both mobile and web
2. **Type Safety**: Shared TypeScript types ensure consistency
3. **Maintainability**: Changes to business logic are made in one place
4. **Testing**: Business logic can be tested independently of UI
5. **Consistency**: Same behavior across all platforms

## Next Steps

To create a web app:

1. Create `apps/web/` directory
2. Set up React/Vue/Angular application
3. Add `@timer-app/business-logic` as a dependency
4. Implement UI components using the shared services
5. Deploy alongside the mobile app

## API Reference

See [packages/business-logic/README.md](../packages/business-logic/README.md) for detailed API documentation.
