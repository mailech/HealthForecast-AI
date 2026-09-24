import api from './api';

export const analyticsService = {
  getDashboard: async () => (await api.get('/analytics/dashboard')).data,
  getOperations: async (period = 'this_week') => (await api.get(`/analytics/operations?period=${period}`)).data,
};

