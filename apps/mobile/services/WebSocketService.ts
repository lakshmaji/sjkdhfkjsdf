import { WS_BASE_URL } from '../config';
import { WebSocketService } from '@timer-app/business-logic';

export const wsService = new WebSocketService({
  wsUrl: WS_BASE_URL,
  maxReconnectAttempts: 5,
  reconnectDelay: 1000,
});
