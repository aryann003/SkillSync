import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { authStore } from "../store/authStore";
import { clearTokens } from "../utils/token";

interface RetryConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

const client = axios.create({
  baseURL: "http://127.0.0.1:8000/api/"
});

let isRefreshing = false;
let queue: Array<(token: string | null) => void> = [];

const flushQueue = (token: string | null) => {
  queue.forEach((cb) => cb(token));
  queue = [];
};

client.interceptors.request.use((config) => {
  const token = authStore.getState().accessToken;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;
    if (!original || error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    original._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push((token) => {
          if (!token) {
            reject(error);
            return;
          }
          original.headers = original.headers ?? {};
          original.headers.Authorization = `Bearer ${token}`;
          resolve(client(original));
        });
      });
    }

    isRefreshing = true;

    try {
      const refresh = authStore.getState().refreshToken;
      if (!refresh) throw new Error("No refresh token");

      const response = await axios.post<{ access: string }>(
        "http://127.0.0.1:8000/api/token/refresh/",
        { refresh }
      );

      authStore.getState().setTokens({ access: response.data.access, refresh });
      flushQueue(response.data.access);

      original.headers = original.headers ?? {};
      original.headers.Authorization = `Bearer ${response.data.access}`;
      return client(original);
    } catch (refreshError) {
      flushQueue(null);
      clearTokens();
      authStore.getState().logout();
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default client;
