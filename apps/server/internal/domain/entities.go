package domain

import "sync"

// User represents a user in the system
type User struct {
	ID       string       `json:"id"`
	Email    string       `json:"email"`
	Name     string       `json:"name"`
	Auth0Sub string       `json:"auth0_sub"`
	Profile  *UserProfile `json:"profile,omitempty"`
}

// UserProfile represents user preferences
type UserProfile struct {
	DarkMode        bool   `json:"dark_mode"`
	SoundEnabled    bool   `json:"sound_enabled"`
	DefaultTemplate string `json:"default_template"`
}

// TimerTemplate represents a predefined timer configuration
type TimerTemplate struct {
	ID              string `json:"id"`
	Name            string `json:"name"`
	Duration        int64  `json:"duration"`
	Direction       string `json:"direction"`
	BackgroundColor string `json:"background_color"`
	TextColor       string `json:"text_color"`
	FontSize        int    `json:"font_size"`
	IsBuiltIn       bool   `json:"is_built_in"`
}

// TimerHistoryEntry represents a completed timer session
type TimerHistoryEntry struct {
	ID          string `json:"id"`
	TimerName   string `json:"timer_name"`
	Duration    int64  `json:"duration"`
	CompletedAt int64  `json:"completed_at"`
	UserID      string `json:"user_id"`
	RoomID      string `json:"room_id"`
}

// Room represents a collaborative timer room
type Room struct {
	ID         string            `json:"id"`
	Name       string            `json:"name"`
	CreatedBy  string            `json:"created_by"`
	Users      map[string]*User  `json:"users"`
	Timers     map[string]*Timer `json:"timers"`
	InviteCode string            `json:"invite_code"`
	mu         sync.RWMutex
}

// Timer represents a timer in a room
type Timer struct {
	ID              string `json:"id"`
	Name            string `json:"name"`
	Duration        int64  `json:"duration"`
	ElapsedTime     int64  `json:"elapsed_time"`
	IsRunning       bool   `json:"is_running"`
	Direction       string `json:"direction"`
	CreatedAt       int64  `json:"created_at"`
	BackgroundColor string `json:"background_color"`
	TextColor       string `json:"text_color"`
	FontSize        int    `json:"font_size"`
}
