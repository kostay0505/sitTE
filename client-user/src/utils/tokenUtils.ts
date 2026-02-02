export interface TokenPayload {
  sub: string;
  exp: number;
  iat: number;
  ip?: string;
  [key: string]: any;
}

export function extractTokenData(token: string): TokenPayload | null {
  try {
    if (!token) return null;

    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Неверный формат JWT токена');
      return null;
    }

    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (error) {
    console.error('Ошибка при извлечении данных из токена:', error);
    return null;
  }
}

export function extractTgIdFromToken(token: string): string | null {
  const payload = extractTokenData(token);
  return payload?.sub || null;
}

export function isTokenExpired(token: string): boolean {
  try {
    if (!token) return true;

    const payload = extractTokenData(token);
    if (!payload) return true;

    return payload.exp * 1000 < Date.now();
  } catch (error) {
    console.error('Ошибка при проверке срока токена:', error);
    return true;
  }
}

export function isTokenForCurrentUser(
  token: string,
  currentTgId: string,
): boolean {
  const tokenTgId = extractTgIdFromToken(token);
  return tokenTgId === currentTgId;
}
