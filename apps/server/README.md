# Timer App Server

Golang WebSocket server for the Timer App.

## Features

- WebSocket support for real-time timer synchronization
- Room management (create, join, list)
- Timer operations (create, start, pause, forward, backward, delete)
- Auth0 authentication ready

## Setup

1. Copy `.env.example` to `.env` and configure your Auth0 credentials
2. Install dependencies: `go mod download`
3. Run the server: `go run main.go`

## API Endpoints

### REST API

- `GET /health` - Health check
- `POST /api/rooms` - Create a new room
- `GET /api/rooms` - List all rooms
- `GET /api/rooms/{roomId}` - Get room details
- `POST /api/rooms/{roomId}/join` - Join a room

### WebSocket

- `WS /ws` - WebSocket connection for real-time updates

## WebSocket Message Types

- `join_room` - Join a room
- `create_timer` - Create a new timer
- `update_timer` - Update timer configuration
- `start_timer` - Start a timer
- `pause_timer` - Pause a timer
- `tick_timer` - Update timer elapsed time
- `forward_timer` - Skip forward
- `backward_timer` - Skip backward
- `delete_timer` - Delete a timer
