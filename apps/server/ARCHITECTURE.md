# Server Architecture

This Go server implements **Hexagonal Architecture** (also known as Ports and Adapters pattern) to maintain clean separation between business logic and technical implementation details.

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│              Adapters Layer                      │
│                                                  │
│  HTTP Handlers (Echo)    WebSocket Handler      │
│  - RoomHandler           - WSHandler            │
│  - UserHandler                                   │
│  - TemplateHandler                              │
│  - HealthHandler                                │
└─────────────────────┬───────────────────────────┘
                      │
                      ↓ calls
┌─────────────────────────────────────────────────┐
│         Application Layer (Services)             │
│                                                  │
│  Business Operations:                            │
│  - RoomService      - TimerService              │
│  - UserService      - TemplateService           │
└─────────────────────┬───────────────────────────┘
                      │
                      ↓ uses ports
┌─────────────────────────────────────────────────┐
│    Domain Layer (Core Business Logic)           │
│                                                  │
│  Entities:                                       │
│  - Room, Timer, User, UserProfile               │
│  - TimerTemplate, TimerHistoryEntry             │
│                                                  │
│  Ports (Interfaces):                             │
│  - RoomRepository                                │
│  - TimerRepository                               │
│  - TemplateRepository                            │
│  - UserProfileRepository                         │
│  - HistoryRepository                             │
└─────────────────────┬───────────────────────────┘
                      │
                      ↑ implements
┌─────────────────────────────────────────────────┐
│        Infrastructure Layer                      │
│                                                  │
│  Repository Implementations:                     │
│  - MemoryRoomRepository                          │
│  - MemoryTimerRepository                         │
│  - MemoryTemplateRepository                      │
│  - MemoryUserProfileRepository                   │
│  - MemoryHistoryRepository                       │
└──────────────────────────────────────────────────┘
```

## Layer Responsibilities

### 1. Domain Layer (`internal/domain/`)

**Purpose**: Contains the core business logic and domain models.

**Files**:
- `entities.go`: Domain entities (Room, Timer, User, etc.)
- `ports.go`: Repository interfaces (ports)

**Key Principles**:
- No dependencies on external frameworks
- Pure business logic
- Defines contracts (ports) that outer layers must implement

### 2. Application Layer (`internal/application/`)

**Purpose**: Contains use cases and orchestrates business operations.

**Files**:
- `room_service.go`: Room management use cases
- `timer_service.go`: Timer operations
- `template_service.go`: Template management
- `user_service.go`: User profile and history management

**Key Principles**:
- Implements business workflows
- Uses domain ports (repositories)
- No knowledge of HTTP, WebSocket, or database details

### 3. Adapters Layer (`internal/adapters/`)

**Purpose**: Provides external interfaces (HTTP, WebSocket).

**Subdirectories**:
- `http/`: Echo HTTP handlers
  - `room_handler.go`: REST endpoints for rooms
  - `user_handler.go`: REST endpoints for users
  - `template_handler.go`: REST endpoints for templates
  - `health_handler.go`: Health check endpoint
- `websocket/`: WebSocket connection handler
  - `ws_handler.go`: Real-time communication

**Key Principles**:
- Translates external requests to service calls
- Handles HTTP/WebSocket protocol details
- Returns appropriate responses

### 4. Infrastructure Layer (`internal/infrastructure/`)

**Purpose**: Implements domain ports with concrete implementations.

**Files**:
- `memory_room_repository.go`: In-memory room storage
- `memory_timer_repository.go`: In-memory timer storage
- `memory_template_repository.go`: Built-in templates
- `memory_user_repository.go`: User profile and history storage

**Key Principles**:
- Implements repository interfaces from domain layer
- Can be easily swapped (e.g., replace with database implementation)
- Contains technical implementation details

## Dependency Injection

The `main.go` file wires all components together:

```go
// 1. Initialize repositories (infrastructure)
roomRepo := infrastructure.NewMemoryRoomRepository()
timerRepo := infrastructure.NewMemoryTimerRepository(roomRepo)
templateRepo := infrastructure.NewMemoryTemplateRepository()
profileRepo := infrastructure.NewMemoryUserProfileRepository()
historyRepo := infrastructure.NewMemoryHistoryRepository()

// 2. Initialize services (application)
roomService := application.NewRoomService(roomRepo)
timerService := application.NewTimerService(timerRepo)
templateService := application.NewTemplateService(templateRepo)
userService := application.NewUserService(profileRepo, historyRepo)

// 3. Initialize handlers (adapters)
roomHandler := http.NewRoomHandler(roomService)
templateHandler := http.NewTemplateHandler(templateService)
userHandler := http.NewUserHandler(userService)
wsHandler := websocket.NewWSHandler(timerService)

// 4. Register routes
e.POST("/api/rooms", roomHandler.CreateRoom)
e.GET("/api/rooms", roomHandler.ListRooms)
// ... more routes
```

## Benefits

### 1. Testability
Each layer can be tested independently:
- Domain: Pure business logic tests
- Application: Mock repositories
- Handlers: Mock services
- Infrastructure: Integration tests

### 2. Flexibility
Easy to swap implementations:
- Replace in-memory storage with PostgreSQL
- Add Redis caching
- Switch from Echo to another HTTP framework

### 3. Maintainability
- Clear boundaries between layers
- Each component has a single responsibility
- Easy to locate and modify code

### 4. Scalability
- Can add new features without modifying existing code
- Easy to add new repositories or services
- Supports multiple storage backends

## Migration from Monolithic Design

The previous implementation had all logic in `main.go` (~700 lines). The refactoring:

1. **Extracted entities** → `internal/domain/entities.go`
2. **Defined interfaces** → `internal/domain/ports.go`
3. **Created services** → `internal/application/*_service.go`
4. **Built repositories** → `internal/infrastructure/memory_*_repository.go`
5. **Implemented handlers** → `internal/adapters/http/*_handler.go`
6. **Migrated to Echo** → Replaced Gorilla Mux with Echo framework

## Future Enhancements

With hexagonal architecture, adding new features is straightforward:

### Database Integration
```go
// 1. Create new repository
type PostgresRoomRepository struct {
    db *sql.DB
}

func (r *PostgresRoomRepository) CreateRoom(room *domain.Room) error {
    // PostgreSQL implementation
}

// 2. Swap in main.go
roomRepo := infrastructure.NewPostgresRoomRepository(db)
// Rest of the code remains the same!
```

### Caching Layer
```go
// 1. Create cached repository
type CachedRoomRepository struct {
    repo  domain.RoomRepository
    cache *redis.Client
}

// 2. Implement caching logic
func (r *CachedRoomRepository) GetRoom(id string) (*domain.Room, error) {
    // Check cache first
    // Fallback to repo
}

// 3. Wrap existing repository
roomRepo = infrastructure.NewCachedRoomRepository(roomRepo, cache)
```

### Event Sourcing
```go
// 1. Create event repository
type EventSourcedRoomRepository struct {
    eventStore EventStore
}

// 2. Store events instead of state
func (r *EventSourcedRoomRepository) CreateRoom(room *domain.Room) error {
    event := RoomCreatedEvent{...}
    return r.eventStore.Append(event)
}
```

## Best Practices

1. **Keep domain layer pure**: No external dependencies
2. **Use dependency injection**: Pass dependencies through constructors
3. **Test at all layers**: Unit tests for domain, integration tests for infrastructure
4. **Document interfaces**: Clear contracts between layers
5. **Maintain single responsibility**: Each component does one thing well

## Framework Choice: Echo

We chose Echo framework over Gorilla Mux because:

1. **Performance**: High-performance HTTP router with zero dynamic memory allocation
2. **Middleware**: Built-in middleware for common tasks (CORS, logging, recovery)
3. **WebSocket Support**: Native WebSocket upgrade support
4. **Developer Experience**: Clean API, good documentation, active community
5. **Modern Features**: Context-based routing, automatic binding, validation

## Resources

- [Hexagonal Architecture Pattern](https://alistair.cockburn.us/hexagonal-architecture/)
- [Echo Framework Documentation](https://echo.labstack.com/)
- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
