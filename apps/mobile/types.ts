export interface User {
  id: string;
  email: string;
  name: string;
  auth0_sub: string;
  profile?: UserProfile;
}

export interface UserProfile {
  dark_mode: boolean;
  sound_enabled: boolean;
  default_template: string;
}

export interface TimerTemplate {
  id: string;
  name: string;
  duration: number;
  direction: 'forward' | 'backward';
  background_color: string;
  text_color: string;
  font_size: number;
  is_built_in: boolean;
}

export interface TimerHistoryEntry {
  id: string;
  timer_name: string;
  duration: number;
  completed_at: number;
  user_id: string;
  room_id: string;
}

export interface Timer {
  id: string;
  name: string;
  duration: number; // in seconds
  elapsed_time: number; // in seconds
  is_running: boolean;
  direction: 'forward' | 'backward';
  created_at: number;
  background_color: string;
  text_color: string;
  font_size: number;
}

export interface Room {
  id: string;
  name: string;
  created_by: string;
  users: { [key: string]: User };
  timers: { [key: string]: Timer };
  invite_code: string;
}

export interface WSMessage {
  type: string;
  room_id?: string;
  timer_id?: string;
  payload?: any;
}
