# Timer App - Mobile

React Native mobile application for collaborative timers with real-time synchronization.

## Features

- 🔐 Auth0 authentication (login/signup)
- 🏠 Room management (create, join, list)
- ⏱️ Multiple timers per room
- ▶️ Timer controls (play, pause, forward, backward)
- 🎨 Customizable colors and fonts
- 🎉 Confetti animation on timer completion
- 🔄 Real-time synchronization via WebSockets
- 👥 Multi-user collaboration

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure Auth0:
   - Update `config.ts` with your Auth0 domain and client ID
   - Or use the default demo mode for testing

3. Update server URL in `config.ts`:
   ```typescript
   export const API_BASE_URL = 'http://your-server-url:8080';
   export const WS_BASE_URL = 'ws://your-server-url:8080';
   ```

## Running the App

### Development

```bash
# Start the Expo dev server
npm start

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios

# Run in web browser
npm run web
```

### Building for Production

```bash
# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

## Project Structure

```
mobile/
├── components/          # Reusable UI components
│   ├── TimerCard.tsx
│   └── TimerSettingsModal.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── screens/            # Screen components
│   ├── LoginScreen.tsx
│   ├── RoomListScreen.tsx
│   └── RoomScreen.tsx
├── services/           # API and WebSocket services
│   ├── ApiService.ts
│   └── WebSocketService.ts
├── config.ts           # App configuration
├── types.ts            # TypeScript type definitions
└── App.tsx             # Main app component
```

## Timer Features

### Direction Modes
- **Forward**: Counts up from 0 (stopwatch mode)
- **Backward**: Counts down from duration (countdown mode)

### Controls
- Play/Pause: Start or stop the timer
- Forward +10s: Skip ahead 10 seconds
- Backward -10s: Go back 10 seconds
- Settings: Customize appearance and behavior
- Delete: Remove the timer

### Customization
- Background color (8 preset colors)
- Text color (white or black)
- Font size (24px to 64px)
- Timer name
- Duration
- Direction (forward/backward)

## WebSocket Events

The app listens for these real-time events:
- `timer_created` - New timer added
- `timer_updated` - Timer settings changed
- `timer_started` - Timer started
- `timer_paused` - Timer paused
- `timer_tick` - Timer time updated
- `timer_forwarded` - Timer skipped forward
- `timer_backwarded` - Timer skipped backward
- `timer_deleted` - Timer removed

## Technologies

- React Native with Expo
- TypeScript
- React Navigation
- WebSockets
- Auth0
- Confetti animations
