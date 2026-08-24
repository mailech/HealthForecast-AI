import api from './api';

export const patientService = {
  getAll: async () => (await api.get('/patients/')).data,
  getById: async (id) => (await api.get(`/patients/${id}`)).data,
  create: async (data) => (await api.post('/patients/', data)).data,
};
