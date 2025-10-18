export interface User {
  id: string;
  email: string;
  name: string;
  auth0_sub: string;
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
}

export interface WSMessage {
  type: string;
  room_id?: string;
  timer_id?: string;
  payload?: any;
}
