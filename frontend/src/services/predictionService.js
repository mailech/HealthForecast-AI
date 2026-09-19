import api from './api';

export const predictionService = {
  predict: async (patientData) => {
    const response = await api.post('/predictions/predict', patientData);
    return response.data;
  },
  getHistory: async (patientId) => {
    const response = await api.get(`/predictions/patient/${patientId}`);
    return response.data;
  },
};

