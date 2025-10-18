# Quick Start Guide

## Prerequisites

Before you begin, ensure you have installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Go** (v1.21 or higher) - [Download](https://golang.org/dl/)
- **npm** or **yarn**
- **(Optional)** Expo CLI: `npm install -g expo-cli`

## Getting Started (Development)

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/lakshmaji/sjkdhfkjsdf.git
cd sjkdhfkjsdf

# Install dependencies
npm install
```

### 2. Start the Backend Server

Open a terminal and run:

```bash
# Navigate to server directory
cd apps/server

# Create .env file (optional, works without Auth0 for development)
cp .env.example .env

# Start the server
go run main.go
```

The server will start at `http://localhost:8080`

### 3. Start the Mobile App

Open a **new terminal** and run:

```bash
# Navigate to mobile directory
cd apps/mobile

# Start Expo dev server
npm start
```

Follow the Expo CLI instructions:
- Press `a` to run on Android emulator
- Press `i` to run on iOS simulator (macOS only)
- Press `w` to run in web browser
- Scan QR code with Expo Go app on your phone

## Quick Test Flow

1. **Login**: On the login screen, tap "Login with Auth0" (demo mode, no Auth0 needed)
2. **Create Room**: Tap "+ Create Room", enter a name like "My Test Room"
3. **Add Timer**: Tap "+ Add Timer", name it "Pomodoro Timer"
4. **Customize**: Tap the ⚙️ icon on the timer to:
   - Change colors
   - Adjust font size
   - Set direction (forward/backward)
   - Set duration for countdown
5. **Use Timer**: 
   - Tap ▶ Play to start
   - Tap ⏸ Pause to stop
   - Use ⏩ +10s and ⏪ -10s to adjust time
6. **See Confetti**: Set a backward timer with short duration (e.g., 10 seconds), let it count down to 0

## Using Turborepo

Turborepo helps manage the monorepo. You can run tasks across all apps:

```bash
# Run dev servers for all apps
npm run dev

# Build all apps
npm run build

# Run linting for all apps
npm run lint

# Clean all builds
npm run clean
```

## Docker Deployment (Optional)

```bash
# Build and start the server with Docker
docker-compose up -d

# Stop the server
docker-compose down
```

## Configuring Auth0 (Optional)

For production use with real authentication:

1. Create an Auth0 account at [auth0.com](https://auth0.com)
2. Create a new application (Native type)
3. Configure callbacks:
   - Allowed Callback URLs: `your-app-scheme://`
   - Allowed Logout URLs: `your-app-scheme://`
4. Update configuration files:

**Server** (`apps/server/.env`):
```env
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=your-api-audience
```

**Mobile** (`apps/mobile/config.ts`):
```typescript
export const AUTH0_DOMAIN = 'your-domain.auth0.com';
export const AUTH0_CLIENT_ID = 'your-client-id';
```

## Troubleshooting

### Server won't start
- Make sure port 8080 is not in use
- Run `go mod tidy` to refresh dependencies

### Mobile app won't connect to server
- For Android emulator, use `http://10.0.2.2:8080` instead of `localhost`
- For physical device, use your computer's IP address (e.g., `http://192.168.1.100:8080`)
- Update `API_BASE_URL` and `WS_BASE_URL` in `apps/mobile/config.ts`

### WebSocket connection fails
- Ensure the server is running
- Check that WebSocket URL starts with `ws://` not `http://`
- For HTTPS environments, use `wss://` instead of `ws://`

### Expo app won't start
- Run `npm install` in the `apps/mobile` directory
- Clear Expo cache: `expo start -c`
- Restart the bundler

## Next Steps

- Invite friends to join your room (share the room ID)
- Create multiple timers for different tasks
- Experiment with different color schemes
- Try both forward (stopwatch) and backward (countdown) modes

## Support

For issues or questions, please open an issue on GitHub.
