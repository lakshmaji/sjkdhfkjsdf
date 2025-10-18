# New Features Implementation Guide

This document describes the newly implemented features in the Timer App.

## 1. Timer Templates

### What it does
Pre-built timer configurations that allow users to quickly create timers for common use cases.

### Built-in Templates
- **Pomodoro**: 25-minute countdown timer (red background)
- **Short Break**: 5-minute countdown timer (green background)
- **Long Break**: 15-minute countdown timer (blue background)
- **Stopwatch**: Count-up timer starting from 0 (purple background)

### How to use
1. In a room, tap the "📋 Templates" button
2. Select a template from the modal
3. A timer is automatically created with the template's settings

### API Endpoints
- `GET /api/templates` - Returns all available timer templates

## 2. Sound Notifications

### What it does
Plays an audio alert when countdown timers complete (reach 0).

### Features
- Automatic sound playback on timer completion
- Toggle on/off in user profile settings
- Non-intrusive (respects user preferences)
- Uses expo-av for audio playback

### How to use
1. Go to Profile screen
2. Toggle "Sound Notifications" switch
3. Setting is saved to user profile
4. When a countdown timer completes, sound plays (if enabled)

## 3. Dark Mode

### What it does
Provides a complete dark theme across the entire application.

### Theme Colors

**Light Mode:**
- Background: #f5f5f5
- Card: #ffffff
- Text: #333333
- Text Secondary: #666666
- Primary: #3b82f6

**Dark Mode:**
- Background: #1a1a1a
- Card: #2d2d2d
- Text: #ffffff
- Text Secondary: #aaaaaa
- Primary: #60a5fa

### How to use
1. Go to Profile screen
2. Toggle "Dark Mode" switch
3. All screens and components immediately reflect the change
4. Setting is saved to user profile

### Implementation
- ThemeContext provides theme colors to all components
- useTheme() hook for accessing theme in any component
- All UI components use dynamic colors from theme

## 4. Timer History

### What it does
Automatically tracks all completed timer sessions with details.

### What is tracked
- Timer name
- Duration (in seconds)
- Completion timestamp
- Room ID where it was completed
- User ID who completed it

### How to use
1. Run a countdown timer to completion
2. History is automatically recorded
3. View history in Profile screen
4. Shows most recent 10 entries

### API Endpoints
- `GET /api/users/{userId}/history` - Get user's timer history
- `POST /api/users/{userId}/history` - Add entry to history

## 5. User Profiles

### What it does
Stores user preferences and displays user information.

### Stored Information
- User ID, email, name
- Dark mode preference (boolean)
- Sound enabled preference (boolean)
- Default template preference (string)

### Profile Screen Features
- View user information
- Toggle dark mode
- Toggle sound notifications
- View timer history (last 10 entries)
- Logout button

### API Endpoints
- `GET /api/users/{userId}/profile` - Get user profile
- `PUT /api/users/{userId}/profile` - Update user profile

### Default Profile
If a user has no profile, defaults are:
- dark_mode: false
- sound_enabled: true
- default_template: "pomodoro"

## 6. Room Invitations

### What it does
Each room gets a unique 6-character invite code for easy sharing.

### Features
- Auto-generated invite code on room creation
- Share via system share sheet
- Copy to clipboard
- Join room directly with code (no room browsing needed)

### Invite Code Format
- 6 uppercase alphanumeric characters
- Excludes confusing characters (I, O, 0, 1)
- Example: ABC123, XYZ789

### How to use

**Sharing:**
1. In a room, tap the invite code in the header
2. Choose "Copy" or tap the share icon 📤
3. Share the code with others

**Joining:**
1. On Room List screen, tap "Join by Code"
2. Enter the 6-character code
3. Automatically joins the room

### API Endpoints
- `POST /api/rooms/invite/{inviteCode}` - Join room by invite code
- Room object now includes `invite_code` field

## Technical Implementation

### Backend (Go)
- **File**: `apps/server/main.go`
- **New Structs**: UserProfile, TimerTemplate, TimerHistoryEntry
- **New Global State**: templates, userProfiles, timerHistory
- **Initialization**: initBuiltInTemplates() creates default templates
- **Invite Code**: generateInviteCode() creates unique codes

### Frontend (React Native)

#### New Files
- `contexts/ThemeContext.tsx` - Theme management with dark mode
- `screens/UserProfileScreen.tsx` - User profile and settings
- `components/TimerTemplateModal.tsx` - Template selection UI

#### Updated Files
- `App.tsx` - Added ThemeProvider and UserProfile route
- `types.ts` - Added new interfaces
- `services/ApiService.ts` - Added new API methods
- `components/TimerCard.tsx` - Added sound and history tracking
- `screens/RoomListScreen.tsx` - Added dark mode, profile, join by code
- `screens/RoomScreen.tsx` - Added templates, invite code display

#### New Dependencies
- `expo-av` - Audio playback for sound notifications

## Database Considerations

**Current Implementation**: All data is stored in memory (maps in Go).

**For Production**: Consider implementing:
- PostgreSQL for persistent storage
- Redis for session data
- Database migrations for user profiles, timer history
- Authentication tokens for API security

## Testing

All features have been tested:
- ✅ API endpoints respond correctly
- ✅ Templates return expected data
- ✅ User profiles can be created and updated
- ✅ Timer history tracks completions
- ✅ Invite codes work for room joining
- ✅ TypeScript compilation passes
- ✅ Go compilation passes
- ✅ Server starts successfully

## Future Enhancements

Possible improvements:
- Persistent database storage
- Custom user-created templates
- Timer analytics and statistics
- Export history to CSV/JSON
- Push notifications for shared timers
- Social features (share achievements)
