import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { clearTokens, getTokens, saveTokens } from '@/api/auth/tokenStorage';
import { refreshToken } from '@/api/auth/methods';
import { ENVIRONMENT_CONFIG } from '@/config/environment';

export const apiUrl = ENVIRONMENT_CONFIG.API_URL;

export const api = axios.create({
  baseURL: apiUrl,
});

// Интерцептор запросов для добавления токена
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const tokens = getTokens();

    if (tokens && tokens.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }

    return config;
  },
  error => Promise.reject(error),
);

let isRefreshing = false;
let failedQueue: {
  resolve: Function;
  reject: Function;
  originalRequest: any;
}[] = [];

// Функция для обработки очереди запросов
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.originalRequest.headers.Authorization = `Bearer ${token}`;
      prom.resolve(axios(prom.originalRequest));
    }
  });

  failedQueue = [];
};

// Интерцептор ответов для обновления токена при ошибке 401
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async error => {
    const originalRequest = error.config;

    // Если ошибка 401 и запрос еще не повторялся и это не запрос на обновление токена
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/token/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, originalRequest });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const tokens = getTokens();
      if (tokens && tokens.refreshToken) {
        try {
          const response = await refreshToken({
            refreshToken: tokens.refreshToken,
          });

          if ('accessToken' in response && 'refreshToken' in response) {
            saveTokens(response);
            originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;

            processQueue(null, response.accessToken);
            isRefreshing = false;

            return axios(originalRequest);
          } else {
            clearTokens();
            processQueue(new Error('Не удалось обновить токен'));
            isRefreshing = false;
            return Promise.reject(error);
          }
        } catch (refreshError) {
          console.error('Не удалось обновить токен:', refreshError);
          clearTokens();
          processQueue(refreshError);
          isRefreshing = false;

          return Promise.reject(error);
        }
      } else {
        clearTokens();
        isRefreshing = false;
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);
