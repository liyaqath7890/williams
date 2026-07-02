import axios from 'axios';

function trimTrailingSlash(value) {
  return value ? value.replace(/\/+$/, '') : value;
}

const defaultBaseUrl = import.meta.env.DEV
  ? 'http://localhost:5000/api/v1'
  : (trimTrailingSlash(import.meta.env.VITE_API_BASE_URL) || `${trimTrailingSlash(window.location.origin)}/api/v1`);

export const httpClient = axios.create({
  baseURL: defaultBaseUrl,
  timeout: 15000,
  withCredentials: true
});

httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('aegis_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
