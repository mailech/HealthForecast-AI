import api from './api';

export const patientService = {
  getPatients: async (params = {}) => {
    const response = await api.get('/patients', { params });
    return response.data;
  },

  getPatientById: async (id) => {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },

  createPatient: async (patientData) => {
    const response = await api.post('/patients', patientData);
    return response.data;
  },

  createPatientWithAdmission: async (data) => {
    const response = await api.post('/patients/with-admission', data);
    return response.data;
  },
};
