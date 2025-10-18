# Timer App - Collaborative Timers

A full-stack application for creating and managing collaborative timers with real-time synchronization. Built with React Native for mobile and Golang for the backend, organized as a Turborepo monorepo.

## Features

### 🎯 Core Functionality
- **Authentication**: Sign up and login using Auth0
- **Room Management**: Create and join rooms for collaborative timer sessions
- **Multiple Timers**: Create unlimited timers per room (similar to stopwatch)
- **Timer Controls**: 
  - Play and pause functionality
  - Forward and backward time adjustment (+/- 10 seconds)
  - Countdown and count-up modes
- **Confetti Animation**: Celebration animation when countdown timers finish
- **Customization**: 
  - 8 preset background colors
  - White or black text color options
  - Adjustable font sizes (24px - 64px)
- **Real-time Sync**: WebSocket-based synchronization across all users in a room

## Architecture

This project uses **Turborepo** to manage the monorepo structure:

```
timer-app-monorepo/
├── apps/
│   ├── server/          # Golang WebSocket server
│   └── mobile/          # React Native mobile app
├── packages/
│   └── types/           # Shared TypeScript types (future)
└── turbo.json           # Turborepo configuration
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- Go >= 1.21
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/lakshmaji/sjkdhfkjsdf.git
   cd sjkdhfkjsdf
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Auth0 (optional for development):
   - Create an Auth0 account and application
   - Update configuration in `apps/server/.env` and `apps/mobile/config.ts`
   - Or use the default demo mode for testing

### Running the Application

#### Start both server and mobile app:
```bash
npm run dev
```

#### Or run individually:

**Backend Server:**
```bash
cd apps/server
go run main.go
```
Server runs on `http://localhost:8080`

**Mobile App:**
```bash
cd apps/mobile
npm start
```

Then use:
- Press `a` for Android
- Press `i` for iOS (macOS only)
- Press `w` for web

## Server API

### REST Endpoints

- `GET /health` - Health check
- `POST /api/rooms` - Create a new room
- `GET /api/rooms` - List all rooms
- `GET /api/rooms/{roomId}` - Get room details
- `POST /api/rooms/{roomId}/join` - Join a room

### WebSocket Endpoint

- `WS /ws` - WebSocket connection for real-time updates

### WebSocket Message Types

- `join_room` - Join a room
- `create_timer` - Create a new timer
- `update_timer` - Update timer configuration
- `start_timer` - Start a timer
- `pause_timer` - Pause a timer
- `tick_timer` - Update timer elapsed time
- `forward_timer` - Skip forward
- `backward_timer` - Skip backward
- `delete_timer` - Delete a timer

## Tech Stack

### Backend
- **Language**: Go 1.21+
- **WebSocket**: gorilla/websocket
- **Router**: gorilla/mux
- **Auth**: Auth0 JWT middleware
- **CORS**: rs/cors

### Mobile
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation
- **Authentication**: Auth0
- **Animations**: react-native-confetti-cannon
- **Real-time**: Native WebSocket

### DevOps
- **Monorepo**: Turborepo
- **Package Manager**: npm

## Development

### Project Structure

**Server (`apps/server/`):**
- `main.go` - Main server with WebSocket handlers and REST API
- `go.mod` - Go dependencies

**Mobile (`apps/mobile/`):**
- `App.tsx` - Main app with navigation
- `components/` - Reusable UI components
- `screens/` - Screen components
- `contexts/` - React contexts (Auth)
- `services/` - API and WebSocket services

### Building

```bash
# Build all apps
npm run build

# Build specific app
cd apps/server && go build
cd apps/mobile && npm run build
```

### Linting

```bash
npm run lint
```

## Configuration

### Server Configuration (`apps/server/.env`)

```env
PORT=8080
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=your-api-audience
```

### Mobile Configuration (`apps/mobile/config.ts`)

```typescript
export const API_BASE_URL = 'http://localhost:8080';
export const WS_BASE_URL = 'ws://localhost:8080';
export const AUTH0_DOMAIN = 'your-domain.auth0.com';
export const AUTH0_CLIENT_ID = 'your-client-id';
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Future Enhancements

- [ ] Shared TypeScript types package
- [ ] Timer templates
- [ ] Sound notifications
- [ ] Dark mode
- [ ] Timer history
- [ ] User profiles
- [ ] Room invitations via link
- [ ] Mobile push notifications