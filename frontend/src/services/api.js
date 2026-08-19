import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({ baseURL: `${API_URL}/api` });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (username, password) =>
    api.post('/auth/login/json', { username, password }),
  me: () => api.get('/auth/me'),
  listUsers: () => api.get('/auth/users'),
};

export const patientsAPI = {
  list: (skip = 0, limit = 50) => api.get(`/patients/?skip=${skip}&limit=${limit}`),
  get: (id) => api.get(`/patients/${id}`),
  create: (data) => api.post('/patients/', data),
  update: (id, data) => api.put(`/patients/${id}`, data),
};

export const predictionsAPI = {
  dashboardStats: () => api.get('/predictions/dashboard/stats'),
  predictRisk: (patientId, modelType = 'random_forest') =>
    api.post('/predictions/risk', { patient_id: patientId, model_type: modelType }),
  getRiskHistory: (patientId) => api.get(`/predictions/risk/patient/${patientId}`),
  getHighRisk: () => api.get('/predictions/risk/high-risk'),
  forecast: (patientId, days = 30) =>
    api.post('/predictions/forecast', { patient_id: patientId, forecast_period_days: days }),
  getForecasts: (patientId) => api.get(`/predictions/forecast/patient/${patientId}`),
  clinicalInsights: (patientId) => api.get(`/predictions/clinical-insights/${patientId}`),
  modelMetrics: () => api.get('/predictions/models/metrics'),
  trainModels: () => api.post('/predictions/models/train'),
  importDataset: (limit = 500) => api.post(`/predictions/dataset/import?limit=${limit}`),
};

export default api;
