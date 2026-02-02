import axios, { AxiosResponse } from 'axios';
import { ENVIRONMENT_CONFIG } from '@/config/environment';

export const apiUrl = ENVIRONMENT_CONFIG.API_URL;

export const api = axios.create({
  baseURL: apiUrl,
  withCredentials: true, // Важно для отправки cookies
});

// Функция для перенаправления на авторизацию
const handleAuthError = () => {
  if (typeof window !== 'undefined') {
    api.post('/auth/admin/logout').catch(() => {
    });
    setTimeout(() => {
      window.location.href = '/admin/login';
    }, 100);
  }
};

// Интерцептор ответов для обработки ошибок авторизации
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    // Если ошибка 401 и запрос еще не повторялся
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/admin')
    ) {
      originalRequest._retry = true;

      try {
        // Пытаемся обновить токены через cookies
        await api.post('/auth/admin/refresh');

        // Повторяем оригинальный запрос
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Не удалось обновить токен администратора');
        handleAuthError();
        return Promise.reject(error);
      }
    }

    // Если это ошибка авторизации без возможности refresh
    if (error.response?.status === 401 || error.response?.status === 403) {
      handleAuthError();
    }

    return Promise.reject(error);
  }
);