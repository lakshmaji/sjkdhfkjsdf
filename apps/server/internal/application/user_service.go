package application

import (
	"errors"
	"github.com/lakshmaji/sjkdhfkjsdf/apps/server/internal/domain"
)

// UserService handles user-related business logic
type UserService struct {
	profileRepo domain.UserProfileRepository
	historyRepo domain.HistoryRepository
}

// NewUserService creates a new user service
func NewUserService(profileRepo domain.UserProfileRepository, historyRepo domain.HistoryRepository) *UserService {
	return &UserService{
		profileRepo: profileRepo,
		historyRepo: historyRepo,
	}
}

// GetProfile retrieves a user's profile
func (s *UserService) GetProfile(userID string) (*domain.UserProfile, error) {
	if userID == "" {
		return nil, errors.New("user ID is required")
	}
	return s.profileRepo.GetProfile(userID)
}

// UpdateProfile updates a user's profile
func (s *UserService) UpdateProfile(userID string, profile *domain.UserProfile) error {
	if userID == "" {
		return errors.New("user ID is required")
	}
	if profile == nil {
		return errors.New("profile is required")
	}
	return s.profileRepo.UpdateProfile(userID, profile)
}

// GetHistory retrieves a user's timer history
func (s *UserService) GetHistory(userID string) ([]*domain.TimerHistoryEntry, error) {
	if userID == "" {
		return nil, errors.New("user ID is required")
	}
	return s.historyRepo.GetHistory(userID)
}

// AddHistoryEntry adds a new entry to user's timer history
func (s *UserService) AddHistoryEntry(entry *domain.TimerHistoryEntry) error {
	if entry == nil {
		return errors.New("history entry is required")
	}
	return s.historyRepo.AddHistoryEntry(entry)
}
