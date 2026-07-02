import { httpClient } from '../api/httpClient';

export const authService = {
  login: (payload) => httpClient.post('/auth/login', payload),
  register: (payload) => httpClient.post('/auth/register', payload),
  refresh: () => httpClient.post('/auth/refresh'),
  logout: () => httpClient.post('/auth/logout'),
  me: () => httpClient.get('/auth/me')
};
