import api from './api';

export const analyticsService = {
  getDashboard: async () => (await api.get('/analytics/dashboard')).data,
};
