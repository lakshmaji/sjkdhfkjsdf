import { API_BASE_URL } from '../config';
import { ApiService } from '@timer-app/business-logic';

export const apiService = new ApiService({
  baseUrl: API_BASE_URL,
});
