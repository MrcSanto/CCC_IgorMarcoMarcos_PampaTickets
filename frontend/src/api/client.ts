// Cliente axios para o backend FastAPI.
// Token JWT é guardado em localStorage; injetado automaticamente em cada request.

import axios, { type AxiosInstance } from "axios";

const baseURL =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "http://localhost:8000/api";

export const TOKEN_KEY = "pt_token";

export const api: AxiosInstance = axios.create({
  baseURL,
  timeout: 8000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const setToken = (token: string | null) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);
