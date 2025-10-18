# API Examples

This document provides example requests and responses for the Timer App API.

## Base URL

- REST API: `http://localhost:8080`
- WebSocket: `ws://localhost:8080/ws`

## REST API Endpoints

### Health Check

```bash
GET /health
```

**Response:**
```json
{
  "status": "ok"
}
```

### Create Room

```bash
POST /api/rooms
Content-Type: application/json

{
  "name": "Study Room",
  "user_id": "auth0|123456",
  "user_email": "user@example.com",
  "user_name": "John Doe"
}
```

**Response:**
```json
{
  "id": "20251018180000abc123",
  "name": "Study Room",
  "created_by": "auth0|123456",
  "users": {
    "auth0|123456": {
      "id": "auth0|123456",
      "email": "user@example.com",
      "name": "John Doe",
      "auth0_sub": ""
    }
  },
  "timers": {}
}
```

### List Rooms

```bash
GET /api/rooms
```

**Response:**
```json
[
  {
    "id": "20251018180000abc123",
    "name": "Study Room",
    "created_by": "auth0|123456",
    "users": { ... },
    "timers": { ... }
  }
]
```

### Get Room Details

```bash
GET /api/rooms/{roomId}
```

**Response:**
```json
{
  "id": "20251018180000abc123",
  "name": "Study Room",
  "created_by": "auth0|123456",
  "users": {
    "auth0|123456": { ... }
  },
  "timers": {
    "timer123": {
      "id": "timer123",
      "name": "Pomodoro",
      "duration": 1500,
      "elapsed_time": 450,
      "is_running": true,
      "direction": "backward",
      "created_at": 1697654400,
      "background_color": "#3b82f6",
      "text_color": "#ffffff",
      "font_size": 48
    }
  }
}
```

### Join Room

```bash
POST /api/rooms/{roomId}/join
Content-Type: application/json

{
  "user_id": "auth0|789012",
  "user_email": "jane@example.com",
  "user_name": "Jane Smith"
}
```

**Response:**
```json
{
  "id": "20251018180000abc123",
  "name": "Study Room",
  "created_by": "auth0|123456",
  "users": {
    "auth0|123456": { ... },
    "auth0|789012": {
      "id": "auth0|789012",
      "email": "jane@example.com",
      "name": "Jane Smith",
      "auth0_sub": ""
    }
  },
  "timers": { ... }
}
```

## WebSocket Messages

### Join Room

**Send:**
```json
{
  "type": "join_room",
  "room_id": "20251018180000abc123",
  "payload": {
    "room_id": "20251018180000abc123",
    "user_id": "auth0|123456"
  }
}
```

### Create Timer

**Send:**
```json
{
  "type": "create_timer",
  "room_id": "20251018180000abc123",
  "payload": {
    "name": "Pomodoro Timer",
    "duration": 1500,
    "elapsed_time": 0,
    "is_running": false,
    "direction": "backward",
    "background_color": "#3b82f6",
    "text_color": "#ffffff",
    "font_size": 48
  }
}
```

**Receive (Broadcast to all in room):**
```json
{
  "type": "timer_created",
  "room_id": "20251018180000abc123",
  "timer_id": "20251018180100def456",
  "payload": {
    "id": "20251018180100def456",
    "name": "Pomodoro Timer",
    "duration": 1500,
    "elapsed_time": 0,
    "is_running": false,
    "direction": "backward",
    "created_at": 1697654460,
    "background_color": "#3b82f6",
    "text_color": "#ffffff",
    "font_size": 48
  }
}
```

### Start Timer

**Send:**
```json
{
  "type": "start_timer",
  "room_id": "20251018180000abc123",
  "timer_id": "20251018180100def456"
}
```

**Receive:**
```json
{
  "type": "timer_started",
  "room_id": "20251018180000abc123",
  "timer_id": "20251018180100def456"
}
```

### Pause Timer

**Send:**
```json
{
  "type": "pause_timer",
  "room_id": "20251018180000abc123",
  "timer_id": "20251018180100def456"
}
```

**Receive:**
```json
{
  "type": "timer_paused",
  "room_id": "20251018180000abc123",
  "timer_id": "20251018180100def456"
}
```

### Update Timer Tick

**Send (every second when running):**
```json
{
  "type": "tick_timer",
  "room_id": "20251018180000abc123",
  "timer_id": "20251018180100def456",
  "payload": {
    "elapsed_time": 451
  }
}
```

**Receive:**
```json
{
  "type": "timer_tick",
  "room_id": "20251018180000abc123",
  "timer_id": "20251018180100def456",
  "payload": {
    "elapsed_time": 451
  }
}
```

### Forward Timer (+10 seconds)

**Send:**
```json
{
  "type": "forward_timer",
  "room_id": "20251018180000abc123",
  "timer_id": "20251018180100def456",
  "payload": {
    "seconds": 10
  }
}
```

**Receive:**
```json
{
  "type": "timer_forwarded",
  "room_id": "20251018180000abc123",
  "timer_id": "20251018180100def456",
  "payload": {
    "seconds": 10
  }
}
```

### Backward Timer (-10 seconds)

**Send:**
```json
{
  "type": "backward_timer",
  "room_id": "20251018180000abc123",
  "timer_id": "20251018180100def456",
  "payload": {
    "seconds": 10
  }
}
```

**Receive:**
```json
{
  "type": "timer_backwarded",
  "room_id": "20251018180000abc123",
  "timer_id": "20251018180100def456",
  "payload": {
    "seconds": 10
  }
}
```

### Update Timer Settings

**Send:**
```json
{
  "type": "update_timer",
  "room_id": "20251018180000abc123",
  "timer_id": "20251018180100def456",
  "payload": {
    "name": "Short Break",
    "duration": 300,
    "direction": "backward",
    "background_color": "#10b981",
    "text_color": "#ffffff",
    "font_size": 56
  }
}
```

**Receive:**
```json
{
  "type": "timer_updated",
  "room_id": "20251018180000abc123",
  "timer_id": "20251018180100def456",
  "payload": {
    "name": "Short Break",
    "duration": 300,
    "direction": "backward",
    "background_color": "#10b981",
    "text_color": "#ffffff",
    "font_size": 56
  }
}
```

### Delete Timer

**Send:**
```json
{
  "type": "delete_timer",
  "room_id": "20251018180000abc123",
  "timer_id": "20251018180100def456"
}
```

**Receive:**
```json
{
  "type": "timer_deleted",
  "room_id": "20251018180000abc123",
  "timer_id": "20251018180100def456"
}
```

## Testing with curl

### Create a room
```bash
curl -X POST http://localhost:8080/api/rooms \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Room",
    "user_id": "test123",
    "user_email": "test@example.com",
    "user_name": "Test User"
  }'
```

### List rooms
```bash
curl http://localhost:8080/api/rooms
```

### Get room details
```bash
curl http://localhost:8080/api/rooms/{roomId}
```

## Testing with wscat (WebSocket)

Install wscat:
```bash
npm install -g wscat
```

Connect to WebSocket:
```bash
wscat -c ws://localhost:8080/ws
```

Then send JSON messages:
```json
{"type":"join_room","room_id":"your-room-id","payload":{"room_id":"your-room-id","user_id":"test123"}}
```

## Timer Direction Modes

### Forward (Stopwatch)
- Counts up from 0
- `elapsed_time` increases: 0, 1, 2, 3...
- No automatic stop
- Good for tracking work sessions

### Backward (Countdown)
- Counts down from `duration`
- `elapsed_time` decreases: 1500, 1499, 1498...
- Stops at 0 and triggers confetti
- Good for timed breaks, pomodoro sessions

## Color Presets

Available background colors:
- `#3b82f6` - Blue
- `#10b981` - Green
- `#f59e0b` - Amber
- `#ef4444` - Red
- `#8b5cf6` - Purple
- `#ec4899` - Pink
- `#6366f1` - Indigo
- `#14b8a6` - Teal

Text colors:
- `#ffffff` - White
- `#000000` - Black

Font sizes:
- 24, 32, 40, 48, 56, 64

## Error Handling

The server returns standard HTTP status codes:
- `200` - Success
- `400` - Bad request (invalid JSON or parameters)
- `404` - Not found (room doesn't exist)
- `500` - Internal server error

For WebSocket errors, check the server logs.

## New API Endpoints

### Get Timer Templates

```bash
GET /api/templates
```

**Response:**
```json
[
  {
    "id": "pomodoro",
    "name": "Pomodoro",
    "duration": 1500,
    "direction": "backward",
    "background_color": "#ef4444",
    "text_color": "#ffffff",
    "font_size": 48,
    "is_built_in": true
  },
  {
    "id": "short-break",
    "name": "Short Break",
    "duration": 300,
    "direction": "backward",
    "background_color": "#10b981",
    "text_color": "#ffffff",
    "font_size": 48,
    "is_built_in": true
  },
  {
    "id": "long-break",
    "name": "Long Break",
    "duration": 900,
    "direction": "backward",
    "background_color": "#3b82f6",
    "text_color": "#ffffff",
    "font_size": 48,
    "is_built_in": true
  },
  {
    "id": "stopwatch",
    "name": "Stopwatch",
    "duration": 0,
    "direction": "forward",
    "background_color": "#8b5cf6",
    "text_color": "#ffffff",
    "font_size": 48,
    "is_built_in": true
  }
]
```

### Join Room by Invite Code

```bash
POST /api/rooms/invite/{inviteCode}
Content-Type: application/json

{
  "user_id": "auth0|789012",
  "user_email": "friend@example.com",
  "user_name": "Jane Smith"
}
```

**Example:**
```bash
POST /api/rooms/invite/ABC123
```

**Response:**
```json
{
  "id": "20251018180000abc123",
  "name": "Study Room",
  "created_by": "auth0|123456",
  "users": {
    "auth0|123456": {
      "id": "auth0|123456",
      "email": "user@example.com",
      "name": "John Doe",
      "auth0_sub": ""
    },
    "auth0|789012": {
      "id": "auth0|789012",
      "email": "friend@example.com",
      "name": "Jane Smith",
      "auth0_sub": ""
    }
  },
  "timers": {},
  "invite_code": "ABC123"
}
```

### Get User Profile

```bash
GET /api/users/{userId}/profile
```

**Example:**
```bash
GET /api/users/auth0|123456/profile
```

**Response:**
```json
{
  "dark_mode": false,
  "sound_enabled": true,
  "default_template": "pomodoro"
}
```

**Note:** If profile doesn't exist, returns default values shown above.

### Update User Profile

```bash
PUT /api/users/{userId}/profile
Content-Type: application/json

{
  "dark_mode": true,
  "sound_enabled": false,
  "default_template": "short-break"
}
```

**Example:**
```bash
PUT /api/users/auth0|123456/profile
```

**Response:**
```json
{
  "dark_mode": true,
  "sound_enabled": false,
  "default_template": "short-break"
}
```

### Get Timer History

```bash
GET /api/users/{userId}/history
```

**Example:**
```bash
GET /api/users/auth0|123456/history
```

**Response:**
```json
[
  {
    "id": "20251018180000hist01",
    "timer_name": "Pomodoro Session",
    "duration": 1500,
    "completed_at": 1697654400,
    "user_id": "auth0|123456",
    "room_id": "20251018180000abc123"
  },
  {
    "id": "20251018180500hist02",
    "timer_name": "Short Break",
    "duration": 300,
    "completed_at": 1697658000,
    "user_id": "auth0|123456",
    "room_id": "20251018180000abc123"
  }
]
```

**Note:** Returns empty array `[]` if no history exists.

### Add Timer History Entry

```bash
POST /api/users/{userId}/history
Content-Type: application/json

{
  "timer_name": "Study Session",
  "duration": 1800,
  "room_id": "20251018180000abc123"
}
```

**Example:**
```bash
POST /api/users/auth0|123456/history
```

**Response:**
```json
{
  "id": "20251018181000hist03",
  "timer_name": "Study Session",
  "duration": 1800,
  "completed_at": 1697661600,
  "user_id": "auth0|123456",
  "room_id": "20251018180000abc123"
}
```

**Note:** The `id`, `completed_at`, and `user_id` fields are automatically generated.

## Updated Room Structure

Rooms now include an `invite_code` field:

```json
{
  "id": "20251018180000abc123",
  "name": "Study Room",
  "created_by": "auth0|123456",
  "users": { ... },
  "timers": { ... },
  "invite_code": "ABC123"
}
```

The invite code is automatically generated when a room is created. It consists of 6 uppercase alphanumeric characters (excluding confusing characters like I, O, 0, 1).

## Feature Integration Examples

### Creating a Timer from Template

1. Get available templates:
```bash
GET /api/templates
```

2. Create timer using template data via WebSocket:
```json
{
  "type": "create_timer",
  "room_id": "20251018180000abc123",
  "payload": {
    "name": "Pomodoro",
    "duration": 1500,
    "elapsed_time": 1500,
    "is_running": false,
    "direction": "backward",
    "background_color": "#ef4444",
    "text_color": "#ffffff",
    "font_size": 48
  }
}
```

### User Workflow with All Features

1. **Login**: User authenticates with Auth0
2. **Load Profile**: `GET /api/users/{userId}/profile`
3. **Create/Join Room**: Use invite code or create new room
4. **Select Template**: `GET /api/templates` and choose one
5. **Create Timer**: Send via WebSocket with template settings
6. **Complete Timer**: When finished, automatically:
   - Plays sound (if enabled in profile)
   - Saves to history: `POST /api/users/{userId}/history`
7. **View History**: `GET /api/users/{userId}/history`
8. **Update Preferences**: `PUT /api/users/{userId}/profile`

## Error Responses

All new endpoints follow standard HTTP status codes:

- `200 OK` - Success
- `400 Bad Request` - Invalid input
- `404 Not Found` - Resource doesn't exist
- `500 Internal Server Error` - Server error

Example error response:
```
HTTP/1.1 404 Not Found
Content-Type: text/plain

Invalid invite code
```
