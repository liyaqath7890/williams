import { httpClient } from '../api/httpClient';

export const sosService = {
  createSos: (payload) => httpClient.post('/sos', payload),
  listSos: () => httpClient.get('/sos'),
  updateSos: (id, payload) => httpClient.patch(`/sos/${id}`, payload)
};
