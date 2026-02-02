import { AdminTokenResponse } from './types';
import { api } from '../api';

const ADMIN_ACCESS_TOKEN_KEY = 'admin_access_token';
const ADMIN_REFRESH_TOKEN_KEY = 'admin_refresh_token';
const ADMIN_ACCOUNT_ID_KEY = 'admin_account_id';
const ADMIN_LOGIN_KEY = 'admin_login';

/**
 * Сохранение токенов администратора в localStorage
 */
export function saveAdminTokens(tokens: AdminTokenResponse): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(ADMIN_ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(ADMIN_REFRESH_TOKEN_KEY, tokens.refreshToken);
    localStorage.setItem(ADMIN_ACCOUNT_ID_KEY, tokens.accountId);
    localStorage.setItem(ADMIN_LOGIN_KEY, tokens.login);
    
    // Обновляем заголовок авторизации
    updateAdminAuthHeader(tokens.accessToken);
  } catch (error) {
    console.error('Ошибка при сохранении токенов администратора:', error);
  }
}

/**
 * Получение токенов администратора из localStorage
 */
export function getAdminTokens(): AdminTokenResponse | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const accessToken = localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY);
    const refreshToken = localStorage.getItem(ADMIN_REFRESH_TOKEN_KEY);
    const accountId = localStorage.getItem(ADMIN_ACCOUNT_ID_KEY);
    const login = localStorage.getItem(ADMIN_LOGIN_KEY);
    
    if (!accessToken || !refreshToken || !accountId || !login) {
      return null;
    }
    
    return { accessToken, refreshToken, accountId, login };
  } catch (error) {
    console.error('Ошибка при получении токенов администратора:', error);
    return null;
  }
}

/**
 * Удаление токенов администратора из localStorage
 */
export function clearAdminTokens(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY);
    localStorage.removeItem(ADMIN_REFRESH_TOKEN_KEY);
    localStorage.removeItem(ADMIN_ACCOUNT_ID_KEY);
    localStorage.removeItem(ADMIN_LOGIN_KEY);
    
    // Удаляем заголовок авторизации
    api.defaults.headers.common['Authorization'] = '';
  } catch (error) {
    console.error('Ошибка при удалении токенов администратора:', error);
  }
}

/**
 * Обновление заголовка авторизации
 */
export function updateAdminAuthHeader(accessToken: string): void {
  if (accessToken) {
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  } else {
    api.defaults.headers.common['Authorization'] = '';
  }
}

/**
 * Проверка истёк ли токен
 */
export function isAdminTokenExpired(token: string): boolean {
  try {
    if (!token) return true;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    console.error('Ошибка при проверке срока токена администратора:', error);
    return true;
  }
}