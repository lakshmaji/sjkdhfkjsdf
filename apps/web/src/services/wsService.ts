import { WebSocketService } from 'business';
import { WS_BASE_URL } from '../config';

export const wsService = new WebSocketService(WS_BASE_URL);
