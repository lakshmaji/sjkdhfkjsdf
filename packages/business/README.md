# Business Package

This package contains all the API calls and business logic for the Timer App.

## Features

- **API Service**: REST API client for interacting with the backend
- **WebSocket Service**: Real-time communication service
- **Shared Types**: TypeScript types used across the application

## Usage

```typescript
import { ApiService, WebSocketService } from 'business';

// Create API service instance
const apiService = new ApiService('http://localhost:8080');

// Create WebSocket service instance
const wsService = new WebSocketService('ws://localhost:8080');

// Use the services
const rooms = await apiService.listRooms();
wsService.connect();
```

## Design

This package is designed to be used by both:
- Mobile app (React Native)
- Web app (Next.js)

The mobile and web apps should focus on:
- UI layer
- Persistence layer

All API calls and business logic should be handled by this package.
