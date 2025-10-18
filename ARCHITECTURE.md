# Application Architecture

## System Overview

```
┌─────────────────┐
│  React Native   │
│   Mobile App    │
│   (Expo)        │
└────────┬────────┘
         │
         │ HTTP REST API
         │ WebSocket
         │
         ▼
┌─────────────────┐
│  Golang Server  │
│                 │
│  - REST API     │
│  - WebSocket    │
│  - Room Manager │
│  - Timer Sync   │
└─────────────────┘
```

## Mobile App Architecture

```
┌──────────────────────────────────────┐
│           App.tsx (Root)             │
│         Navigation Container         │
└──────────────┬───────────────────────┘
               │
      ┌────────┴────────┐
      │                 │
      ▼                 ▼
┌──────────┐    ┌──────────────┐
│  Auth    │    │   Main App   │
│  Screen  │    │   Screens    │
└──────────┘    └──────┬───────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
  ┌─────────┐   ┌──────────┐   ┌──────────┐
  │  Login  │   │   Room   │   │  Room    │
  │ Screen  │   │   List   │   │ Screen   │
  └─────────┘   └──────────┘   └────┬─────┘
                                     │
                      ┌──────────────┼──────────────┐
                      │              │              │
                      ▼              ▼              ▼
               ┌───────────┐  ┌──────────┐  ┌──────────┐
               │  Timer    │  │  Timer   │  │ Confetti │
               │   Card    │  │ Settings │  │ Animation│
               └───────────┘  └──────────┘  └──────────┘
```

## Data Flow

### Creating a Timer

```
Mobile App                Server                     Other Clients
    │                       │                              │
    │  create_timer         │                              │
    ├──────────────────────>│                              │
    │                       │                              │
    │                       │  Store timer                 │
    │                       │                              │
    │  timer_created        │  Broadcast                   │
    │<──────────────────────┤───────────────────────────>  │
    │                       │                              │
    │  Update UI            │                              │ Update UI
    │                       │                              │
```

### Timer Synchronization

```
Client A                  Server                     Client B
    │                       │                              │
    │  start_timer          │                              │
    ├──────────────────────>│                              │
    │                       │                              │
    │  timer_started        │  Broadcast                   │
    │<──────────────────────┤───────────────────────────>  │
    │                       │                              │
    │  tick (every 1s)      │                              │
    ├──────────────────────>│                              │
    │                       │                              │
    │  timer_tick           │  Broadcast                   │
    │<──────────────────────┤───────────────────────────>  │
    │                       │                              │
```

## Component Responsibilities

### Mobile App Components

| Component | Responsibility |
|-----------|---------------|
| **App.tsx** | Root component, navigation setup |
| **AuthContext** | Authentication state management |
| **LoginScreen** | User authentication UI |
| **RoomListScreen** | Display and manage rooms |
| **RoomScreen** | Display timers in a room |
| **TimerCard** | Individual timer display and controls |
| **TimerSettingsModal** | Timer customization UI |
| **WebSocketService** | WebSocket connection management |
| **ApiService** | REST API communication |

### Server Components

| Component | Responsibility |
|-----------|---------------|
| **main.go** | Server initialization, routing |
| **REST Handlers** | Room CRUD operations |
| **WebSocket Handler** | Real-time communication |
| **Room Manager** | In-memory room storage |
| **Timer Operations** | Timer state management |
| **Broadcast System** | Message distribution |

## State Management

### Mobile App State

```
AuthContext (Global)
  └─ user
  └─ isAuthenticated
  └─ login()
  └─ logout()

RoomScreen (Local)
  └─ room
  └─ timers[]
  └─ WebSocket connection
  
TimerCard (Local)
  └─ localTime
  └─ isRunning
  └─ tick interval
```

### Server State

```
rooms (Map)
  └─ roomId → Room
      └─ id
      └─ name
      └─ users (Map)
      └─ timers (Map)
          └─ timerId → Timer
              └─ elapsed_time
              └─ is_running
              └─ customization

clients (Map)
  └─ connection → Client
      └─ userID
      └─ roomID
```

## WebSocket Message Types

### Client → Server

- `join_room` - Join a room
- `create_timer` - Create new timer
- `update_timer` - Update timer config
- `start_timer` - Start timer
- `pause_timer` - Pause timer
- `tick_timer` - Update elapsed time
- `forward_timer` - Skip forward
- `backward_timer` - Skip backward
- `delete_timer` - Remove timer

### Server → Client

- `timer_created` - Timer was created
- `timer_updated` - Timer config changed
- `timer_started` - Timer started
- `timer_paused` - Timer paused
- `timer_tick` - Time updated
- `timer_forwarded` - Time skipped forward
- `timer_backwarded` - Time skipped backward
- `timer_deleted` - Timer removed

## Technologies Used

### Backend
- **Go 1.21+**: Server language
- **gorilla/websocket**: WebSocket implementation
- **gorilla/mux**: HTTP router
- **rs/cors**: CORS middleware

### Frontend
- **React Native**: Mobile framework
- **Expo**: Development platform
- **TypeScript**: Type safety
- **React Navigation**: Navigation library
- **Auth0**: Authentication

### DevOps
- **Turborepo**: Monorepo management
- **Docker**: Containerization
- **npm**: Package management

## Security Considerations

1. **Auth0 Integration**: Production apps should use real Auth0 tokens
2. **WebSocket Authentication**: Validate user tokens on WS connection
3. **Input Validation**: Sanitize all user inputs
4. **Rate Limiting**: Implement rate limits on API endpoints
5. **CORS**: Configure allowed origins in production

## Scalability

### Current Architecture (Single Server)
- In-memory state
- Single server instance
- Good for: Development, small teams

### Future Scalability Options
- Redis for shared state
- Multiple server instances
- Load balancer
- Database for persistence
- Message queue (RabbitMQ/Kafka)

## Performance Optimization

1. **WebSocket Connection Pooling**: Reuse connections
2. **Debounce Timer Ticks**: Send updates every N seconds
3. **Batch Operations**: Group multiple updates
4. **Lazy Loading**: Load rooms/timers on demand
5. **Compression**: Enable WebSocket compression
