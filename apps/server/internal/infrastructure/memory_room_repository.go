package infrastructure

import (
	"errors"
	"sync"
	"time"

	"github.com/lakshmaji/sjkdhfkjsdf/apps/server/internal/domain"
)

// MemoryRoomRepository implements RoomRepository using in-memory storage
type MemoryRoomRepository struct {
	rooms map[string]*domain.Room
	mu    sync.RWMutex
}

// NewMemoryRoomRepository creates a new in-memory room repository
func NewMemoryRoomRepository() *MemoryRoomRepository {
	return &MemoryRoomRepository{
		rooms: make(map[string]*domain.Room),
	}
}

// CreateRoom creates a new room
func (r *MemoryRoomRepository) CreateRoom(room *domain.Room) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	room.ID = generateID()
	room.InviteCode = generateInviteCode()
	r.rooms[room.ID] = room
	return nil
}

// GetRoom retrieves a room by ID
func (r *MemoryRoomRepository) GetRoom(roomID string) (*domain.Room, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	room, exists := r.rooms[roomID]
	if !exists {
		return nil, errors.New("room not found")
	}
	return room, nil
}

// ListRooms retrieves all rooms
func (r *MemoryRoomRepository) ListRooms() ([]*domain.Room, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	rooms := make([]*domain.Room, 0, len(r.rooms))
	for _, room := range r.rooms {
		rooms = append(rooms, room)
	}
	return rooms, nil
}

// FindRoomByInviteCode finds a room by its invite code
func (r *MemoryRoomRepository) FindRoomByInviteCode(inviteCode string) (*domain.Room, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	for _, room := range r.rooms {
		if room.InviteCode == inviteCode {
			return room, nil
		}
	}
	return nil, errors.New("room not found")
}

// AddUserToRoom adds a user to a room
func (r *MemoryRoomRepository) AddUserToRoom(roomID string, user *domain.User) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	room, exists := r.rooms[roomID]
	if !exists {
		return errors.New("room not found")
	}

	room.Users[user.ID] = user
	return nil
}

// GenerateID generates a unique ID
func GenerateID() string {
	return time.Now().Format("20060102150405") + randomString(6)
}

func generateID() string {
	return GenerateID()
}

func randomString(n int) string {
	const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, n)
	for i := range b {
		b[i] = letters[time.Now().UnixNano()%int64(len(letters))]
	}
	return string(b)
}

func generateInviteCode() string {
	const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
	b := make([]byte, 6)
	for i := range b {
		b[i] = letters[time.Now().UnixNano()%int64(len(letters))]
	}
	return string(b)
}
