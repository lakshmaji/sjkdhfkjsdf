import { Room, TimerTemplate, UserProfile, TimerHistoryEntry } from './types';

export class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async createRoom(name: string, userId: string, userEmail: string, userName: string): Promise<Room> {
    const response = await fetch(`${this.baseUrl}/api/rooms`, {
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

    return response.json() as Promise<Room>;
  }

  async listRooms(): Promise<Room[]> {
    const response = await fetch(`${this.baseUrl}/api/rooms`);
    
    if (!response.ok) {
      throw new Error('Failed to list rooms');
    }

    return response.json() as Promise<Room[]>;
  }

  async getRoom(roomId: string): Promise<Room> {
    const response = await fetch(`${this.baseUrl}/api/rooms/${roomId}`);
    
    if (!response.ok) {
      throw new Error('Failed to get room');
    }

    return response.json() as Promise<Room>;
  }

  async joinRoom(roomId: string, userId: string, userEmail: string, userName: string): Promise<Room> {
    const response = await fetch(`${this.baseUrl}/api/rooms/${roomId}/join`, {
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

    return response.json() as Promise<Room>;
  }

  async joinRoomByInvite(inviteCode: string, userId: string, userEmail: string, userName: string): Promise<Room> {
    const response = await fetch(`${this.baseUrl}/api/rooms/invite/${inviteCode}`, {
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
      throw new Error('Failed to join room with invite code');
    }

    return response.json() as Promise<Room>;
  }

  async getTemplates(): Promise<TimerTemplate[]> {
    const response = await fetch(`${this.baseUrl}/api/templates`);
    
    if (!response.ok) {
      throw new Error('Failed to get templates');
    }

    return response.json() as Promise<TimerTemplate[]>;
  }

  async getUserProfile(userId: string): Promise<UserProfile> {
    const response = await fetch(`${this.baseUrl}/api/users/${userId}/profile`);
    
    if (!response.ok) {
      throw new Error('Failed to get user profile');
    }

    return response.json() as Promise<UserProfile>;
  }

  async updateUserProfile(userId: string, profile: UserProfile): Promise<UserProfile> {
    const response = await fetch(`${this.baseUrl}/api/users/${userId}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profile),
    });

    if (!response.ok) {
      throw new Error('Failed to update user profile');
    }

    return response.json() as Promise<UserProfile>;
  }

  async getTimerHistory(userId: string): Promise<TimerHistoryEntry[]> {
    const response = await fetch(`${this.baseUrl}/api/users/${userId}/history`);
    
    if (!response.ok) {
      throw new Error('Failed to get timer history');
    }

    return response.json() as Promise<TimerHistoryEntry[]>;
  }

  async addTimerHistory(userId: string, entry: Omit<TimerHistoryEntry, 'id' | 'completed_at' | 'user_id'>): Promise<TimerHistoryEntry> {
    const response = await fetch(`${this.baseUrl}/api/users/${userId}/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entry),
    });

    if (!response.ok) {
      throw new Error('Failed to add timer history');
    }

    return response.json() as Promise<TimerHistoryEntry>;
  }
}
