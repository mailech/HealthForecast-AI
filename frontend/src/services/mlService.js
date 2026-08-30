import api from './api';

export const mlService = {
  getMetrics: async () => {
    const response = await api.get('/ml/metrics');
    return response.data;
  },

  predict: async (payload) => {
    const response = await api.post('/ml/predict', payload);
    return response.data;
  },

  retrain: async () => {
    const response = await api.post('/ml/retrain');
    return response.data;
  }
};
