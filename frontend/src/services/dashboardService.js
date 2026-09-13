import api from './api';

export const dashboardService = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  getReadmissionOverview: async () => {
    const response = await api.get('/dashboard/readmission-overview');
    return response.data;
  },

  getDemographics: async (groupBy = 'age') => {
    const response = await api.get('/dashboard/demographics', { params: { group_by: groupBy } });
    return response.data;
  },

  getHospitalPerformance: async () => {
    const response = await api.get('/dashboard/hospital-performance');
    return response.data;
  },

  getTreatmentEffectiveness: async () => {
    const response = await api.get('/dashboard/treatment-effectiveness');
    return response.data;
  },

  getAdvancedAnalytics: async () => {
    const response = await api.get('/dashboard/advanced-analytics');
    return response.data;
  },
};


