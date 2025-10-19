package application

import (
	"errors"
	"github.com/lakshmaji/sjkdhfkjsdf/apps/server/internal/domain"
)

// TimerService handles timer-related business logic
type TimerService struct {
	timerRepo domain.TimerRepository
}

// NewTimerService creates a new timer service
func NewTimerService(timerRepo domain.TimerRepository) *TimerService {
	return &TimerService{
		timerRepo: timerRepo,
	}
}

// CreateTimer creates a new timer in a room
func (s *TimerService) CreateTimer(roomID string, timer *domain.Timer) error {
	if roomID == "" {
		return errors.New("room ID is required")
	}
	if timer == nil {
		return errors.New("timer is required")
	}

	return s.timerRepo.CreateTimer(roomID, timer)
}

// UpdateTimer updates an existing timer
func (s *TimerService) UpdateTimer(roomID string, timer *domain.Timer) error {
	if roomID == "" {
		return errors.New("room ID is required")
	}
	if timer == nil {
		return errors.New("timer is required")
	}

	return s.timerRepo.UpdateTimer(roomID, timer)
}

// DeleteTimer deletes a timer from a room
func (s *TimerService) DeleteTimer(roomID, timerID string) error {
	if roomID == "" {
		return errors.New("room ID is required")
	}
	if timerID == "" {
		return errors.New("timer ID is required")
	}

	return s.timerRepo.DeleteTimer(roomID, timerID)
}

// GetTimer retrieves a timer by ID
func (s *TimerService) GetTimer(roomID, timerID string) (*domain.Timer, error) {
	return s.timerRepo.GetTimer(roomID, timerID)
}
