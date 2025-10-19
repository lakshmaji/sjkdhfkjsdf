package application

import (
	"errors"
	"github.com/lakshmaji/sjkdhfkjsdf/apps/server/internal/domain"
)

// RoomService handles room-related business logic
type RoomService struct {
	roomRepo domain.RoomRepository
}

// NewRoomService creates a new room service
func NewRoomService(roomRepo domain.RoomRepository) *RoomService {
	return &RoomService{
		roomRepo: roomRepo,
	}
}

// CreateRoom creates a new room with the given details
func (s *RoomService) CreateRoom(name, userID, userEmail, userName string) (*domain.Room, error) {
	if name == "" {
		return nil, errors.New("room name is required")
	}
	if userID == "" {
		return nil, errors.New("user ID is required")
	}

	room := &domain.Room{
		Name:      name,
		CreatedBy: userID,
		Users:     make(map[string]*domain.User),
		Timers:    make(map[string]*domain.Timer),
	}

	room.Users[userID] = &domain.User{
		ID:    userID,
		Email: userEmail,
		Name:  userName,
	}

	if err := s.roomRepo.CreateRoom(room); err != nil {
		return nil, err
	}

	return room, nil
}

// GetRoom retrieves a room by ID
func (s *RoomService) GetRoom(roomID string) (*domain.Room, error) {
	return s.roomRepo.GetRoom(roomID)
}

// ListRooms retrieves all rooms
func (s *RoomService) ListRooms() ([]*domain.Room, error) {
	return s.roomRepo.ListRooms()
}

// JoinRoom adds a user to an existing room
func (s *RoomService) JoinRoom(roomID, userID, userEmail, userName string) (*domain.Room, error) {
	if roomID == "" {
		return nil, errors.New("room ID is required")
	}
	if userID == "" {
		return nil, errors.New("user ID is required")
	}

	user := &domain.User{
		ID:    userID,
		Email: userEmail,
		Name:  userName,
	}

	if err := s.roomRepo.AddUserToRoom(roomID, user); err != nil {
		return nil, err
	}

	return s.roomRepo.GetRoom(roomID)
}

// JoinRoomByInvite adds a user to a room using an invite code
func (s *RoomService) JoinRoomByInvite(inviteCode, userID, userEmail, userName string) (*domain.Room, error) {
	if inviteCode == "" {
		return nil, errors.New("invite code is required")
	}
	if userID == "" {
		return nil, errors.New("user ID is required")
	}

	room, err := s.roomRepo.FindRoomByInviteCode(inviteCode)
	if err != nil {
		return nil, err
	}

	user := &domain.User{
		ID:    userID,
		Email: userEmail,
		Name:  userName,
	}

	if err := s.roomRepo.AddUserToRoom(room.ID, user); err != nil {
		return nil, err
	}

	return s.roomRepo.GetRoom(room.ID)
}
