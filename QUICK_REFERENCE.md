# Quick Reference Guide - New Features

## For Developers

### Starting the Server
```bash
cd apps/server
go run main.go
# Server runs on http://localhost:8080
```

### Running the Mobile App
```bash
cd apps/mobile
npm start
# Follow Expo prompts for platform (a=Android, i=iOS, w=Web)
```

## For Users

### 1. Using Timer Templates

**Step 1:** Open a room  
**Step 2:** Tap "📋 Templates" button  
**Step 3:** Select a template (Pomodoro, Short Break, Long Break, or Stopwatch)  
**Step 4:** Timer is automatically created with pre-configured settings

### 2. Enabling Sound Notifications

**Step 1:** Tap "Profile" button in Room List  
**Step 2:** Toggle "Sound Notifications" ON  
**Step 3:** Return to any room  
**Step 4:** When countdown timers complete, you'll hear an alert sound

### 3. Switching to Dark Mode

**Step 1:** Tap "Profile" button in Room List  
**Step 2:** Toggle "Dark Mode" ON  
**Step 3:** Entire app switches to dark theme instantly  
**Step 4:** Preference is saved automatically

### 4. Viewing Timer History

**Step 1:** Complete some countdown timers  
**Step 2:** Go to Profile screen  
**Step 3:** Scroll down to "Timer History" section  
**Step 4:** See your last 10 completed sessions with timestamps

### 5. Sharing Room Invites

**Method 1 - Share:**  
- In a room, tap the 📤 icon next to the invite code
- Choose share method (text, email, etc.)

**Method 2 - Copy:**  
- Tap the invite code itself
- Code is copied to clipboard
- Paste anywhere you like

### 6. Joining with Invite Code

**Step 1:** On Room List screen, tap "Join by Code"  
**Step 2:** Enter the 6-character code (e.g., ABC123)  
**Step 3:** Tap "Join"  
**Step 4:** You're instantly in the room!

## API Quick Reference

### Get Templates
```bash
curl http://localhost:8080/api/templates
```

### Join by Invite Code
```bash
curl -X POST http://localhost:8080/api/rooms/invite/ABC123 \
  -H "Content-Type: application/json" \
  -d '{"user_id":"user123","user_email":"user@example.com","user_name":"User"}'
```

### Get User Profile
```bash
curl http://localhost:8080/api/users/user123/profile
```

### Update User Profile
```bash
curl -X PUT http://localhost:8080/api/users/user123/profile \
  -H "Content-Type: application/json" \
  -d '{"dark_mode":true,"sound_enabled":true,"default_template":"pomodoro"}'
```

### Get Timer History
```bash
curl http://localhost:8080/api/users/user123/history
```

### Add to History
```bash
curl -X POST http://localhost:8080/api/users/user123/history \
  -H "Content-Type: application/json" \
  -d '{"timer_name":"Work Session","duration":1500,"room_id":"room123"}'
```

## Template Details

| Template | Duration | Direction | Color |
|----------|----------|-----------|-------|
| Pomodoro | 25 min | Countdown | Red |
| Short Break | 5 min | Countdown | Green |
| Long Break | 15 min | Countdown | Blue |
| Stopwatch | N/A | Count Up | Purple |

## Keyboard Shortcuts (Web)

- **Escape**: Close modals
- **Enter**: Confirm actions in modals

## Troubleshooting

### Sound Not Playing?
1. Check Profile → Sound Notifications is ON
2. Ensure device volume is up
3. Verify browser/app has audio permissions

### Dark Mode Not Persisting?
1. Ensure you're logged in
2. Check internet connection for profile sync
3. Try toggling dark mode again

### Invite Code Not Working?
1. Verify code is exactly 6 characters
2. Code is case-insensitive (ABC123 = abc123)
3. Check if room still exists

### History Not Saving?
1. Ensure timer runs to completion (reaches 0:00)
2. Only countdown timers save to history
3. Check you're logged in

## Useful Links

- **Full Documentation**: See README.md
- **Feature Details**: See FEATURES.md
- **API Examples**: See API_EXAMPLES.md
- **Implementation Guide**: See NEW_FEATURES.md
- **Summary**: See IMPLEMENTATION_SUMMARY.md

## Support

For issues or questions:
1. Check the documentation files
2. Review API_EXAMPLES.md for usage patterns
3. Open an issue on GitHub
