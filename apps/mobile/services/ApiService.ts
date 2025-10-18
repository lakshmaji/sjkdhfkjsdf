import { API_BASE_URL } from '../config';
import { Room } from '../types';

export const apiService = {
  async createRoom(name: string, userId: string, userEmail: string, userName: string): Promise<Room> {
    const response = await fetch(`${API_BASE_URL}/api/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        user_id: userId,
        user_email: userEmail,
        user_name: userName,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create room');
    }

    return response.json();
  },

  async listRooms(): Promise<Room[]> {
    const response = await fetch(`${API_BASE_URL}/api/rooms`);
    
    if (!response.ok) {
      throw new Error('Failed to list rooms');
    }

    return response.json();
  },

  async getRoom(roomId: string): Promise<Room> {
    const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}`);
    
    if (!response.ok) {
      throw new Error('Failed to get room');
    }

    return response.json();
  },

  async joinRoom(roomId: string, userId: string, userEmail: string, userName: string): Promise<Room> {
    const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        user_email: userEmail,
        user_name: userName,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to join room');
    }

    return response.json();
  },
};
