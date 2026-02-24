import { environment } from '../../../environments/environment';

export const APP_CONSTANTS = {
  DEFAULT_MIN_STOCK: 5,
  DEFAULT_PAGE_SIZE: 20,
  TOKEN_KEY: 'inventory_token',
  USER_KEY: 'inventory_user',
  API_URL: environment.apiUrl,
} as const;
