package infrastructure

import (
	"errors"

	"github.com/lakshmaji/sjkdhfkjsdf/apps/server/internal/domain"
)

// MemoryTimerRepository implements TimerRepository using in-memory storage
type MemoryTimerRepository struct {
	roomRepo *MemoryRoomRepository
}

// NewMemoryTimerRepository creates a new in-memory timer repository
func NewMemoryTimerRepository(roomRepo *MemoryRoomRepository) *MemoryTimerRepository {
	return &MemoryTimerRepository{
		roomRepo: roomRepo,
	}
}

// CreateTimer creates a new timer in a room
func (r *MemoryTimerRepository) CreateTimer(roomID string, timer *domain.Timer) error {
	r.roomRepo.mu.Lock()
	defer r.roomRepo.mu.Unlock()

	room, exists := r.roomRepo.rooms[roomID]
	if !exists {
		return errors.New("room not found")
	}

	room.Timers[timer.ID] = timer
	return nil
}

// GetTimer retrieves a timer by ID
func (r *MemoryTimerRepository) GetTimer(roomID, timerID string) (*domain.Timer, error) {
	r.roomRepo.mu.RLock()
	defer r.roomRepo.mu.RUnlock()

	room, exists := r.roomRepo.rooms[roomID]
	if !exists {
		return nil, errors.New("room not found")
	}

	timer, exists := room.Timers[timerID]
	if !exists {
		return nil, errors.New("timer not found")
	}

	return timer, nil
}

// UpdateTimer updates an existing timer
func (r *MemoryTimerRepository) UpdateTimer(roomID string, timer *domain.Timer) error {
	r.roomRepo.mu.Lock()
	defer r.roomRepo.mu.Unlock()

	room, exists := r.roomRepo.rooms[roomID]
	if !exists {
		return errors.New("room not found")
	}

	existingTimer, exists := room.Timers[timer.ID]
	if !exists {
		return errors.New("timer not found")
	}

	// Update timer fields
	existingTimer.Name = timer.Name
	existingTimer.Duration = timer.Duration
	existingTimer.Direction = timer.Direction
	existingTimer.BackgroundColor = timer.BackgroundColor
	existingTimer.TextColor = timer.TextColor
	existingTimer.FontSize = timer.FontSize
	existingTimer.IsRunning = timer.IsRunning
	existingTimer.ElapsedTime = timer.ElapsedTime

	return nil
}

// DeleteTimer deletes a timer from a room
func (r *MemoryTimerRepository) DeleteTimer(roomID, timerID string) error {
	r.roomRepo.mu.Lock()
	defer r.roomRepo.mu.Unlock()

	room, exists := r.roomRepo.rooms[roomID]
	if !exists {
		return errors.New("room not found")
	}

	delete(room.Timers, timerID)
	return nil
}
