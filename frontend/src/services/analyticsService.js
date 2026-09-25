import api from './api';

export const analyticsService = {
  getDashboard: async () => (await api.get('/analytics/dashboard')).data,
  getOperations: async (period = 'this_week') => (await api.get(`/analytics/operations?period=${period}`)).data,
  getResearcherAnalytics: async (filters = {}) => {
    const cleanParams = {};
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        cleanParams[key] = filters[key];
      }
    });
    const response = await api.get('/analytics/researcher', { params: cleanParams });
    return response.data;
  },
  compareCohorts: async (cohortA, cohortB) => {
    const response = await api.post('/analytics/researcher/compare', {
      cohort_a: cohortA,
      cohort_b: cohortB,
    });
    return response.data;
  },
  exportCohortCsv: async (filters = {}) => {
    const cleanParams = {};
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        cleanParams[key] = filters[key];
      }
    });
    const response = await api.get('/analytics/researcher/export', {
      params: cleanParams,
      responseType: 'blob',
    });
    return response.data;
  },
};

