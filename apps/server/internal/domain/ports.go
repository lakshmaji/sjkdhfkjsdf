package domain

// RoomRepository defines the interface for room storage operations
type RoomRepository interface {
	CreateRoom(room *Room) error
	GetRoom(roomID string) (*Room, error)
	ListRooms() ([]*Room, error)
	FindRoomByInviteCode(inviteCode string) (*Room, error)
	AddUserToRoom(roomID string, user *User) error
}

// TimerRepository defines the interface for timer operations
type TimerRepository interface {
	CreateTimer(roomID string, timer *Timer) error
	GetTimer(roomID, timerID string) (*Timer, error)
	UpdateTimer(roomID string, timer *Timer) error
	DeleteTimer(roomID, timerID string) error
}

// TemplateRepository defines the interface for template operations
type TemplateRepository interface {
	GetAllTemplates() ([]*TimerTemplate, error)
	GetTemplate(templateID string) (*TimerTemplate, error)
}

// UserProfileRepository defines the interface for user profile operations
type UserProfileRepository interface {
	GetProfile(userID string) (*UserProfile, error)
	UpdateProfile(userID string, profile *UserProfile) error
}

// HistoryRepository defines the interface for timer history operations
type HistoryRepository interface {
	GetHistory(userID string) ([]*TimerHistoryEntry, error)
	AddHistoryEntry(entry *TimerHistoryEntry) error
}
