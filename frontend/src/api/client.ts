import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenMemory } from '@/utils/tokenMemory';
import { storage } from '@/utils/storage';
import { ROUTES } from '@/utils/constants';
import type { ApiErrorResponse, ApiResponse } from '@/types';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** Bare client for refresh — no auth interceptor / no retry loop. */
const refreshClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post<ApiResponse<{ accessToken: string }>>('/auth/refresh')
      .then((response) => {
        const token = response.data.data?.accessToken ?? null;
        if (token) {
          tokenMemory.set(token);
        } else {
          tokenMemory.clear();
        }
        return token;
      })
      .catch(() => {
        tokenMemory.clear();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

function redirectToLogin(): void {
  tokenMemory.clear();
  storage.clearAuthPreferences();
  if (window.location.pathname !== ROUTES.LOGIN) {
    window.location.href = ROUTES.LOGIN;
  }
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenMemory.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const url = original?.url ?? '';

    const isAuthRefreshOrLogin =
      url.includes('/auth/refresh') || url.includes('/auth/login');

    if (status === 401 && original && !original._retry && !isAuthRefreshOrLogin) {
      original._retry = true;
      const newToken = await refreshAccessToken();
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      }
      redirectToLogin();
    }

    return Promise.reject(error);
  },
);

export { refreshAccessToken };
