import axios from 'axios';

const getCleanBaseURL = () => {
  const rawUrl = import.meta.env?.VITE_API_BASE_URL || import.meta.env?.VITE_API_URL || 'https://healthforecast-ai-nkmn.onrender.com/api/v1';
  let cleaned = (rawUrl || '').trim().replace(/\/+$/, '');
  if (!cleaned) {
    return 'https://healthforecast-ai-nkmn.onrender.com/api/v1';
  }
  if (!cleaned.endsWith('/api/v1')) {
    cleaned = `${cleaned}/api/v1`;
  }
  return cleaned;
};

const API_BASE_URL = getCleanBaseURL();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (config.url && config.url.startsWith('/api/v1')) {
      config.url = config.url.substring(7);
      if (!config.url.startsWith('/')) {
        config.url = '/' + config.url;
      }
    }

    const token = localStorage.getItem('hf_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 1. Genuine Network Level Error (Server is offline / unreachable)
    if (!error.response) {
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        return Promise.reject(
          new Error(`Cannot connect to backend server at ${API_BASE_URL}. Please check network connection.`)
        );
      }
      return Promise.reject(new Error(error.message || 'Connection error. Please check backend server.'));
    }

    // 2. Server responded with HTTP status code
    const status = error.response.status;
    const detail = error.response.data?.detail;

    let formattedMsg = '';

    if (Array.isArray(detail)) {
      formattedMsg = detail.map((item) => item.msg || item.message || JSON.stringify(item)).join(', ');
    } else if (typeof detail === 'string') {
      formattedMsg = detail;
    } else if (typeof detail === 'object' && detail !== null) {
      formattedMsg = detail.message || JSON.stringify(detail);
    }

    if (!formattedMsg) {
      if (status === 400) formattedMsg = 'Bad request. Please verify input data.';
      else if (status === 401) formattedMsg = 'Session expired or not authenticated. Please log in again.';
      else if (status === 403) formattedMsg = 'Permission denied. You do not have authorization for this action.';
      else if (status === 404) formattedMsg = 'Requested resource not found.';
      else if (status >= 500) formattedMsg = `Backend server error (${status}). Please contact administrator.`;
      else formattedMsg = error.message || `Request failed with status ${status}`;
    }

    const err = new Error(formattedMsg);
    err.status = status;
    err.response = error.response;
    return Promise.reject(err);
  }
);

export default api;