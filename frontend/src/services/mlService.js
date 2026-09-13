import api from './api';

export const mlService = {
  getMetrics: async () => {
    const response = await api.get('/ml/metrics');
    return response.data;
  },

  getVersion: async () => {
    const response = await api.get('/ml/version');
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get('/ml/history');
    return response.data;
  },

  getRetrainStatus: async () => {
    const response = await api.get('/ml/retrain/status');
    return response.data;
  },

  predict: async (payload) => {
    const response = await api.post('/ml/predict', payload);
    return response.data;
  },

  retrain: async (payload = {}) => {
    const response = await api.post('/ml/retrain', payload);
    return response.data;
  }
};

