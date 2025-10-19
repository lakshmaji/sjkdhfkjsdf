# Application Architecture

## System Overview

```
┌──────────────────┐         ┌──────────────────┐
│  React Native    │         │    Next.js       │
│   Mobile App     │         │    Web App       │
│   (Expo)         │         │                  │
└────────┬─────────┘         └─────────┬────────┘
         │                             │
         │  ┌──────────────────────┐  │
         └──┤  Business Package    ├──┘
            │  - API Service       │
            │  - WebSocket Service │
            │  - Shared Types      │
            └──────────┬───────────┘
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

The application now follows a clean architecture with:
- **UI Layer**: Mobile (React Native) and Web (Next.js) apps
- **Business Logic Layer**: Shared business package
- **Backend Layer**: Golang server

This separation ensures:
- Code reusability between mobile and web
- Single source of truth for business logic
- Easy maintenance and testing
- Clear separation of concerns

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

### Business Package Components

| Component | Responsibility |
|-----------|---------------|
| **ApiService** | REST API communication (used by both mobile and web) |
| **WebSocketService** | WebSocket connection management (used by both mobile and web) |
| **Types** | Shared TypeScript types and interfaces |

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

### Web App Components

| Component | Responsibility |
|-----------|---------------|
| **page.tsx** | Home page displaying rooms |
| **layout.tsx** | Root layout and metadata |
| **apiService** | Instance of business package ApiService |
| **wsService** | Instance of business package WebSocketService |

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

## Hexagonal Architecture (Ports & Adapters)

The Go server now follows hexagonal architecture (also known as ports and adapters) which provides:

### Architecture Layers

```
┌─────────────────────────────────────────────────┐
│              Adapters Layer                      │
│  ┌──────────────┐        ┌──────────────┐      │
│  │ HTTP Handler │        │   WebSocket  │      │
│  │   (Echo)     │        │   Handler    │      │
│  └──────┬───────┘        └──────┬───────┘      │
│         │                       │               │
│         └───────────┬───────────┘               │
└─────────────────────┼───────────────────────────┘
                      │
┌─────────────────────┼───────────────────────────┐
│         Application Layer (Use Cases)            │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐    │
│  │   Room   │  │   Timer   │  │   User   │    │
│  │ Service  │  │  Service  │  │ Service  │    │
│  └────┬─────┘  └─────┬─────┘  └────┬─────┘    │
│       │              │              │           │
└───────┼──────────────┼──────────────┼───────────┘
        │              │              │
┌───────┼──────────────┼──────────────┼───────────┐
│    Domain Layer (Business Logic & Ports)        │
│  ┌────┴─────┐  ┌─────┴─────┐  ┌────┴─────┐    │
│  │ Room     │  │  Timer    │  │  User    │    │
│  │ Port     │  │  Port     │  │  Port    │    │
│  └──────────┘  └───────────┘  └──────────┘    │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────┼───────────────────────────┐
│        Infrastructure Layer (Adapters)          │
│  ┌──────────────────┴──────────────────┐       │
│  │    In-Memory Repositories            │       │
│  │  - RoomRepository                    │       │
│  │  - TimerRepository                   │       │
│  │  - TemplateRepository                │       │
│  │  - UserProfileRepository             │       │
│  │  - HistoryRepository                 │       │
│  └──────────────────────────────────────┘       │
└──────────────────────────────────────────────────┘
```

### Benefits of Hexagonal Architecture

1. **Separation of Concerns**: Business logic is isolated from technical details
2. **Testability**: Easy to test business logic independently
3. **Flexibility**: Easy to swap implementations (e.g., move from in-memory to database)
4. **Maintainability**: Clear boundaries between layers
5. **Scalability**: Easy to add new features without affecting existing code

### Directory Structure

```
apps/server/
├── main.go                          # Application entry point
├── internal/
│   ├── domain/                      # Core business logic
│   │   ├── entities.go              # Domain models
│   │   └── ports.go                 # Repository interfaces (ports)
│   ├── application/                 # Use cases / business operations
│   │   ├── room_service.go
│   │   ├── timer_service.go
│   │   ├── template_service.go
│   │   └── user_service.go
│   ├── adapters/                    # External interfaces
│   │   ├── http/                    # HTTP handlers (Echo)
│   │   │   ├── room_handler.go
│   │   │   ├── template_handler.go
│   │   │   ├── user_handler.go
│   │   │   └── health_handler.go
│   │   └── websocket/               # WebSocket handler
│   │       └── ws_handler.go
│   └── infrastructure/              # External implementations
│       ├── memory_room_repository.go
│       ├── memory_timer_repository.go
│       ├── memory_template_repository.go
│       └── memory_user_repository.go
└── go.mod
```

## Technologies Used

### Backend
- **Go 1.23+**: Server language
- **Echo v4**: Modern, high-performance HTTP framework
- **gorilla/websocket**: WebSocket implementation
- **godotenv**: Environment variable management

### Business Package
- **TypeScript**: Type-safe business logic
- **Fetch API**: HTTP client
- **WebSocket API**: Real-time communication

### Mobile Frontend
- **React Native**: Mobile framework
- **Expo**: Development platform
- **TypeScript**: Type safety
- **React Navigation**: Navigation library
- **Auth0**: Authentication

### Web Frontend
- **Next.js 15**: React framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **React 19**: UI library

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
