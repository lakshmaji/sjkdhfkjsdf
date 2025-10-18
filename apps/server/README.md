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

## Development

### Available Commands

- `npm run dev` - Run the server in development mode
- `npm run build` - Build the server binary
- `npm run lint` - Run linters (go vet and gofmt)
- `npm run test` - Run tests with race detection
- `npm run clean` - Clean build artifacts

### CI/CD

The project uses GitHub Actions for continuous integration. On every push or pull request to `main` or `develop` branches affecting the backend code, the CI pipeline will:

1. Build the Go server
2. Run go vet for code quality checks
3. Verify code formatting with gofmt
4. Run staticcheck for additional static analysis
5. Execute tests with race detection
6. Generate test coverage reports

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
