package infrastructure

import (
	"sync"
	"time"

	"github.com/lakshmaji/sjkdhfkjsdf/apps/server/internal/domain"
)

// MemoryUserProfileRepository implements UserProfileRepository using in-memory storage
type MemoryUserProfileRepository struct {
	profiles map[string]*domain.UserProfile
	mu       sync.RWMutex
}

// NewMemoryUserProfileRepository creates a new in-memory user profile repository
func NewMemoryUserProfileRepository() *MemoryUserProfileRepository {
	return &MemoryUserProfileRepository{
		profiles: make(map[string]*domain.UserProfile),
	}
}

// GetProfile retrieves a user's profile
func (r *MemoryUserProfileRepository) GetProfile(userID string) (*domain.UserProfile, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	profile, exists := r.profiles[userID]
	if !exists {
		// Return default profile
		return &domain.UserProfile{
			DarkMode:        false,
			SoundEnabled:    true,
			DefaultTemplate: "pomodoro",
		}, nil
	}
	return profile, nil
}

// UpdateProfile updates a user's profile
func (r *MemoryUserProfileRepository) UpdateProfile(userID string, profile *domain.UserProfile) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	r.profiles[userID] = profile
	return nil
}

// MemoryHistoryRepository implements HistoryRepository using in-memory storage
type MemoryHistoryRepository struct {
	history map[string][]*domain.TimerHistoryEntry
	mu      sync.RWMutex
}

// NewMemoryHistoryRepository creates a new in-memory history repository
func NewMemoryHistoryRepository() *MemoryHistoryRepository {
	return &MemoryHistoryRepository{
		history: make(map[string][]*domain.TimerHistoryEntry),
	}
}

// GetHistory retrieves a user's timer history
func (r *MemoryHistoryRepository) GetHistory(userID string) ([]*domain.TimerHistoryEntry, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	history, exists := r.history[userID]
	if !exists {
		return []*domain.TimerHistoryEntry{}, nil
	}
	return history, nil
}

// AddHistoryEntry adds a new entry to user's timer history
func (r *MemoryHistoryRepository) AddHistoryEntry(entry *domain.TimerHistoryEntry) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	entry.ID = generateID()
	entry.CompletedAt = time.Now().Unix()

	if r.history[entry.UserID] == nil {
		r.history[entry.UserID] = []*domain.TimerHistoryEntry{}
	}
	r.history[entry.UserID] = append(r.history[entry.UserID], entry)
	return nil
}
