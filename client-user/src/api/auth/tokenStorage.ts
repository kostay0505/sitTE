import { api } from '@/api/api';
import { CreateTokenResponse } from '@/api/auth/types';
import { extractTgIdFromToken } from '@/utils/tokenUtils';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const CURRENT_USER_KEY = 'current_user_tg_id';

/**
 * Получает ключ для хранения токена доступа для конкретного пользователя
 */
function getAccessTokenKey(tgId: string): string {
  return `${ACCESS_TOKEN_KEY}_${tgId}`;
}

/**
 * Получает ключ для хранения refresh токена для конкретного пользователя
 */
function getRefreshTokenKey(tgId: string): string {
  return `${REFRESH_TOKEN_KEY}_${tgId}`;
}

/**
 * Очищает токены всех пользователей кроме текущего
 */
function clearOtherUsersTokens(currentTgId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (
        (key.startsWith(ACCESS_TOKEN_KEY) ||
          key.startsWith(REFRESH_TOKEN_KEY)) &&
        !key.includes(currentTgId)
      ) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Ошибка при очистке токенов других пользователей:', error);
  }
}

/**
 * Сохраняет токены в localStorage для конкретного пользователя
 */
export function saveTokens(tokens: CreateTokenResponse): void {
  if (typeof window === 'undefined') return;

  try {
    const tgId = extractTgIdFromToken(tokens.accessToken);
    if (!tgId) {
      throw new Error('Не удалось извлечь tgId из токена');
    }

    // Очищаем токены других пользователей
    clearOtherUsersTokens(tgId);

    // Сохраняем токены для текущего пользователя
    localStorage.setItem(getAccessTokenKey(tgId), tokens.accessToken);
    localStorage.setItem(getRefreshTokenKey(tgId), tokens.refreshToken);
    localStorage.setItem(CURRENT_USER_KEY, tgId);

    // Обновляем текущий экземпляр axios с новым токеном доступа
    updateAuthHeader(tokens.accessToken);
  } catch (error) {
    console.error('Ошибка при сохранении токенов:', error);
  }
}

/**
 * Получает токены из localStorage для текущего пользователя
 */
export function getTokens(): CreateTokenResponse | null {
  if (typeof window === 'undefined') return null;

  try {
    const currentTgId = localStorage.getItem(CURRENT_USER_KEY);
    if (!currentTgId) {
      return null;
    }

    const accessToken = localStorage.getItem(getAccessTokenKey(currentTgId));
    const refreshToken = localStorage.getItem(getRefreshTokenKey(currentTgId));

    if (!accessToken || !refreshToken) {
      return null;
    }

    return { accessToken, refreshToken };
  } catch (error) {
    console.error('Ошибка при получении токенов:', error);
    return null;
  }
}

/**
 * Удаляет токены из localStorage для текущего пользователя
 */
export function clearTokens(): void {
  if (typeof window === 'undefined') return;

  try {
    const currentTgId = localStorage.getItem(CURRENT_USER_KEY);
    if (currentTgId) {
      localStorage.removeItem(getAccessTokenKey(currentTgId));
      localStorage.removeItem(getRefreshTokenKey(currentTgId));
    }
    localStorage.removeItem(CURRENT_USER_KEY);

    // Удаляем заголовок авторизации из текущего экземпляра axios
    api.defaults.headers.common['Authorization'] = '';
  } catch (error) {
    console.error('Ошибка при удалении токенов:', error);
  }
}

/**
 * Обновляет заголовок авторизации в текущем экземпляре axios
 */
export function updateAuthHeader(accessToken: string): void {
  if (accessToken) {
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  } else {
    api.defaults.headers.common['Authorization'] = '';
  }
}
