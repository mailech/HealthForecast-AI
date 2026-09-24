import api from './api';

export const patientService = {
  getAll: async () => {
    const response = await api.get('/patients/');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/patients/', data);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/patients/${id}`);
  },

  getTimeline: async (id) => {
    const response = await api.get(`/patients/${id}/timeline`);
    return response.data;
  },
};